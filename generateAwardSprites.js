"use strict";

/**
 * Award sprite-sheet generator.
 *
 * Reads `uniform-uploads/manifest.json`, validates every entry against
 * `constants/awardCatalog.js` (the human-owned source of truth for placement,
 * imported as a module — see loadCatalog), normalizes each source PNG to its
 * target tile geometry, and splices the tile into the correct sprite sheet(s)
 * at the catalog-derived row. An in-bounds insert shifts every lower row down
 * by its tile height (N inserts shift the bottom band down by N tiles); an
 * insert past the current end pads the sub-tile remainder with transparency
 * and appends without shifting anything. An entry flagged `replace: true`
 * overwrites the tile already at
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
 * Run via `npm run sprites:generate` to process the real manifest, or require
 * it as a module to use the exported helpers in tests. Prefer the npm script
 * over a bare `node generateAwardSprites.js`: it carries the flag that mutes
 * Node's MODULE_TYPELESS_PACKAGE_JSON notice for the imported catalog. That
 * notice points at `client/package.json`, and marking THAT `"type": "module"`
 * would require converting `client/next.config.js`, which is CommonJS. Do not
 * add `"type"` to the root package.json instead — it would break this
 * generator and silence nothing.
 */

const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const sharp = require("sharp");

const ROOT = __dirname;

const DEFAULT_PATHS = {
  uploadDir: path.join(ROOT, "uniform-uploads"),
  manifest: path.join(ROOT, "uniform-uploads", "manifest.json"),
  catalog: path.join(
    ROOT,
    "client/app/uniformbuilder/modules/constants/awardCatalog.js",
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

/** Does this award have a tile on the ribbon sheet? */
function onRibbonSheet(award) {
  return (
    !!award &&
    RIBBON_SHEET_TYPES.has(award.awardType) &&
    award.awardPriority !== undefined
  );
}

/** Does this award have a tile on the medal sheet? */
function onMedalSheet(award) {
  return (
    !!award &&
    MEDAL_SHEET_TYPES.has(award.awardType) &&
    award.medalPriority !== undefined &&
    award.medalPriority >= MEDAL_MIN_PRIORITY
  );
}

/**
 * Index an AWARD_CATALOG array by award name.
 *
 * Throws on a malformed catalog rather than returning a partial index: a
 * nameless entry or a duplicate name means the app's own AwardRegistry Map is
 * broken too (it keys on the same field, so the LAST duplicate silently wins
 * and the earlier one vanishes), so failing here surfaces it instead of
 * quietly misplacing a tile.
 *
 * An empty array is rejected for a sharper reason. AWARD_CATALOG is a
 * hand-maintained file of ~100 awards, so zero entries never means "no awards
 * yet" — it means the module resolved but the data did not come with it.
 * Without this, every manifest entry fails as "not present in the award
 * catalog", which is the same misdirection that hid the original breakage: it
 * sends the operator off to re-check the spelling of an award they just added.
 */
function indexCatalog(entries) {
  if (!Array.isArray(entries)) {
    throw new Error(
      `award catalog must export AWARD_CATALOG as an array, got ${typeof entries}`,
    );
  }
  if (entries.length === 0) {
    throw new Error(
      "award catalog exported AWARD_CATALOG as an EMPTY array; the module " +
        "resolved but carried no awards, so the generator is not reading the " +
        "data you edited. Check that AWARD_CATALOG is still the exported name " +
        "and that the array literal is intact.",
    );
  }
  const byName = new Map();
  entries.forEach((entry, i) => {
    if (!entry || typeof entry.name !== "string" || entry.name === "") {
      throw new Error(`award catalog entry ${i} has no usable "name"`);
    }
    if (byName.has(entry.name)) {
      throw new Error(
        `award catalog has a duplicate name "${entry.name}" (entry ${i})`,
      );
    }
    byName.set(entry.name, entry);
  });
  return byName;
}

/**
 * Import the award catalog and index it by name.
 *
 * The catalog is imported, not parsed as text: it is the same module the
 * uniform builder renders from, so the generator and the app can never
 * disagree about which row an award sits in. (They can still disagree about
 * NAMES — the app resolves through AwardRegistry.getAwardDetails, which strips
 * valor devices first, while lookupAward here is exact-match.) That coupling
 * is the point — a refactor that moves or renames this data now breaks the
 * import loudly instead of leaving a text matcher quietly finding nothing.
 *
 * Imported by file URL so absolute Windows paths resolve; `await import` of an
 * ES module is why every caller of this is async.
 */
async function loadCatalog(catalogPath) {
  const mod = await import(pathToFileURL(catalogPath).href);
  return indexCatalog(mod.AWARD_CATALOG);
}

/** Look up one award's details by name, or null when it is not in the catalog. */
function lookupAward(catalog, name) {
  return catalog.get(name) ?? null;
}

// What each placement field must hold to be usable. One table so the check can
// never drift field-by-field, and so adding a field is one line here.
const FIELD_IS_USABLE = {
  awardPriority: (v) => Number.isInteger(v) && v >= 0,
  medalPriority: (v) => Number.isInteger(v) && v >= 0,
  awardType: (v) => typeof v === "string" && v !== "",
};

/**
 * Names of placement fields the award states but fills with a value the
 * splicer cannot use as a row index or a sheet-membership key.
 *
 * Guards the dangerous case: a field set to something unusable would otherwise
 * read as "field not set," making the award look like a non-member of that
 * sheet. The manifest-side check catches this too whenever a source for that
 * sheet is supplied, so what survives here is the case where none is: the
 * award silently loses a tile it was meant to have, and the operator is told
 * it is not on that sheet rather than that the field is broken.
 *
 * Keyed on whether the field is WRITTEN, not on `!== undefined`, because the
 * two mean opposite things here. An entry that omits `medalPriority` is a
 * legitimate ribbon-only award. An entry that spells the key out and lands on
 * `undefined` — a mistyped `AwardType.Medl`, a constant deleted out from under
 * it, a spread of a half-built object — has declared an intent to sit on the
 * medal sheet and must be rejected. Collapsing those two would splice the
 * ribbon tile, skip the medal tile, and still exit 0.
 *
 * Note this cannot catch a MISSPELLED key (`medalPriorty: 5`), which reads as
 * omitted. Neither could the text matcher this replaced. See the manifest-side
 * checks in validateManifest for the other half of that problem.
 */
function malformedFields(award) {
  return Object.keys(FIELD_IS_USABLE).filter(
    (key) => Object.hasOwn(award, key) && !FIELD_IS_USABLE[key](award[key]),
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
 * order, each at its catalog-derived `y`, on the progressively grown sheet
 * (correctly interleaving multiple inserts at their final positions). When a
 * row lands at or beyond the current end — a new bottom-most award, given the
 * sub-tile remainder — the sheet is padded with transparency up to `y` so the
 * tile sits at its exact consumer-read position.
 *
 * An entry with `replace: true` overwrites the tile already at `y` in place:
 * no shift, no height change. It is used to fix the art of an award that
 * already has a tile, and errors only if `y` is at or past the sheet end (no
 * row to overwrite). The bottom-most award's partial final row is a valid
 * target — the copy clamps to the bytes remaining there.
 *
 * Replaces and inserts must NOT be mixed in one call: a replace copies into an
 * absolute byte offset derived from the catalog row, but an insert grows the
 * buffer and shifts every lower row down, so a replace sorted after an insert
 * would land on the shifted neighbour instead of its target — overwriting the
 * wrong award while the intended one stays broken, with the run still exiting
 * 0. We reject the mix here (and in validateManifest) rather than try to
 * reconcile the two offset spaces.
 */
async function buildSplicedSheet(sheetPath, inserts) {
  if (inserts.length === 0) return null;
  const hasReplace = inserts.some((i) => i.replace);
  const hasInsert = inserts.some((i) => !i.replace);
  if (hasReplace && hasInsert) {
    throw new Error(
      `cannot mix a replace and an insert on the same sheet in one run (${sheetPath}); ` +
        `an insert shifts the buffer and would send the replace to the wrong row — ` +
        `split them across separate runs`,
    );
  }
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
      // Gate on the row's *start*, not its full height: the bottom-most award
      // sits in the sheet's sub-tile remainder (the real ribbon sheet is 783px
      // = 55*14 + 13, so its last row is only 13px), and `rawTile.copy` clamps
      // to the bytes actually left, writing the partial row without overrun.
      if (ins.y >= height) {
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
      // transparency, then place the tile at its exact catalog row.
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
 * Why the catalog does not place this award on `kind`'s sheet, phrased for a
 * contributor who has just asserted the opposite by supplying art for it.
 *
 * Checks the reasons in the same order membership is gated, rather than
 * shortcutting on what the caller has already ruled out. A wrong reason is
 * worse here than no reason: it sends someone to fix a field that was never
 * the problem, and the caller's preconditions are not visible from inside.
 */
function sheetExclusionReason(award, kind) {
  const types = kind === "ribbon" ? RIBBON_SHEET_TYPES : MEDAL_SHEET_TYPES;
  if (!types.has(award.awardType)) {
    return `its awardType "${award.awardType}" is not one of ${[...types].join(", ")}`;
  }
  if (kind === "ribbon") return "it has no awardPriority";
  if (award.medalPriority === undefined) return "it has no medalPriority";
  return `its medalPriority ${award.medalPriority} is below ${MEDAL_MIN_PRIORITY}, the sheet's first row`;
}

// Every key a manifest entry may carry. Anything else is rejected rather than
// ignored, because `replace` is read as a strict `=== true`: a near-miss
// spelling ("replaced") reads as absent, which quietly downgrades a replace
// into an insert and shifts every row below the target down by one tile. That
// is the same class of silent row divergence the replace/insert mix guard
// exists to prevent, reached by a different route and with no diagnostic.
const MANIFEST_KEYS = ["name", "ribbon", "medal", "replace"];

/**
 * Validate the manifest against the award catalog (a name-indexed Map from
 * {@link loadCatalog}). Returns { errors }; non-empty means the run must abort
 * before any image is written.
 *
 * Every condition here is an error, never a warning. This tool deletes its
 * sources and empties the manifest on success, and CI opens a PR from that, so
 * a warning is indistinguishable from approval by the time anyone reads it —
 * the inputs that would prove something was skipped are already gone.
 */
function validateManifest(manifest, catalog, uploadDir) {
  const errors = [];
  if (!Array.isArray(manifest)) {
    errors.push("manifest.json must be a JSON array of entries");
    return { errors };
  }
  const seen = new Set();
  // Per-sheet record of which placement modes appear (true = replace, false =
  // insert). A sheet that sees both in one run is rejected below: mixing them
  // corrupts the wrong row (see buildSplicedSheet).
  const ribbonModes = new Set();
  const medalModes = new Set();
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
    const unknown = Object.keys(entry).filter(
      (k) => !MANIFEST_KEYS.includes(k),
    );
    if (unknown.length > 0) {
      errors.push(
        `${label}: "${entry.name}" has unrecognised key(s) (${unknown.join(", ")}); ` +
          `allowed keys are ${MANIFEST_KEYS.join(", ")} — check the spelling`,
      );
      return;
    }
    if (entry.replace !== undefined && typeof entry.replace !== "boolean") {
      errors.push(
        `${label}: "${entry.name}" has a non-boolean "replace" (must be true or false)`,
      );
      return;
    }
    const award = lookupAward(catalog, entry.name);
    if (!award) {
      errors.push(
        `${label}: "${entry.name}" is not present in the award catalog (awardCatalog.js)`,
      );
      return;
    }
    // A field that is set but unusable must abort, separate from "name absent"
    // and "not a sheet member": otherwise an award whose (say) medalPriority
    // holds a bad value looks like a non-member. With no medal source supplied
    // there is nothing else to notice the mismatch, so the ribbon tile goes in,
    // its source is consumed, and the medal tile is silently never placed.
    const malformed = malformedFields(award);
    if (malformed.length > 0) {
      errors.push(
        `${label}: "${entry.name}" has catalog field(s) that are present but unusable (${malformed.join(", ")}); fix the entry in awardCatalog.js`,
      );
      return;
    }
    if (award.awardType === undefined) {
      errors.push(
        `${label}: "${entry.name}" has no usable awardType in the award catalog`,
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
        // Two humans contradicting each other, not a stray file: the manifest
        // asserts this award has art for this sheet, the catalog gives it
        // nowhere to go. Warning here would place the other tile, consume that
        // tile's source and empty the manifest, shipping the award half-placed
        // while the warning reads as "correct, this one is ribbon-only". An
        // omitted priority is the legitimate way to say "no tile on that
        // sheet", so the supplied source is the only signal saying otherwise
        // and it must not be discarded.
        errors.push(
          `${label}: "${entry.name}" supplies a "${kind}" source but the catalog does not ` +
            `place it on the ${kind} sheet — ${sheetExclusionReason(award, kind)}. Either fix ` +
            `the award in awardCatalog.js, or drop "${kind}" from this manifest entry.`,
        );
      }
    };
    check("ribbon", needRibbon);
    check("medal", needMedal);
    const isReplace = entry.replace === true;
    if (needRibbon) ribbonModes.add(isReplace);
    if (needMedal) medalModes.add(isReplace);
  });
  [
    ["ribbon", ribbonModes],
    ["medal", medalModes],
  ].forEach(([sheet, modes]) => {
    if (modes.has(true) && modes.has(false)) {
      errors.push(
        `the ${sheet} sheet has both a replace and an insert in one run; ` +
          `an insert shifts the buffer and would send the replace to the wrong row — ` +
          `process them in separate uploads`,
      );
    }
  });
  return { errors };
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
  const catalog = await loadCatalog(paths.catalog);

  const { errors } = validateManifest(manifest, catalog, paths.uploadDir);
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
  // Only the normalizers warn now — geometry that was accepted but reshaped.
  const allWarnings = [];

  for (const entry of manifest) {
    const award = lookupAward(catalog, entry.name);
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
  const tmpFor = (dest) => dest + ".tmp.png";
  try {
    const renames = [];
    for (const [dest, plan] of pending) {
      const tmp = tmpFor(dest);
      await writeSheet(tmp, plan);
      renames.push([tmp, dest]);
    }
    // The renames are the only mutation and run last. Two destinations can't be
    // made truly atomic: if the second rename throws (e.g. an EXDEV cross-device
    // move between a /tmp build dir and the repo), sheet one is already replaced
    // and sheet two is stale. The manifest is NOT emptied in that case, so the
    // next run re-processes the same entries against the already-modified sheet
    // and would double-apply — a partial-rename crash must be reconciled by hand
    // (restore both sheets from git, then re-run).
    renames.forEach(([tmp, dest]) => fs.renameSync(tmp, dest));
  } finally {
    // Best-effort: remove any tmp that didn't get renamed (write failure or a
    // partial-rename crash) so a failed run never litters the repo with orphans.
    pending.forEach(([dest]) => {
      const tmp = tmpFor(dest);
      if (fs.existsSync(tmp)) {
        try {
          fs.unlinkSync(tmp);
        } catch {
          /* nothing more we can do */
        }
      }
    });
  }

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
  indexCatalog,
  loadCatalog,
  lookupAward,
  malformedFields,
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
