"use strict";

/**
 * Award sprite-sheet generator.
 *
 * Reads `uniform-uploads/manifest.json`, validates every entry against
 * `AwardRegistry.jsx` (the human-owned source of truth for placement),
 * normalizes each source PNG to its target tile geometry, and splices the
 * tile into the correct sprite sheet(s) at the registry-derived row — shifting
 * every lower row down by exactly one tile height. Consumed sources and their
 * manifest entries are then removed.
 *
 * Geometry (load-bearing — see spritesheet-geometry.md):
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

/**
 * Parse a single award's placement out of the registry SOURCE TEXT (never
 * executed). Matches `this.awards.set(<"name"|`name`>, { ... })` for the exact
 * literal name and reads its priorities. Returns null when the name is absent.
 */
function parseAward(registryText, name) {
  const escaped = escapeRegExp(name);
  const re = new RegExp(
    'this\\.awards\\.set\\(\\s*[`"]' + escaped + '[`"]\\s*,\\s*\\{([^}]*)\\}',
  );
  const match = registryText.match(re);
  if (!match) return null;
  const body = match[1];
  const award = {};
  const ap = body.match(/awardPriority\s*:\s*(\d+)/);
  const mp = body.match(/medalPriority\s*:\s*(\d+)/);
  const at = body.match(/awardType\s*:\s*["'`]([A-Za-z]+)["'`]/);
  if (ap) award.awardPriority = Number(ap[1]);
  if (mp) award.medalPriority = Number(mp[1]);
  if (at) award.awardType = at[1];
  return award;
}

/** Read a sheet's raw pixels, matching its existing color mode (RGB vs RGBA). */
async function readSheet(sheetPath) {
  const meta = await sharp(sheetPath).metadata();
  const channels = meta.hasAlpha ? 4 : 3;
  const pipe = meta.hasAlpha
    ? sharp(sheetPath).ensureAlpha()
    : sharp(sheetPath).removeAlpha();
  const data = await pipe.raw().toBuffer();
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
        `insert row y=${ins.y} is negative for "${ins.name}" (${sheetPath})`,
      );
    }
    const rawTile = await tileToRaw(ins.png, channels);
    const expected = width * ins.tileHeight * channels;
    if (rawTile.length !== expected) {
      throw new Error(
        `normalized tile for "${ins.name}" is ${rawTile.length} bytes, expected ${expected} (${width}x${ins.tileHeight}x${channels})`,
      );
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
    const award = parseAward(registryText, entry.name);
    if (!award) {
      errors.push(
        `${label}: "${entry.name}" is not present in AwardRegistry.jsx`,
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
      });
    }
    if (onMedalSheet(award)) {
      const { png, warnings: w } = await normalizeMedal(
        path.join(paths.uploadDir, entry.medal),
      );
      allWarnings.push(...w);
      medalInserts.push({
        y: (award.medalPriority - 2) * MEDAL.tileHeight,
        tileHeight: MEDAL.tileHeight,
        png,
        name: entry.name,
      });
    }
    // Every source file referenced by a processed entry is cleaned up — even
    // an ignored extra source — so nothing lingers to re-trigger the workflow.
    for (const kind of ["ribbon", "medal"]) {
      if (typeof entry[kind] === "string") consumed.add(entry[kind]);
    }
  }

  // Compute both spliced sheets fully before writing either, so a decode/IO
  // failure on the second sheet can't leave the first overwritten.
  const ribbonPlan = await buildSplicedSheet(paths.ribbonSheet, ribbonInserts);
  const medalPlan = await buildSplicedSheet(paths.medalSheet, medalInserts);
  if (ribbonPlan) await writeSheet(paths.ribbonSheet, ribbonPlan);
  if (medalPlan) await writeSheet(paths.medalSheet, medalPlan);

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
  parseAward,
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
