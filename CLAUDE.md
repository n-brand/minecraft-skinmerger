# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static, client-side-only web page that merges two Minecraft Java Edition
skins (64x64 PNGs): for each body part and layer, the user picks whether the
output takes that piece from Skin A or Skin B (e.g. keep your own head, take
torso/arms/legs from another skin).

## Running it

No build step, no package manager, no dependencies. Either open
`index.html` directly in a browser, or serve the folder with any static
file server (e.g. `npx serve .`) — a server is only needed because some
browsers restrict `canvas.toDataURL()` for pages opened via `file://`.

There is no lint config and no test suite in this repo.

## Architecture

- `index.html` — markup only (two file inputs, the per-part toggle grid
  container, the output canvas/download link). No inline logic.
- `style.css` — styling only.
- `app.js` — a single classic (non-module) script; everything lives here:
  - `REGIONS`: the fixed UV rectangle for every (body part, layer) pair in
    the standard 64x64 skin template — this is the load-bearing data. If
    you ever need to touch these coordinates, re-derive/verify them against
    the actual Minecraft skin UV layout rather than guessing; a wrong
    offset produces a subtly corrupted skin rather than an obvious error.
  - `state`: per-part/per-layer record of which source ('A' or 'B') is
    currently selected; driven by the toggle buttons built in
    `buildPartsGrid()`.
  - `images.A` / `images.B`: the two loaded skin images, set by
    `handleFileInput()` after validating the upload is exactly 64x64.
  - `renderMerge()`: draws all of Skin A onto the output canvas, then for
    every region toggled to 'B', clears that destination rectangle before
    drawing the corresponding rectangle from Skin B. The `clearRect` before
    each region draw is intentional: overlay-layer pixels are often
    semi-transparent, and without clearing first they'd alpha-blend with
    whatever was left underneath instead of cleanly replacing it.
- Model type (slim/classic arms) is not tracked — it's account metadata
  interpreted by the game client, not something derivable from the skin
  file's pixel layout, so region-copying works the same regardless.
- Only 64x64 skins are accepted; legacy 64x32 skins are rejected rather
  than auto-upgraded.
