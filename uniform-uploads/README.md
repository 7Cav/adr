# uniform-uploads

Drop folder for queuing new Uniform Builder awards. Pushing a change under this
folder triggers the **award_sprites** GitHub Actions workflow, which regenerates
the sprite sheets and opens a pull request for review.

## How to add an award

1. **Edit the catalog first.** Add (and renumber) the award in
   `client/app/uniformbuilder/modules/constants/awardCatalog.js`. This is the
   single source of truth for placement — CI imports the same module the
   uniform builder renders from and reads `awardPriority` / `medalPriority`
   off it; the manifest never restates row numbers.
2. **Drop the source art** here as PNG(s), named as plain filenames — no
   subdirectories, and the name must end in `.png`:
   - Ribbon art: 43×13, or 43×14, or an exact multiple of either (86×26,
     129×39, …), RGB or RGBA. Anything else fails the run. The tile is made by
     _stretching_ the source to fill 43×14, so a source of another shape comes
     out distorted rather than merely imperfect, and by then your PNG is gone.
   - Medal art: any size, RGBA with transparency (it is scaled to fit a 70×120
     tile, centered horizontally, top-aligned on transparency). Odd proportions
     warn rather than fail here — the scale preserves aspect, so the cost is
     transparent margin, not the art.
3. **Add a manifest entry** to `manifest.json` (a JSON array):

   ```json
   [
     {
       "name": "Foxhole Service Ribbon",
       "ribbon": "FH_Ribbon_uniform.png",
       "medal": "FH_medal_uniforms.png"
     }
   ]
   ```

   - `name` must match the catalog award name exactly.
   - `ribbon` and `medal` must be plain filenames sitting in this folder. A
     path that climbs out of it (`../…`) is rejected: the generator deletes
     each source once its tile is spliced.
   - `name`, `ribbon`, `medal` and `replace` are the only keys an entry may
     carry, and the error message lists them if you get one wrong. Anything
     else fails the run: a misspelled `replace` would otherwise read as absent,
     inserting a tile instead of overwriting one and pushing every award below
     it down a row.
   - Supply `ribbon` if the award has an `awardPriority`, and `medal` if it has
     a `medalPriority` of 2 or higher. Service ribbons have both; pure ribbons
     have only `ribbon`. Priorities 0 and 1 are the two Lifetime medals, which
     sit on the ribbon sheet only.
   - Supplying art for a sheet the catalog does not place the award on fails
     the run rather than skipping that tile. If you meant to add the tile, the
     catalog entry is what needs fixing; if you did not, drop the key. Either
     way nothing is spliced and your PNGs stay put for the retry.
   - Only mainline medals and ribbons live in these two sheets. Badges, tabs,
     weapon quals and unit citations render from separate assets and cannot be
     uploaded here, even though they carry an `awardPriority`.

4. **Push.** CI validates the manifest against the catalog, splices the tiles
   into the sprite sheets at the catalog-derived rows, removes the consumed
   PNGs, empties the manifest, and opens a PR containing only the regenerated
   sheets and this cleanup. Review and merge it.

CI never edits the catalog, never touches the `.xcf` GIMP sources, and never
auto-merges.

## Adding new art vs. fixing existing art

Two modes, selected per entry:

- **New award (default) — insert.** Omit `replace` (or set it to `false`). CI
  splices the tile in at the catalog-derived row and shifts every row below it
  down by one tile. Use this only for an award that is **new to the sheet**, and
  renumber the catalog as in step 1 so the priorities below it move too.

  Renumbering is not bookkeeping you can skip. CI checks that the catalog
  places one award for every row the sheet already holds, plus one for each row
  your upload inserts, so an insert only adds up if the catalog gained an award
  to match. Re-uploading art for an award that is already on the sheet without
  setting `replace` fails this check, which is the point: it would otherwise
  have pushed every award below it down a row, and you would not have found out
  until the sprites looked wrong in the builder.

  The priorities themselves also have to run consecutively, with no repeats and
  no holes. Renumbering by hand across a hundred awards makes both easy to
  produce, and either one misrenders every award below it, so CI rejects them
  and names the priority at fault.

- **Existing award — replace.** Set `"replace": true`. CI overwrites the tile
  already at that award's catalog row in place — no shift, no height change —
  so re-uploading art for an award that already has a tile fixes it instead of
  inserting a duplicate.

  ```json
  [
    {
      "name": "Army Distinguished Service Cross",
      "medal": "ADSC_v2.png",
      "replace": true
    }
  ]
  ```

  Do **not** renumber the catalog for a replace — the award keeps its existing
  priority. Replacing a row that doesn't exist yet (a priority past the end of
  the sheet) fails the run; use an insert for a genuinely new award. If the
  catalog and the sheet disagree about how many awards are on it, a replace
  fails too, since overwriting a tile in place cannot settle that difference.

One case the manifest cannot express: an award that already has a tile on one
sheet gaining its first tile on the other. That is a replace on one sheet and
an insert on the other, and `replace` is set per entry rather than per sheet.
Splitting it across two uploads does not help, because an award on both sheets
must supply both sources every time. Ask a maintainer rather than working
around it.

Two more things fail the run rather than passing quietly: art byte-identical to
the tile already in place (your PNGs are consumed and nothing changes, so the
job stops instead of opening an empty PR), and a medal source saved without an
alpha channel (it would fill the whole tile with a solid rectangle).
