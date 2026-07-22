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
2. **Drop the source art** here as PNG(s):
   - Ribbon art: ideally 43×13, RGB or RGBA (it is vertically stretched to
     43×14).
   - Medal art: any size, RGBA with transparency (it is scaled to fit a 70×120
     tile, centered horizontally, top-aligned on transparency).
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
   - Supply `ribbon` if the award has an `awardPriority`, and `medal` if it has
     a `medalPriority` of 2 or higher. Service ribbons have both; pure ribbons
     have only `ribbon`. Priorities 0 and 1 are the two Lifetime medals, which
     sit on the ribbon sheet only.
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
  the sheet) fails the run; use an insert for a genuinely new award.
