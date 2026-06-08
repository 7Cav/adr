# uniform-uploads

Drop folder for queuing new Uniform Builder awards. Pushing a change under this
folder triggers the **award_sprites** GitHub Actions workflow, which regenerates
the sprite sheets and opens a pull request for review.

## How to add an award

1. **Edit the registry first.** Add (and renumber) the award in
   `client/app/uniformbuilder/modules/AwardRegistry.jsx`. This is the single
   source of truth for placement — CI reads `awardPriority` / `medalPriority`
   from it; the manifest never restates row numbers.
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

   - `name` must match the registry award name exactly.
   - Supply `ribbon` if the award has an `awardPriority`, and `medal` if it has
     a `medalPriority`. Service ribbons have both; pure ribbons have only
     `ribbon`.

4. **Push.** CI validates the manifest against the registry, splices the tiles
   into the sprite sheets at the registry-derived rows, removes the consumed
   PNGs, empties the manifest, and opens a PR containing only the regenerated
   sheets and this cleanup. Review and merge it.

CI never edits the registry, never touches the `.xcf` GIMP sources, and never
auto-merges.

## Adding new art vs. fixing existing art

Two modes, selected per entry:

- **New award (default) — insert.** Omit `replace` (or set it to `false`). CI
  splices the tile in at the registry-derived row and shifts every row below it
  down by one tile. Use this only for an award that is **new to the sheet**, and
  renumber the registry as in step 1 so the priorities below it move too.
- **Existing award — replace.** Set `"replace": true`. CI overwrites the tile
  already at that award's registry row in place — no shift, no height change —
  so re-uploading art for an award that already has a tile fixes it instead of
  inserting a duplicate.

  ```json
  [
    {
      "name": "Combat Action Badge",
      "medal": "CAB_v2.png",
      "replace": true
    }
  ]
  ```

  Do **not** renumber the registry for a replace — the award keeps its existing
  priority. Replacing a row that doesn't exist yet (a priority past the end of
  the sheet) fails the run; use an insert for a genuinely new award.
