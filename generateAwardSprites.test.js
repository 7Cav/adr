"use strict";

/**
 * Self-contained harness for generateAwardSprites.js. No test framework — run
 * with `node generateAwardSprites.test.js`. Builds synthetic sprite sheets and
 * sources in a temp dir so the real sheets are never touched, then asserts the
 * I/O-matrix edge cases from the spec.
 */

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sharp = require("sharp");

const {
  parseAward,
  onRibbonSheet,
  onMedalSheet,
  validateManifest,
  spliceSheet,
  readSheet,
  run,
} = require("./generateAwardSprites");

const REGISTRY = `
  // prettier-ignore
  initalizeAwards() {
    this.awards.set("Lifetime Medal", {awardPriority: 0, medalPriority: 0, awardType: "Medal"});
    this.awards.set("Foo Ribbon", {awardPriority: 1, awardType: "Ribbon"});
    this.awards.set("Bar Medal", {awardPriority: 2, medalPriority:2, awardType: "Medal"});
    this.awards.set(\`Baz "Q" Service Ribbon\`, {awardPriority: 4, medalPriority: 3, awardType: "Medal"});
    this.awards.set("Ranger Tab", {awardPriority: 1, awardType: "Tab"});
  }
`;

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
  // --- parseAward ---
  assert.deepStrictEqual(parseAward(REGISTRY, "Foo Ribbon"), {
    awardPriority: 1,
    awardType: "Ribbon",
  });
  ok("parseAward: ribbon-only has awardPriority, no medalPriority", true);

  assert.deepStrictEqual(parseAward(REGISTRY, "Bar Medal"), {
    awardPriority: 2,
    medalPriority: 2,
    awardType: "Medal",
  });
  ok("parseAward: tolerates `medalPriority:2` with no space", true);

  assert.deepStrictEqual(parseAward(REGISTRY, 'Baz "Q" Service Ribbon'), {
    awardPriority: 4,
    medalPriority: 3,
    awardType: "Medal",
  });
  ok("parseAward: backtick name with embedded quotes + awardType", true);

  assert.strictEqual(parseAward(REGISTRY, "Nope"), null);
  ok("parseAward: absent name returns null", true);

  // --- membership gating ---
  ok(
    "membership: Tab is on neither sheet",
    !onRibbonSheet(parseAward(REGISTRY, "Ranger Tab")) &&
      !onMedalSheet(parseAward(REGISTRY, "Ranger Tab")),
  );
  ok(
    "membership: Lifetime medal (medalPriority 0) is ribbon-only, not on medal sheet",
    onRibbonSheet(parseAward(REGISTRY, "Lifetime Medal")) &&
      !onMedalSheet(parseAward(REGISTRY, "Lifetime Medal")),
  );
  ok(
    "membership: service ribbon is on both sheets",
    onRibbonSheet(parseAward(REGISTRY, 'Baz "Q" Service Ribbon')) &&
      onMedalSheet(parseAward(REGISTRY, 'Baz "Q" Service Ribbon')),
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
    REGISTRY,
    dir,
  );
  ok("validate: name absent from registry errors", r.errors.length === 1);

  r = validateManifest(
    [{ name: "Bar Medal", ribbon: "ribbon.png" }],
    REGISTRY,
    dir,
  );
  ok(
    "validate: missing required medal source errors",
    r.errors.some((e) => e.includes("medal sheet")),
  );

  r = validateManifest(
    [{ name: "Foo Ribbon", ribbon: "ribbon.png" }],
    REGISTRY,
    dir,
  );
  ok("validate: ribbon-only with its source passes", r.errors.length === 0);

  r = validateManifest(
    [{ name: "Bar Medal", ribbon: "ribbon.png", medal: "medal.png" }],
    REGISTRY,
    dir,
  );
  ok(
    "validate: both-sheet award with both sources passes",
    r.errors.length === 0,
  );

  r = validateManifest(
    [{ name: "Foo Ribbon", ribbon: "ribbon.png", medal: "medal.png" }],
    REGISTRY,
    dir,
  );
  ok(
    "validate: extra source for a sheet it doesn't belong to warns",
    r.warnings.length === 1,
  );

  r = validateManifest(
    [{ name: "Ranger Tab", ribbon: "ribbon.png" }],
    REGISTRY,
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
    REGISTRY,
    dir,
  );
  ok(
    "validate: duplicate manifest entry errors",
    r.errors.some((e) => e.includes("duplicate")),
  );

  // --- spliceSheet: two new tiles interleave at their final registry rows ---
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
  ok("splice: appended tile lands at its exact registry row y=28", true);

  // --- spliceSheet: ascending multi-insert, rows below unchanged ---
  const sheet = path.join(dir, "sheet.png");
  await makeSheet(sheet, 43, 14, [
    [10, 0, 0],
    [20, 0, 0],
    [30, 0, 0],
  ]); // 3 bands, 42px
  const tileA = await colorTile(43, 14, [100, 0, 0]);
  const tileB = await colorTile(43, 14, [200, 0, 0]);
  // Insert at registry rows 1 (y=14) and 3 (y=42, append) — final layout.
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
  ok("splice: tile B landed at its final registry row y=42", true);
  assert.deepStrictEqual(await rowColor(sheet, 56), [30, 0, 0]);
  ok("splice: original last band shifted down below both inserts", true);

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

  fs.rmSync(dir, { recursive: true, force: true });
  console.log(`\nAll ${passed} assertions passed.`);
}

function makePaths(dir) {
  return {
    uploadDir: dir,
    manifest: path.join(dir, "manifest.json"),
    registry: writeRegistry(dir),
    ribbonSheet: path.join(dir, "ribbonSheet.png"),
    medalSheet: path.join(dir, "medalSheet.png"),
  };
}

function writeRegistry(dir) {
  const p = path.join(dir, "AwardRegistry.jsx");
  fs.writeFileSync(p, REGISTRY);
  return p;
}

function silent() {
  return { log() {}, warn() {}, error() {} };
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
