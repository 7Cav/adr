"use strict";

/**
 * Award sprite-sheet generator.
 *
 * Reads `uniform-uploads/manifest.json`, validates every entry against
 * `AwardRegistry.jsx` (the human-owned source of truth for placement),
 * normalizes each source PNG to its target tile geometry, and splices the
 * tile into the correct sprite sheet(s) at the registry-derived row. An
 * in-bounds insert shifts every lower row down by its tile height (N inserts
 * shift the bottom band down by N tiles); an insert past the current end pads
 * the sub-tile remainder with transparency and appends without shifting
 * anything. An entry flagged `replace: true` overwrites the tile already at
 * that row in place — no shift, no growth — to fix the art of an award that
 * already has a tile. Consumed sources and their manifest entries are then
 * removed.
 *
 * Geometry (load-bearing):
 *   Ribbon: tile 43x14, row y = awardPriority * 14
 *   Medal:  tile 70x120, row y = (medalPriority - 2) * 120
 *
 * Sheet membership is awardType-gated: only mainline medal/ribbon awards live
 * in these two sheets (Tabs, weapon quals, unit citations, and badges render
 * from other assets). See RIBBON_SHEET_TYPES / MEDAL_SHEET_TYPES below.
 *
 * Run directly (`node generateAwardSprites.js`) to process the real manifest,
 * or require it as a module to use the exported helpers in tests.
 */

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = __dirname;

const DEFAULT_PATHS = {
  uploadDir: path.join(ROOT, "uniform-uploads"),
  manifest: path.join(ROOT, "uniform-uploads", "manifest.json"),
  registry: path.join(
    ROOT,
    "client/app/uniformbuilder/modules/AwardRegistry.jsx",
  ),
  ribbonSheet: path.join(
    ROOT,
    "client/public/skunkworks/uniformRibbons/ribbons/ribbonSpriteSheet.png",
  ),
  medalSheet: path.join(
    ROOT,
    "client/public/skunkworks/uniformMedals/medalSpriteSheet.png",
  ),
};

const RIBBON = { width: 43, tileHeight: 14 };
const MEDAL = { width: 70, tileHeight: 120 };

// awardTypes that actually render from each sprite sheet. Awards of any other
// type (UnitCitation, BadgeCombat, WeaponQual, Tab) live in separate assets.
const RIBBON_SHEET_TYPES = new Set([
  "Medal",
  "MedalTiered",
  "MedalWithValor",
  "Ribbon",
  "RibbonDonationLogic",
]);
const MEDAL_SHEET_TYPES = new Set(["Medal", "MedalTiered", "MedalWithValor"]);
// The medal sheet's first row is medalPriority 2 (y = (medalPriority - 2)*120);
// priorities 0/1 (the Lifetime medals) are not on it.
const MEDAL_MIN_PRIORITY = 2;

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Does this parsed award have a tile on the ribbon sheet? */
function onRibbonSheet(award) {
  return (
    !!award &&
    RIBBON_SHEET_TYPES.has(award.awardType) &&
    award.awardPriority !== undefined
  );
}

/** Does this parsed award have a tile on the medal sheet? */
function onMedalSheet(award) {
  return (
    !!award &&
    MEDAL_SHEET_TYPES.has(award.awardType) &&
    award.medalPriority !== undefined &&
    award.medalPriority >= MEDAL_MIN_PRIORITY
  );
}

// Field matchers, shared by the parser and the present-but-unparsed check so
// the two can never drift on what counts as a valid value.
const FIELD_RE = {
  awardPriority: /awardPriority\s*:\s*(\d+)/,
  medalPriority: /medalPriority\s*:\s*(\d+)/,
  awardType: /awardType\s*:\s*["'`]([A-Za-z]+)["'`]/,
};

/**
 * Extract the brace-balanced object-literal body for a single award out of the
 * registry SOURCE TEXT (never executed). Matches `this.awards.set(<"name"
 * |`name`>, { ... })` for the exact literal name and returns the text between
 * the matching braces, or null when the name is absent. Brace-balanced (rather
 * than stopping at the first `}`) so an entry containing a nested object is
 * captured in full instead of being truncated mid-entry.
 */
function extractAwardBody(registryText, name) {
  const escaped = escapeRegExp(name);
  const head = new RegExp(
    'this\\.awards\\.set\\(\\s*[`"]' + escaped + '[`"]\\s*,\\s*\\{',
  );
  const m = registryText.match(head);
  if (!m) return null;
  const start = m.index + m[0].length; // first char after the opening "{"
  let depth = 1;
  let i = start;
  for (; i < registryText.length && depth > 0; i++) {
    const ch = registryText[i];
    if (ch === "{") depth++;
    else if (ch === "}") depth--;
  }
  if (depth !== 0) return null; // unbalanced — treat as not found
  return registryText.slice(start, i - 1);
}

/**
 * Parse a single award's placement out of the registry source text. Returns
 * null when the name is absent, otherwise an object with whatever of
 * `awardPriority`/`medalPriority`/`awardType` parsed. A field that is present
 * in the registry but fails to parse comes back absent here — callers must run
 * {@link unparsedFields} to reject that case rather than treat it as "field
 * not set," or a placement can be silently dropped.
 */
function parseAward(registryText, name) {
  const body = extractAwardBody(registryText, name);
  if (body === null) return null;
  const award = {};
  const ap = body.match(FIELD_RE.awardPriority);
  const mp = body.match(FIELD_RE.medalPriority);
  const at = body.match(FIELD_RE.awardType);
  if (ap) award.awardPriority = Number(ap[1]);
  if (mp) award.medalPriority = Number(mp[1]);
  if (at) award.awardType = at[1];
  return award;
}

/**
 * Names of fields that appear (as a `key:`) in the award's registry body but
 * whose value did not parse — the dangerous case the parser would otherwise
 * drop silently. Returns [] when the name is absent or every present field
 * parsed cleanly.
 */
function unparsedFields(registryText, name) {
  const body = extractAwardBody(registryText, name);
  if (body === null) return [];
  return Object.keys(FIELD_RE).filter(
    (key) =>
      new RegExp("\\b" + key + "\\s*:").test(body) && !FIELD_RE[key].test(body),
  );
}

/**
 * Read a sheet's raw RGBA pixels. Both production sheets are RGBA; we assert it
 * rather than silently handling RGB so a future flatten-on-export fails loud
 * here instead of running an untested 3-channel path.
 */
async function readSheet(sheetPath) {
  const meta = await sharp(sheetPath).metadata();
  if (!meta.hasAlpha) {
    throw new Error(
      `sheet ${path.basename(sheetPath)} has no alpha channel; sprite sheets must be RGBA`,
    );
  }
  const channels = 4;
  const data = await sharp(sheetPath).ensureAlpha().raw().toBuffer();
  return { data, width: meta.width, height: meta.height, channels };
}

/** Render a tile PNG buffer to raw bytes at the sheet's channel count. */
async function tileToRaw(tilePng, channels) {
  const pipe =
    channels === 4
      ? sharp(tilePng).ensureAlpha()
      : sharp(tilePng).removeAlpha();
  return pipe.raw().toBuffer();
}

/**
 * Normalize a ribbon source to a 43x14 tile. Ribbon stripes are vertical, so a
 * vertical stretch from the typical 43x13 source is distortion-free.
 */
async function normalizeRibbon(srcPath) {
  const warnings = [];
  const meta = await sharp(srcPath).metadata();
  if (meta.width !== RIBBON.width || meta.height !== 13) {
    warnings.push(
      `ribbon source ${path.basename(srcPath)} is ${meta.width}x${meta.height}, expected ${RIBBON.width}x13`,
    );
  }
  const png = await sharp(srcPath)
    .resize({ width: RIBBON.width, height: RIBBON.tileHeight, fit: "fill" })
    .png()
    .toBuffer();
  return { png, warnings };
}

/**
 * Normalize a medal source to a 70x120 RGBA tile: scale to fit preserving
 * aspect, place horizontally centered and top-aligned on full transparency.
 */
async function normalizeMedal(srcPath) {
  const warnings = [];
  const fit = await sharp(srcPath)
    .resize({
      width: MEDAL.width,
      height: MEDAL.tileHeight,
      fit: "inside",
      withoutEnlargement: false,
    })
    .png()
    .toBuffer();
  const fitMeta = await sharp(fit).metadata();
  if (fitMeta.height < MEDAL.tileHeight) {
    warnings.push(
      `medal source ${path.basename(srcPath)} fits to ${fitMeta.width}x${fitMeta.height}; aspect is wider than ${MEDAL.width}x${MEDAL.tileHeight}, leaving a ${MEDAL.tileHeight - fitMeta.height}px gap below`,
    );
  } else if (fitMeta.width < MEDAL.width) {
    warnings.push(
      `medal source ${path.basename(srcPath)} fits to ${fitMeta.width}x${fitMeta.height}; aspect is narrower than ${MEDAL.width}x${MEDAL.tileHeight}, leaving ${MEDAL.width - fitMeta.width}px of transparent margin (centered)`,
    );
  }
  const left = Math.round((MEDAL.width - fitMeta.width) / 2);
  const png = await sharp({
    create: {
      width: MEDAL.width,
      height: MEDAL.tileHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: fit, top: 0, left }])
    .png()
    .toBuffer();
  return { png, warnings };
}

/**
 * Splice tiles into a sheet by raw-byte concatenation — the only operation
 * that guarantees every non-inserted row stays byte-identical and the sheet's
 * trailing sub-tile pixels survive. Inserts are applied in ascending row
 * order, each at its registry-derived `y`, on the progressively grown sheet
 * (correctly interleaving multiple inserts at their final positions). When a
 * row lands at or beyond the current end — a new bottom-most award, given the
 * sub-tile remainder — the sheet is padded with transparency up to `y` so the
 * tile sits at its exact consumer-read position.
 *
 * An entry with `replace: true` overwrites the tile already at `y` in place:
 * no shift, no height change. It is used to fix the art of an award that
 * already has a tile, and errors if `y` isn't a full existing row. Replaces and
 * inserts can be mixed in one call; ascending order keeps every `y` (which is
 * always the final registry row) pointing at the right bytes.
 */
async function buildSplicedSheet(sheetPath, inserts) {
  if (inserts.length === 0) return null;
  const sheet = await readSheet(sheetPath);
  let { data, height } = sheet;
  const { width, channels } = sheet;
  const sorted = [...inserts].sort((a, b) => a.y - b.y);
  for (const ins of sorted) {
    if (ins.y < 0) {
      throw new Error(
        `${ins.replace ? "replace" : "insert"} row y=${ins.y} is negative for "${ins.name}" (${sheetPath})`,
      );
    }
    const rawTile = await tileToRaw(ins.png, channels);
    const expected = width * ins.tileHeight * channels;
    if (rawTile.length !== expected) {
      throw new Error(
        `normalized tile for "${ins.name}" is ${rawTile.length} bytes, expected ${expected} (${width}x${ins.tileHeight}x${channels})`,
      );
    }
    if (ins.replace) {
      // Overwrite the existing tile at `y` in place — no shift, no growth.
      if (ins.y + ins.tileHeight > height) {
        throw new Error(
          `replace for "${ins.name}" targets row y=${ins.y} but the sheet is only ${height}px tall; there is no existing tile to overwrite (use an insert for a new award)`,
        );
      }
      rawTile.copy(data, ins.y * width * channels);
      continue; // height unchanged
    }
    if (ins.y <= height) {
      // In-bounds splice: shift everything below `y` down one tile.
      const splitByte = ins.y * width * channels;
      data = Buffer.concat([
        data.subarray(0, splitByte),
        rawTile,
        data.subarray(splitByte),
      ]);
    } else {
      // Append past the end: pad the gap (the sub-tile remainder) with
      // transparency, then place the tile at its exact registry row.
      const pad = Buffer.alloc((ins.y - height) * width * channels);
      data = Buffer.concat([data, pad, rawTile]);
    }
    height = Math.max(height, ins.y) + ins.tileHeight;
  }
  return { data, width, height, channels };
}

/** Write a computed raw sheet buffer back out as a PNG. */
async function writeSheet(sheetPath, plan) {
  const { data, width, height, channels } = plan;
  await sharp(data, { raw: { width, height, channels } })
    .png()
    .toFile(sheetPath);
}

/** Compute and write a spliced sheet in one call (used by tests). */
async function spliceSheet(sheetPath, inserts) {
  const plan = await buildSplicedSheet(sheetPath, inserts);
  if (!plan) return null;
  await writeSheet(sheetPath, plan);
  return { width: plan.width, height: plan.height, channels: plan.channels };
}

/**
 * Validate the manifest against the registry. Returns { errors, warnings }.
 * `errors` non-empty means the run must abort before any image is written.
 */
function validateManifest(manifest, registryText, uploadDir) {
  const errors = [];
  const warnings = [];
  if (!Array.isArray(manifest)) {
    errors.push("manifest.json must be a JSON array of entries");
    return { errors, warnings };
  }
  const seen = new Set();
  manifest.forEach((entry, i) => {
    const label = `entry ${i}`;
    if (!entry || typeof entry.name !== "string" || entry.name === "") {
      errors.push(`${label}: missing required "name"`);
      return;
    }
    if (seen.has(entry.name)) {
      errors.push(`${label}: "${entry.name}" is a duplicate manifest entry`);
      return;
    }
    seen.add(entry.name);
    if (entry.replace !== undefined && typeof entry.replace !== "boolean") {
      errors.push(
        `${label}: "${entry.name}" has a non-boolean "replace" (must be true or false)`,
      );
      return;
    }
    const award = parseAward(registryText, entry.name);
    if (!award) {
      errors.push(
        `${label}: "${entry.name}" is not present in AwardRegistry.jsx`,
      );
      return;
    }
    // A field that is present in the registry but didn't parse must abort,
    // separate from "name absent" and "not a sheet member": otherwise an award
    // whose (say) medalPriority failed to parse looks like a non-member, its
    // medal tile is silently never placed, yet its source is still consumed.
    const unparsed = unparsedFields(registryText, entry.name);
    if (unparsed.length > 0) {
      errors.push(
        `${label}: "${entry.name}" has registry field(s) that are present but could not be parsed (${unparsed.join(", ")}); fix the entry in AwardRegistry.jsx`,
      );
      return;
    }
    if (award.awardType === undefined) {
      errors.push(
        `${label}: "${entry.name}" has no parseable awardType in AwardRegistry.jsx`,
      );
      return;
    }
    const needRibbon = onRibbonSheet(award);
    const needMedal = onMedalSheet(award);
    if (!needRibbon && !needMedal) {
      errors.push(
        `${label}: "${entry.name}" (awardType "${award.awardType ?? "?"}") does not belong to the ribbon or medal sprite sheet; only mainline medals/ribbons are supported`,
      );
      return;
    }
    const check = (kind, need) => {
      if (need) {
        if (typeof entry[kind] !== "string" || entry[kind] === "") {
          errors.push(
            `${label}: "${entry.name}" belongs to the ${kind} sheet but supplies no "${kind}" source file`,
          );
        } else if (!fs.existsSync(path.join(uploadDir, entry[kind]))) {
          errors.push(
            `${label}: "${kind}" source "${entry[kind]}" for "${entry.name}" not found in ${path.basename(uploadDir)}/`,
          );
        }
      } else if (entry[kind]) {
        warnings.push(
          `${label}: "${entry.name}" does not belong to the ${kind} sheet; ignoring its "${kind}" source`,
        );
      }
    };
    check("ribbon", needRibbon);
    check("medal", needMedal);
  });
  return { errors, warnings };
}

/** Write the manifest array back prettier-clean (2-space, trailing newline). */
function writeManifest(manifestPath, entries) {
  fs.writeFileSync(manifestPath, JSON.stringify(entries, null, 2) + "\n");
}

async function run(paths = DEFAULT_PATHS, log = console) {
  const manifest = JSON.parse(fs.readFileSync(paths.manifest, "utf8"));
  if (!Array.isArray(manifest) || manifest.length === 0) {
    log.log("uniform-uploads/manifest.json is empty — nothing to process.");
    return { processed: 0, warnings: [] };
  }
  const registryText = fs.readFileSync(paths.registry, "utf8");

  const { errors, warnings } = validateManifest(
    manifest,
    registryText,
    paths.uploadDir,
  );
  if (errors.length > 0) {
    errors.forEach((e) => log.error(`ERROR: ${e}`));
    throw new Error(
      `manifest validation failed (${errors.length} error(s)); no sprite sheet was modified`,
    );
  }

  // Build insert plans. Normalize everything BEFORE writing any sheet so a bad
  // source aborts the run without leaving a half-written sheet.
  const ribbonInserts = [];
  const medalInserts = [];
  const consumed = new Set();
  const allWarnings = [...warnings];

  for (const entry of manifest) {
    const award = parseAward(registryText, entry.name);
    const replace = entry.replace === true;
    if (onRibbonSheet(award)) {
      const { png, warnings: w } = await normalizeRibbon(
        path.join(paths.uploadDir, entry.ribbon),
      );
      allWarnings.push(...w);
      ribbonInserts.push({
        y: award.awardPriority * RIBBON.tileHeight,
        tileHeight: RIBBON.tileHeight,
        png,
        name: entry.name,
        replace,
      });
      // Only mark a source consumed once its tile is actually going into a
      // sheet — never delete art for a tile that wasn't placed.
      consumed.add(entry.ribbon);
    }
    if (onMedalSheet(award)) {
      const { png, warnings: w } = await normalizeMedal(
        path.join(paths.uploadDir, entry.medal),
      );
      allWarnings.push(...w);
      medalInserts.push({
        y: (award.medalPriority - MEDAL_MIN_PRIORITY) * MEDAL.tileHeight,
        tileHeight: MEDAL.tileHeight,
        png,
        name: entry.name,
        replace,
      });
      consumed.add(entry.medal);
    }
  }

  // Compute both spliced sheets fully before writing either, then encode each
  // to a temp file and only rename into place once BOTH encodes have succeeded.
  // That way a decode/encode failure on the second sheet can't leave the first
  // already overwritten — the renames are the only mutation, and they run last.
  const ribbonPlan = await buildSplicedSheet(paths.ribbonSheet, ribbonInserts);
  const medalPlan = await buildSplicedSheet(paths.medalSheet, medalInserts);
  const pending = [];
  if (ribbonPlan) pending.push([paths.ribbonSheet, ribbonPlan]);
  if (medalPlan) pending.push([paths.medalSheet, medalPlan]);
  const renames = [];
  for (const [dest, plan] of pending) {
    const tmp = dest + ".tmp.png";
    await writeSheet(tmp, plan);
    renames.push([tmp, dest]);
  }
  renames.forEach(([tmp, dest]) => fs.renameSync(tmp, dest));

  // Consume sources and empty the manifest of processed entries.
  consumed.forEach((file) => {
    const p = path.join(paths.uploadDir, file);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  });
  writeManifest(paths.manifest, []);

  allWarnings.forEach((w) => log.warn(`WARN: ${w}`));
  log.log(
    `Processed ${manifest.length} award(s): ` +
      `${ribbonInserts.length} ribbon tile(s)` +
      (ribbonPlan ? ` (sheet now ${ribbonPlan.height}px tall)` : "") +
      `, ${medalInserts.length} medal tile(s)` +
      (medalPlan ? ` (sheet now ${medalPlan.height}px tall)` : "") +
      ".",
  );
  return {
    processed: manifest.length,
    warnings: allWarnings,
    ribbonResult: ribbonPlan && {
      width: ribbonPlan.width,
      height: ribbonPlan.height,
      channels: ribbonPlan.channels,
    },
    medalResult: medalPlan && {
      width: medalPlan.width,
      height: medalPlan.height,
      channels: medalPlan.channels,
    },
  };
}

if (require.main === module) {
  run().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}

module.exports = {
  DEFAULT_PATHS,
  RIBBON,
  MEDAL,
  RIBBON_SHEET_TYPES,
  MEDAL_SHEET_TYPES,
  escapeRegExp,
  extractAwardBody,
  parseAward,
  unparsedFields,
  onRibbonSheet,
  onMedalSheet,
  readSheet,
  normalizeRibbon,
  normalizeMedal,
  buildSplicedSheet,
  writeSheet,
  spliceSheet,
  validateManifest,
  writeManifest,
  run,
};
