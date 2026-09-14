# minecraft-skinmerger

A small client-side web tool for combining two Minecraft Java Edition skins.
Upload two 64x64 skin PNGs and choose, per body part (head, torso, arms, legs)
and per layer (base / overlay), which of the two skins that piece comes from
— e.g. keep your own head but take the torso, arms and legs (with their
"jacket" overlay) from another skin to put it in a suit. The merged result
can be downloaded as a new skin PNG.

No build step, no server, no dependencies: it's a static `index.html` plus
plain JS/CSS. Open `index.html` in a browser, or serve the folder with any
static file server.

## How it works

A Java Edition skin packs every body part into fixed pixel regions of a
64x64 PNG (see the [Minecraft Wiki skin article](https://minecraft.wiki/w/Skin)).
Those regions are the same for every skin, so combining two skins is just
copying the chosen rectangular regions from one PNG onto the other — see
`app.js` for the exact coordinates (`REGIONS`).

Slim vs. classic arm width is not tracked in the file itself (it's account
metadata interpreted by the game client), so it isn't handled specially
here — the merged file just carries over whichever pixels were selected.

Only 64x64 skins are supported; legacy 64x32 skins aren't auto-converted.