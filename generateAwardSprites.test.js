"use strict";

/**
 * Harness for generateAwardSprites.js. No test framework — run with `npm test`
 * (not a bare `node`; the script carries the flag that mutes Node's
 * MODULE_TYPELESS_PACKAGE_JSON notice). Builds synthetic sprite sheets and
 * sources in a temp dir so the real sheets are never touched, then asserts the
 * I/O-matrix edge cases from the spec.
 *
 * One deliberate exception to "synthetic": the first block of main() loads the
 * REAL constants/awardCatalog.js and awardTypes.js, read-only. Those
 * assertions are the entire point of this suite — a fixture cannot catch the
 * award data moving or changing shape, which is how the generator once sat
 * broken for a month with every test green. Do not replace them with a
 * fixture.
 */

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sharp = require("sharp");

const { pathToFileURL } = require("url");

const {
  DEFAULT_PATHS,
  RIBBON_SHEET_TYPES,
  MEDAL_SHEET_TYPES,
  indexCatalog,
  loadCatalog,
  lookupAward,
  malformedFields,
  onRibbonSheet,
  onMedalSheet,
  validateManifest,
  spliceSheet,
  readSheet,
  run,
} = require("./generateAwardSprites");

// Synthetic stand-in for AWARD_CATALOG, in the real catalog's shape: an ordered
// array of plain objects keyed by `name`. Shared by the in-memory Map fixture
// and the on-disk ESM module that run() imports, so both exercise the same
// data through the same indexing code the generator uses in production.
const CATALOG_ENTRIES = [
  {
    name: "Lifetime Medal",
    awardPriority: 0,
    medalPriority: 0,
    awardType: "Medal",
  },
  { name: "Foo Ribbon", awardPriority: 1, awardType: "Ribbon" },
  { name: "Bar Medal", awardPriority: 2, medalPriority: 2, awardType: "Medal" },
  {
    name: `Baz "Q" Service Ribbon`,
    awardPriority: 4,
    medalPriority: 3,
    awardType: "Medal",
  },
  { name: "Ranger Tab", awardPriority: 1, awardType: "Tab" },
  // Carries an unrelated nested field: extra keys must not disturb placement.
  {
    name: "Nested Medal",
    awardPriority: 5,
    style: { x: 1 },
    medalPriority: 4,
    awardType: "Medal",
  },
  // medalPriority is present but not a usable row index — must be rejected
  // loudly rather than read as "no medal tile".
  {
    name: "Broken Medal",
    awardPriority: 6,
    medalPriority: "WIP",
    awardType: "Medal",
  },
  { name: "Typeless Medal", awardPriority: 7, medalPriority: 6 },
];

const CATALOG = indexCatalog(CATALOG_ENTRIES);

// Solid-color RGBA tile as a PNG buffer.
function colorTile(width, height, [r, g, b]) {
  const data = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    data[i * 4] = r;
    data[i * 4 + 1] = g;
    data[i * 4 + 2] = b;
    data[i * 4 + 3] = 255;
  }
  return sharp(data, { raw: { width, height, channels: 4 } })
    .png()
    .toBuffer();
}

// Build a sheet of stacked tile bands, each a distinct color, written to disk.
async function makeSheet(file, width, tileH, colors) {
  const bands = await Promise.all(
    colors.map((c, i) =>
      colorTile(width, tileH, c).then((png) => ({
        input: png,
        top: i * tileH,
        left: 0,
      })),
    ),
  );
  await sharp({
    create: {
      width,
      height: tileH * colors.length,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(bands)
    .png()
    .toFile(file);
}

async function rowColor(sheetPath, y) {
  const { data, width, channels } = await readSheet(sheetPath);
  const off = y * width * channels;
  return [data[off], data[off + 1], data[off + 2]];
}

let passed = 0;
function ok(name, cond) {
  assert.ok(cond, name);
  passed++;
  console.log(`  ok - ${name}`);
}

async function main() {
  // --- REAL catalog: the guard this whole rewrite exists for ---
  // History: the generator used to parse AwardRegistry.jsx as text. PR #130
  // moved the award data into constants/awardCatalog.js and the text matcher
  // silently matched nothing — every upload failed "not present in
  // AwardRegistry.jsx" while this suite stayed green, because every other test
  // here runs against synthetic fixtures. These assertions run against the
  // REAL catalog, so the next time that data moves or changes shape, it fails
  // at merge time instead of in front of a contributor.
  const realCatalog = await loadCatalog(DEFAULT_PATHS.catalog);
  ok("real catalog: loads a non-empty catalog", realCatalog.size > 50);

  const dsc = lookupAward(realCatalog, "Army Distinguished Service Cross");
  ok(
    "real catalog: a known award resolves with usable placement fields",
    dsc !== null &&
      Number.isInteger(dsc.awardPriority) &&
      Number.isInteger(dsc.medalPriority) &&
      dsc.awardType === "Medal",
  );
  ok(
    "real catalog: that award gates onto both sheets",
    onRibbonSheet(dsc) && onMedalSheet(dsc),
  );
  ok(
    "real catalog: an absent name resolves to null",
    lookupAward(realCatalog, "Nope") === null,
  );

  const realAwards = [...realCatalog.values()];
  ok(
    "real catalog: every entry has a non-empty string awardType",
    realAwards.every(
      (a) => typeof a.awardType === "string" && a.awardType !== "",
    ),
  );
  ok(
    "real catalog: no entry has a malformed placement field",
    realAwards.every((a) => malformedFields(a).length === 0),
  );
  ok(
    "real catalog: at least one award gates onto each sheet",
    realAwards.some(onRibbonSheet) && realAwards.some(onMedalSheet),
  );

  // The sheet-membership sets are written as plain strings, so they are bound
  // to awardTypes.js only by convention. Cross-check them against the real
  // enum: renaming a value there (Ribbon: "Ribbon" -> "RIBBON") would silently
  // drop every award of that type off its sheet, and no assertion above would
  // notice, because the survivors of the OTHER types keep every "some(...)"
  // and "typeof === string" check true. Verified: that exact rename drops 7
  // real awards off the ribbon sheet with the rest of this suite still green.
  const { AwardType } = await import(
    pathToFileURL(
      path.join(path.dirname(DEFAULT_PATHS.catalog), "awardTypes.js"),
    ).href
  );
  const enumValues = new Set(Object.values(AwardType));
  const orphanedSetMembers = [
    ...RIBBON_SHEET_TYPES,
    ...MEDAL_SHEET_TYPES,
  ].filter((t) => !enumValues.has(t));
  assert.deepStrictEqual(orphanedSetMembers, []);
  ok("real enum: every sheet-membership type is a live AwardType value", true);

  const orphanedCatalogTypes = [
    ...new Set(realAwards.map((a) => a.awardType)),
  ].filter((t) => !enumValues.has(t));
  assert.deepStrictEqual(orphanedCatalogTypes, []);
  ok(
    "real enum: every awardType used by the catalog is a live AwardType value",
    true,
  );

  // Every medal-sheet type is also a ribbon-sheet type. sheetExclusionReason
  // leans on this to answer the ribbon side with a single fixed reason: an
  // award reaching it is always a medal-sheet member, so its awardType is
  // necessarily a ribbon type and only the priority can be missing. Add a type
  // to MEDAL_SHEET_TYPES alone and that reason silently becomes a wrong
  // diagnosis rather than a failure, so pin the premise here.
  const medalTypesOffRibbonSheet = [...MEDAL_SHEET_TYPES].filter(
    (t) => !RIBBON_SHEET_TYPES.has(t),
  );
  assert.deepStrictEqual(medalTypesOffRibbonSheet, []);
  ok("membership: every medal-sheet type is also a ribbon-sheet type", true);

  // --- indexCatalog / lookupAward ---
  assert.deepStrictEqual(lookupAward(CATALOG, "Foo Ribbon"), {
    name: "Foo Ribbon",
    awardPriority: 1,
    awardType: "Ribbon",
  });
  ok("lookup: ribbon-only has awardPriority, no medalPriority", true);

  assert.strictEqual(lookupAward(CATALOG, "Nope"), null);
  ok("lookup: absent name returns null", true);

  assert.strictEqual(
    lookupAward(CATALOG, 'Baz "Q" Service Ribbon').medalPriority,
    3,
  );
  ok("lookup: name with embedded quotes resolves", true);

  assert.strictEqual(lookupAward(CATALOG, "Nested Medal").medalPriority, 4);
  ok("lookup: an unrelated nested field does not disturb placement", true);

  assert.throws(
    () => indexCatalog([{ name: "Dup" }, { name: "Dup" }]),
    /duplicate/i,
  );
  ok("indexCatalog: a duplicate award name throws", true);

  assert.throws(() => indexCatalog([{ awardPriority: 1 }]), /name/i);
  ok("indexCatalog: an entry with no name throws", true);

  assert.throws(() => indexCatalog([{ name: "", awardPriority: 1 }]), /name/i);
  ok("indexCatalog: an empty-string name throws", true);

  // A stray comma or a conditional spread in the catalog array leaves a hole.
  assert.throws(() => indexCatalog([null]), /name/i);
  ok("indexCatalog: a null entry throws the catalog-shaped error", true);

  assert.throws(() => indexCatalog("not an array"), /array/i);
  ok("indexCatalog: a non-array catalog throws", true);

  // An empty catalog is never a legitimate state, and letting it through
  // reports every award as "not present" — the same misdirection that hid the
  // original breakage.
  assert.throws(() => indexCatalog([]), /empty/i);
  ok("indexCatalog: an empty catalog throws instead of indexing nothing", true);

  await assert.rejects(
    loadCatalog(path.join(os.tmpdir(), "no-such-award-catalog.js")),
    /ERR_MODULE_NOT_FOUND|Cannot find module/,
  );
  ok(
    "loadCatalog: a missing catalog file rejects, never degrades to empty",
    true,
  );

  // --- malformedFields: present-but-unusable value is flagged ---
  assert.deepStrictEqual(
    malformedFields(lookupAward(CATALOG, "Broken Medal")),
    ["medalPriority"],
  );
  ok("malformed: present-but-unusable medalPriority is flagged", true);
  assert.deepStrictEqual(
    malformedFields(lookupAward(CATALOG, "Bar Medal")),
    [],
  );
  ok("malformed: clean entry flags nothing", true);
  assert.deepStrictEqual(
    malformedFields({ awardPriority: -1, awardType: "Medal" }),
    ["awardPriority"],
  );
  ok("malformed: a negative row index is flagged", true);

  // A field WRITTEN as undefined (what a typo'd or deleted enum reference
  // evaluates to) states an intent to sit on that sheet, so it must be
  // rejected — not read as "field omitted", which would splice the ribbon
  // tile, skip the medal tile, and still exit 0.
  assert.deepStrictEqual(
    malformedFields({
      awardPriority: 1,
      medalPriority: undefined,
      awardType: "Medal",
    }),
    ["medalPriority"],
  );
  ok(
    "malformed: a field written as undefined is flagged, not read as absent",
    true,
  );

  assert.deepStrictEqual(
    malformedFields({ awardPriority: 1, awardType: "Medal" }),
    [],
  );
  ok(
    "malformed: an omitted field is a legitimate non-member, not flagged",
    true,
  );

  assert.deepStrictEqual(malformedFields({ awardPriority: 1, awardType: "" }), [
    "awardType",
  ]);
  ok("malformed: an empty-string awardType is flagged", true);

  // --- membership gating ---
  ok(
    "membership: Tab is on neither sheet",
    !onRibbonSheet(lookupAward(CATALOG, "Ranger Tab")) &&
      !onMedalSheet(lookupAward(CATALOG, "Ranger Tab")),
  );
  ok(
    "membership: Lifetime medal (medalPriority 0) is ribbon-only, not on medal sheet",
    onRibbonSheet(lookupAward(CATALOG, "Lifetime Medal")) &&
      !onMedalSheet(lookupAward(CATALOG, "Lifetime Medal")),
  );
  ok(
    "membership: service ribbon is on both sheets",
    onRibbonSheet(lookupAward(CATALOG, 'Baz "Q" Service Ribbon')) &&
      onMedalSheet(lookupAward(CATALOG, 'Baz "Q" Service Ribbon')),
  );

  // --- validateManifest ---
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sprites-"));
  fs.writeFileSync(
    path.join(dir, "ribbon.png"),
    await colorTile(43, 13, [9, 9, 9]),
  );
  fs.writeFileSync(
    path.join(dir, "medal.png"),
    await colorTile(72, 148, [9, 9, 9]),
  );

  let r = validateManifest(
    [{ name: "Ghost", ribbon: "ribbon.png" }],
    CATALOG,
    dir,
  );
  ok("validate: name absent from the catalog errors", r.errors.length === 1);

  r = validateManifest(
    [{ name: "Broken Medal", ribbon: "ribbon.png", medal: "medal.png" }],
    CATALOG,
    dir,
  );
  ok(
    "validate: present-but-unusable field is a hard error, not a non-member",
    r.errors.some(
      (e) => e.includes("present but unusable") && e.includes("medalPriority"),
    ),
  );

  // Built inline rather than added to CATALOG_ENTRIES: JSON.stringify drops
  // undefined-valued keys, so this entry would not survive writeCatalog() and
  // the on-disk fixture would disagree with the in-memory one.
  r = validateManifest(
    [{ name: "Phantom Medal", ribbon: "ribbon.png", medal: "medal.png" }],
    indexCatalog([
      {
        name: "Phantom Medal",
        awardPriority: 8,
        medalPriority: undefined,
        awardType: "Medal",
      },
    ]),
    dir,
  );
  ok(
    "validate: a medalPriority written as undefined aborts the run, not just the medal tile",
    r.errors.some(
      (e) => e.includes("present but unusable") && e.includes("medalPriority"),
    ),
  );

  r = validateManifest(
    [{ name: "Typeless Medal", ribbon: "ribbon.png", medal: "medal.png" }],
    CATALOG,
    dir,
  );
  ok(
    "validate: priorities present but no awardType errors distinctly (not 'does not belong')",
    r.errors.some((e) => e.includes("no usable awardType")) &&
      !r.errors.some((e) => e.includes("does not belong")),
  );

  r = validateManifest(
    [{ name: "Bar Medal", ribbon: "ribbon.png" }],
    CATALOG,
    dir,
  );
  ok(
    "validate: missing required medal source errors",
    r.errors.some((e) => e.includes("medal sheet")),
  );

  r = validateManifest(
    [{ name: "Foo Ribbon", ribbon: "ribbon.png" }],
    CATALOG,
    dir,
  );
  ok("validate: ribbon-only with its source passes", r.errors.length === 0);

  r = validateManifest(
    [{ name: "Bar Medal", ribbon: "ribbon.png", medal: "medal.png" }],
    CATALOG,
    dir,
  );
  ok(
    "validate: both-sheet award with both sources passes",
    r.errors.length === 0,
  );

  // Supplying art for a sheet the catalog does not place the award on is a
  // contradiction between two humans' intent, not a stray file: the manifest
  // asserts the tile exists, the catalog says it has nowhere to go. Warning and
  // continuing placed the other tile, consumed its source and exited 0, leaving
  // an award half-placed with the warning reading as "correct, ribbon-only".
  r = validateManifest(
    [{ name: "Foo Ribbon", ribbon: "ribbon.png", medal: "medal.png" }],
    CATALOG,
    dir,
  );
  ok(
    "validate: a medal source for a pure ribbon errors, not warns",
    r.errors.some(
      (e) => e.includes("medal sheet") && e.includes("awardType"),
    ) && r.errors.length === 1,
  );

  // The headline shape: a medal whose medalPriority the contributor forgot to
  // add. Omitting it is the legitimate way to write a ribbon-only award, so the
  // supplied "medal" source is the only thing distinguishing the two.
  r = validateManifest(
    [{ name: "Forgetful Medal", ribbon: "ribbon.png", medal: "medal.png" }],
    indexCatalog([
      { name: "Forgetful Medal", awardPriority: 3, awardType: "Medal" },
    ]),
    dir,
  );
  ok(
    "validate: a medal source for a medal missing medalPriority errors",
    r.errors.some(
      (e) => e.includes("medal sheet") && e.includes("no medalPriority"),
    ),
  );

  // A medalPriority on a non-medal awardType is not a medal tile: membership is
  // gated on type first, so the priority is inert and the art has nowhere to go.
  r = validateManifest(
    [{ name: "Priced Ribbon", ribbon: "ribbon.png", medal: "medal.png" }],
    indexCatalog([
      {
        name: "Priced Ribbon",
        awardPriority: 3,
        medalPriority: 5,
        awardType: "Ribbon",
      },
    ]),
    dir,
  );
  ok(
    "validate: a medal source for a ribbon carrying a medalPriority errors",
    r.errors.some((e) => e.includes("medal sheet") && e.includes("awardType")),
  );

  // Priorities 0 and 1 are the two Lifetime medals: on the ribbon sheet, below
  // the medal sheet's first row. Absence and out-of-range must read alike.
  r = validateManifest(
    [{ name: "Lifetime Medal", ribbon: "ribbon.png", medal: "medal.png" }],
    CATALOG,
    dir,
  );
  ok(
    "validate: a medal source for a below-minimum medalPriority errors",
    r.errors.some((e) => e.includes("medal sheet") && e.includes("below")),
  );

  // The mirror. An award can be medal-only if it omits awardPriority, so the
  // same contradiction has a ribbon-side shape that must fail identically.
  r = validateManifest(
    [{ name: "Medal Only", ribbon: "ribbon.png", medal: "medal.png" }],
    indexCatalog([
      { name: "Medal Only", medalPriority: 5, awardType: "Medal" },
    ]),
    dir,
  );
  ok(
    "validate: a ribbon source for a medal-only award errors (the mirror case)",
    r.errors.some(
      (e) => e.includes("ribbon sheet") && e.includes("no awardPriority"),
    ),
  );

  r = validateManifest(
    [{ name: "Ranger Tab", ribbon: "ribbon.png" }],
    CATALOG,
    dir,
  );
  ok(
    "validate: award on neither sheet (Tab) errors",
    r.errors.some((e) => e.includes("does not belong")),
  );

  r = validateManifest(
    [
      { name: "Foo Ribbon", ribbon: "ribbon.png" },
      { name: "Foo Ribbon", ribbon: "ribbon.png" },
    ],
    CATALOG,
    dir,
  );
  ok(
    "validate: duplicate manifest entry errors",
    r.errors.some((e) => e.includes("duplicate")),
  );

  // Both entries land on the ribbon sheet; mixing a replace with an insert in
  // one run would shift the buffer out from under the replace, so it's rejected.
  r = validateManifest(
    [
      { name: "Foo Ribbon", ribbon: "ribbon.png", replace: true },
      { name: "Lifetime Medal", ribbon: "ribbon.png" },
    ],
    CATALOG,
    dir,
  );
  ok(
    "validate: mixing a replace and an insert on the same sheet errors",
    r.errors.some((e) => e.includes("both a replace and an insert")),
  );

  // Two replaces on the same sheet is fine — no insert means no shift.
  r = validateManifest(
    [
      { name: "Foo Ribbon", ribbon: "ribbon.png", replace: true },
      { name: "Lifetime Medal", ribbon: "ribbon.png", replace: true },
    ],
    CATALOG,
    dir,
  );
  ok(
    "validate: two replaces on the same sheet (no insert) is allowed",
    !r.errors.some((e) => e.includes("both a replace and an insert")),
  );

  // An unrecognised key is rejected rather than ignored. `replace` is read as a
  // strict `=== true`, so a near-miss spelling reads as absent and downgrades a
  // replace to an insert — which shifts every row below it, silently.
  r = validateManifest(
    [{ name: "Foo Ribbon", ribbon: "ribbon.png", replaced: true }],
    CATALOG,
    dir,
  );
  ok(
    'validate: a near-miss "replace" key errors instead of reading as an insert',
    r.errors.some(
      (e) => e.includes("unrecognised key") && e.includes("replaced"),
    ),
  );

  r = validateManifest(
    [{ name: "Foo Ribbon", ribbon: "ribbon.png", note: "hi" }],
    CATALOG,
    dir,
  );
  ok(
    "validate: any unrecognised key errors, not only near-misses of a real one",
    r.errors.some((e) => e.includes("unrecognised key")),
  );

  r = validateManifest(
    [
      {
        name: "Bar Medal",
        ribbon: "ribbon.png",
        medal: "medal.png",
        replace: true,
      },
    ],
    CATALOG,
    dir,
  );
  ok(
    "validate: all four allowed keys together still pass",
    r.errors.length === 0,
  );

  // --- spliceSheet: two new tiles interleave at their final catalog rows ---
  // Refutes the "multi-insert cascade" review claim: inserting ascending on the
  // growing buffer places each tile at its final position.
  const inter = path.join(dir, "inter.png");
  await makeSheet(inter, 43, 14, [
    [10, 0, 0],
    [20, 0, 0],
  ]); // P, Q at rows 0,1
  await spliceSheet(inter, [
    {
      y: 28,
      tileHeight: 14,
      png: await colorTile(43, 14, [200, 0, 0]),
      name: "B",
    },
    {
      y: 14,
      tileHeight: 14,
      png: await colorTile(43, 14, [100, 0, 0]),
      name: "A",
    },
  ]);
  assert.deepStrictEqual(await rowColor(inter, 0), [10, 0, 0]); // P
  assert.deepStrictEqual(await rowColor(inter, 14), [100, 0, 0]); // A
  assert.deepStrictEqual(await rowColor(inter, 28), [200, 0, 0]); // B
  assert.deepStrictEqual(await rowColor(inter, 42), [20, 0, 0]); // Q shifted
  ok("splice: two consecutive new tiles interleave as [P,A,B,Q]", true);

  // --- spliceSheet: append past a sub-tile-short sheet pads to exact row ---
  const appnd = path.join(dir, "appnd.png");
  await sharp({
    create: {
      width: 43,
      height: 27, // 14 + 13: mimics the 1px-short trailing remainder
      channels: 4,
      background: { r: 50, g: 50, b: 50, alpha: 255 },
    },
  })
    .png()
    .toFile(appnd);
  await spliceSheet(appnd, [
    {
      y: 28,
      tileHeight: 14,
      png: await colorTile(43, 14, [150, 0, 0]),
      name: "C",
    },
  ]);
  const appndMeta = await sharp(appnd).metadata();
  ok(
    "splice: append pads then places tile (height 27 -> 42)",
    appndMeta.height === 42,
  );
  assert.deepStrictEqual(await rowColor(appnd, 0), [50, 50, 50]);
  ok("splice: original content preserved before padded append", true);
  assert.deepStrictEqual(await rowColor(appnd, 28), [150, 0, 0]);
  ok("splice: appended tile lands at its exact catalog row y=28", true);

  // --- spliceSheet: ascending multi-insert, rows below unchanged ---
  const sheet = path.join(dir, "sheet.png");
  await makeSheet(sheet, 43, 14, [
    [10, 0, 0],
    [20, 0, 0],
    [30, 0, 0],
  ]); // 3 bands, 42px
  const tileA = await colorTile(43, 14, [100, 0, 0]);
  const tileB = await colorTile(43, 14, [200, 0, 0]);
  // Insert at catalog rows 1 (y=14) and 3 (y=42, append) — final layout.
  await spliceSheet(sheet, [
    { y: 42, tileHeight: 14, png: tileB, name: "B" },
    { y: 14, tileHeight: 14, png: tileA, name: "A" },
  ]);
  const meta = await sharp(sheet).metadata();
  ok("splice: height grew by two tiles (42 -> 70)", meta.height === 70);
  assert.deepStrictEqual(await rowColor(sheet, 0), [10, 0, 0]);
  ok("splice: row above first insert unchanged", true);
  assert.deepStrictEqual(await rowColor(sheet, 14), [100, 0, 0]);
  ok("splice: tile A landed at y=14", true);
  assert.deepStrictEqual(await rowColor(sheet, 28), [20, 0, 0]);
  ok("splice: original band 1 shifted down below insert A", true);
  assert.deepStrictEqual(await rowColor(sheet, 42), [200, 0, 0]);
  ok("splice: tile B landed at its final catalog row y=42", true);
  assert.deepStrictEqual(await rowColor(sheet, 56), [30, 0, 0]);
  ok("splice: original last band shifted down below both inserts", true);

  // --- spliceSheet: replace overwrites in place, no shift, no growth ---
  const repl = path.join(dir, "repl.png");
  await makeSheet(repl, 43, 14, [
    [10, 0, 0],
    [20, 0, 0],
    [30, 0, 0],
  ]); // rows 0,1,2 — 42px
  await spliceSheet(repl, [
    {
      y: 14,
      tileHeight: 14,
      png: await colorTile(43, 14, [99, 0, 0]),
      name: "R",
      replace: true,
    },
  ]);
  const replMeta = await sharp(repl).metadata();
  ok("splice(replace): height unchanged (42 -> 42)", replMeta.height === 42);
  assert.deepStrictEqual(await rowColor(repl, 0), [10, 0, 0]);
  ok("splice(replace): row above untouched", true);
  assert.deepStrictEqual(await rowColor(repl, 14), [99, 0, 0]);
  ok("splice(replace): target row overwritten in place", true);
  assert.deepStrictEqual(await rowColor(repl, 28), [30, 0, 0]);
  ok("splice(replace): row below NOT shifted", true);

  // --- spliceSheet: replace past the sheet end is rejected ---
  let replThrew = false;
  try {
    await spliceSheet(repl, [
      {
        y: 56,
        tileHeight: 14,
        png: await colorTile(43, 14, [1, 1, 1]),
        name: "R2",
        replace: true,
      },
    ]);
  } catch (e) {
    replThrew = e.message.includes("no existing tile to overwrite");
  }
  ok("splice(replace): replacing a nonexistent row throws", replThrew);

  // --- spliceSheet: replace into the partial final row (sub-tile remainder) ---
  // The bottom-most award lives in the sheet's leftover < tileHeight band — the
  // real ribbon sheet is 769px = 54*14 + 13, so its last row is only 13px tall.
  // A replace there must succeed: the guard gates on the row's start, and the
  // copy clamps to the bytes that exist. Two full 14px rows + a 13px remainder.
  const partial = path.join(dir, "partial.png");
  await sharp({
    create: {
      width: 43,
      height: 41,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: await colorTile(43, 14, [10, 0, 0]), top: 0, left: 0 },
      { input: await colorTile(43, 14, [20, 0, 0]), top: 14, left: 0 },
      { input: await colorTile(43, 13, [30, 0, 0]), top: 28, left: 0 }, // 13px
    ])
    .png()
    .toFile(partial);
  let partialThrew = false;
  try {
    await spliceSheet(partial, [
      {
        y: 28,
        tileHeight: 14,
        png: await colorTile(43, 14, [99, 0, 0]),
        name: "EAME Campaign Medal",
        replace: true,
      },
    ]);
  } catch (e) {
    partialThrew = true;
  }
  ok("splice(replace): partial final row is NOT rejected", !partialThrew);
  const partialMeta = await sharp(partial).metadata();
  ok(
    "splice(replace): partial-row replace leaves height unchanged (41 -> 41)",
    partialMeta.height === 41,
  );
  assert.deepStrictEqual(await rowColor(partial, 0), [10, 0, 0]);
  ok("splice(replace): row above partial final row untouched", true);
  assert.deepStrictEqual(await rowColor(partial, 14), [20, 0, 0]);
  ok("splice(replace): second row above partial final row untouched", true);
  assert.deepStrictEqual(await rowColor(partial, 28), [99, 0, 0]);
  ok("splice(replace): partial final row overwritten in place", true);

  // --- spliceSheet: mixing a replace and an insert in one call is rejected ---
  // The insert would shift the buffer out from under the replace's absolute
  // offset, landing it on the wrong row. Guard fires before any byte is touched.
  const mix = path.join(dir, "mix.png");
  await makeSheet(mix, 43, 14, [
    [10, 0, 0],
    [20, 0, 0],
    [30, 0, 0],
  ]);
  const mixBefore = fs.readFileSync(mix);
  let mixThrew = false;
  try {
    await spliceSheet(mix, [
      {
        y: 14,
        tileHeight: 14,
        png: await colorTile(43, 14, [1, 0, 0]),
        name: "ins",
      },
      {
        y: 28,
        tileHeight: 14,
        png: await colorTile(43, 14, [2, 0, 0]),
        name: "rep",
        replace: true,
      },
    ]);
  } catch (e) {
    mixThrew = e.message.includes("mix a replace and an insert");
  }
  ok("splice: mixing a replace and an insert throws", mixThrew);
  ok(
    "splice: sheet untouched after a rejected replace+insert mix",
    mixBefore.equals(fs.readFileSync(mix)),
  );

  // --- run: no-op manifest leaves sheets byte-identical ---
  const paths = makePaths(dir);
  await makeSheet(paths.ribbonSheet, 43, 14, [
    [1, 0, 0],
    [2, 0, 0],
  ]);
  await makeSheet(paths.medalSheet, 70, 120, [
    [0, 1, 0],
    [0, 2, 0],
  ]);
  const ribBefore = fs.readFileSync(paths.ribbonSheet);
  const medBefore = fs.readFileSync(paths.medalSheet);
  fs.writeFileSync(paths.manifest, "[]\n");
  const noop = await run(paths, silent());
  ok("run: empty manifest processes nothing", noop.processed === 0);
  ok(
    "run: ribbon sheet byte-identical after no-op",
    ribBefore.equals(fs.readFileSync(paths.ribbonSheet)),
  );
  ok(
    "run: medal sheet byte-identical after no-op",
    medBefore.equals(fs.readFileSync(paths.medalSheet)),
  );

  // --- run: full service-ribbon insert into both sheets ---
  // Baz is awardPriority 4 (ribbon y=56) and medalPriority 3 (medal y=120),
  // so the sheets must be tall enough to splice mid-sequence.
  await makeSheet(paths.ribbonSheet, 43, 14, [
    [1, 0, 0],
    [2, 0, 0],
    [3, 0, 0],
    [4, 0, 0],
    [5, 0, 0],
  ]);
  await makeSheet(paths.medalSheet, 70, 120, [
    [0, 1, 0],
    [0, 2, 0],
  ]);
  fs.writeFileSync(
    path.join(dir, "rib2.png"),
    await colorTile(43, 13, [7, 7, 7]),
  );
  fs.writeFileSync(
    path.join(dir, "med2.png"),
    await colorTile(72, 148, [7, 7, 7]),
  );
  fs.writeFileSync(
    paths.manifest,
    JSON.stringify(
      [
        {
          name: 'Baz "Q" Service Ribbon',
          ribbon: "rib2.png",
          medal: "med2.png",
        },
      ],
      null,
      2,
    ) + "\n",
  );
  const ribH0 = (await sharp(paths.ribbonSheet).metadata()).height;
  const medH0 = (await sharp(paths.medalSheet).metadata()).height;
  const res = await run(paths, silent());
  ok("run: processed one award", res.processed === 1);
  ok(
    "run: ribbon sheet grew by one 14px tile",
    (await sharp(paths.ribbonSheet).metadata()).height === ribH0 + 14,
  );
  ok(
    "run: medal sheet grew by one 120px tile",
    (await sharp(paths.medalSheet).metadata()).height === medH0 + 120,
  );
  ok(
    "run: source PNGs removed",
    !fs.existsSync(path.join(dir, "rib2.png")) &&
      !fs.existsSync(path.join(dir, "med2.png")),
  );
  ok(
    "run: manifest emptied",
    fs.readFileSync(paths.manifest, "utf8") === "[]\n",
  );

  // --- run: validation failure writes nothing ---
  await makeSheet(paths.ribbonSheet, 43, 14, [
    [1, 0, 0],
    [2, 0, 0],
  ]);
  const ribGuard = fs.readFileSync(paths.ribbonSheet);
  fs.writeFileSync(
    paths.manifest,
    JSON.stringify([{ name: "Ghost", ribbon: "rib2.png" }], null, 2) + "\n",
  );
  let threw = false;
  try {
    await run(paths, silent());
  } catch (e) {
    threw = true;
  }
  ok("run: invalid manifest throws", threw);
  ok(
    "run: sheet untouched after validation failure",
    ribGuard.equals(fs.readFileSync(paths.ribbonSheet)),
  );

  // --- run: replace:true overwrites both tiles in place without growing ---
  // Bar Medal: ribbon y=28 (priority 2), medal y=0 (priority 2). Sheets are
  // pre-sized so the rows already exist; replace must not change height.
  await makeSheet(paths.ribbonSheet, 43, 14, [
    [1, 0, 0],
    [2, 0, 0],
    [3, 0, 0],
  ]);
  await makeSheet(paths.medalSheet, 70, 120, [
    [0, 1, 0],
    [0, 2, 0],
  ]);
  fs.writeFileSync(
    path.join(dir, "rR.png"),
    await colorTile(43, 13, [8, 8, 8]),
  );
  fs.writeFileSync(
    path.join(dir, "mR.png"),
    await colorTile(72, 148, [8, 8, 8]),
  );
  fs.writeFileSync(
    paths.manifest,
    JSON.stringify(
      [{ name: "Bar Medal", ribbon: "rR.png", medal: "mR.png", replace: true }],
      null,
      2,
    ) + "\n",
  );
  const ribHR = (await sharp(paths.ribbonSheet).metadata()).height;
  const medHR = (await sharp(paths.medalSheet).metadata()).height;
  await run(paths, silent());
  ok(
    "run(replace): ribbon sheet height unchanged",
    (await sharp(paths.ribbonSheet).metadata()).height === ribHR,
  );
  ok(
    "run(replace): medal sheet height unchanged",
    (await sharp(paths.medalSheet).metadata()).height === medHR,
  );

  // --- run: a typo'd replace key aborts instead of turning into an insert ---
  // The damaging shape: the operator asked to overwrite one tile, and a single
  // misspelled key would instead insert on BOTH sheets, pushing every award
  // below down one row so each renders as its neighbour — with no diagnostic.
  await makeSheet(paths.ribbonSheet, 43, 14, [
    [1, 0, 0],
    [2, 0, 0],
    [3, 0, 0],
  ]);
  await makeSheet(paths.medalSheet, 70, 120, [
    [0, 1, 0],
    [0, 2, 0],
  ]);
  fs.writeFileSync(
    path.join(dir, "rT.png"),
    await colorTile(43, 13, [6, 6, 6]),
  );
  fs.writeFileSync(
    path.join(dir, "mT.png"),
    await colorTile(72, 148, [6, 6, 6]),
  );
  fs.writeFileSync(
    paths.manifest,
    JSON.stringify(
      [
        {
          name: "Bar Medal",
          ribbon: "rT.png",
          medal: "mT.png",
          replaced: true,
        },
      ],
      null,
      2,
    ) + "\n",
  );
  const ribHT = (await sharp(paths.ribbonSheet).metadata()).height;
  const medHT = (await sharp(paths.medalSheet).metadata()).height;
  let typoThrew = false;
  try {
    await run(paths, silent());
  } catch (e) {
    typoThrew = true;
  }
  ok("run(typo): unrecognised key aborts the run", typoThrew);
  ok(
    "run(typo): ribbon sheet not grown by a mistaken insert",
    (await sharp(paths.ribbonSheet).metadata()).height === ribHT,
  );
  ok(
    "run(typo): medal sheet not grown by a mistaken insert",
    (await sharp(paths.medalSheet).metadata()).height === medHT,
  );
  ok(
    "run(typo): sources kept for a retry, not consumed",
    fs.existsSync(path.join(dir, "rT.png")) &&
      fs.existsSync(path.join(dir, "mT.png")),
  );
  ok(
    "run(typo): manifest entry retained, not emptied",
    JSON.parse(fs.readFileSync(paths.manifest, "utf8")).length === 1,
  );

  // --- run: a source for a non-member sheet aborts, consuming nothing ---
  // The whole danger of this tool is that it deletes its inputs and CI opens a
  // PR on success, so a run that places one of two tiles and still exits 0
  // destroys the evidence that anything was missed. Assert at the run() seam,
  // not just validateManifest: the error is only worth anything if it actually
  // reaches the caller before a sheet is written or a source is unlinked.
  await makeSheet(paths.ribbonSheet, 43, 14, [
    [1, 0, 0],
    [2, 0, 0],
  ]);
  await makeSheet(paths.medalSheet, 70, 120, [[0, 1, 0]]);
  fs.writeFileSync(
    path.join(dir, "rib3.png"),
    await colorTile(43, 13, [7, 7, 7]),
  );
  fs.writeFileSync(
    path.join(dir, "extra.png"),
    await colorTile(72, 148, [7, 7, 7]),
  );
  fs.writeFileSync(
    paths.manifest,
    JSON.stringify(
      [{ name: "Foo Ribbon", ribbon: "rib3.png", medal: "extra.png" }],
      null,
      2,
    ) + "\n",
  );
  const ribGuardHalf = fs.readFileSync(paths.ribbonSheet);
  let halfThrew = false;
  try {
    await run(paths, silent());
  } catch (e) {
    halfThrew = true;
  }
  ok("run(half-placed): a source for a non-member sheet aborts", halfThrew);
  ok(
    "run(half-placed): the placeable ribbon tile was not spliced in anyway",
    ribGuardHalf.equals(fs.readFileSync(paths.ribbonSheet)),
  );
  ok(
    "run(half-placed): both sources kept for a retry",
    fs.existsSync(path.join(dir, "rib3.png")) &&
      fs.existsSync(path.join(dir, "extra.png")),
  );
  ok(
    "run(half-placed): manifest entry retained, not emptied",
    JSON.parse(fs.readFileSync(paths.manifest, "utf8")).length === 1,
  );

  fs.rmSync(dir, { recursive: true, force: true });
  console.log(`\nAll ${passed} assertions passed.`);
}

function makePaths(dir) {
  return {
    uploadDir: dir,
    manifest: path.join(dir, "manifest.json"),
    catalog: writeCatalog(dir),
    ribbonSheet: path.join(dir, "ribbonSheet.png"),
    medalSheet: path.join(dir, "medalSheet.png"),
  };
}

/**
 * Write CATALOG_ENTRIES out as a standalone ES module for run() to import.
 * Self-contained (values inlined, no imports) so it loads from a temp dir with
 * no package.json.
 *
 * Two constraints if you extend this. Node caches ES modules by URL and never
 * invalidates, so a second catalog with DIFFERENT contents must be written to a
 * different directory or the first one is served again. And JSON.stringify
 * drops undefined-valued keys, so a fixture testing a field written as
 * `undefined` cannot round-trip through here — build it inline with
 * indexCatalog() instead.
 */
function writeCatalog(dir) {
  const p = path.join(dir, "awardCatalog.js");
  fs.writeFileSync(
    p,
    `export const AWARD_CATALOG = ${JSON.stringify(CATALOG_ENTRIES, null, 2)};\n`,
  );
  return p;
}

function silent() {
  return { log() {}, warn() {}, error() {} };
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
