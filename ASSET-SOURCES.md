# Current runtime sources

The current world uses local Three.js 0.180.0 (MIT; `assets/vendor/three-LICENSE.txt`), original authored fan-art geometry, canvas text textures, procedural sky/ocean, and the Poly Haven CC0 wooden-plank textures on the Sunny. No AI image is loaded.

The previous Island Tree 01 GLBs, packed tree Blender source and photographic sky JPEG are retained locally as unused historical assets. They are no longer loaded and are excluded from this publication. All mentions of them in the historical notes below refer to the earlier revision.

The enlarged island measures 295 × 237 world units in radius, 19.99 times the previous footprint area, with human and ship geometry kept at the same scale. `src/megaworld.js` adds 339 pod buildings, 85 towers, 138 outer palms, connected road rings and landmarks using instanced meshes. The latest route prioritizes the world and ship. Content surfaces are real meshes inside twelve smaller physical exhibits, with separate project, achievement, report, CVE, writing and contact locations. The city footprint was enlarged and a rear district added. This remains stylized fan art, not an exhaustive or exact canon replica.

Official reference sources consulted for this revision:
- https://one-piece.com/story/egghead/index.html
- https://one-piece.com/figure/71487/index.html
- https://one-piece.com/character/Emet/index.html

Current verification captures: `docs/screenshots/current/`. Older reports and screenshots below are historical, not measurements of this revision.

---

# Asset and library sources

## Portfolio content

The selected-project descriptions in `content/projects.json` point to Karan RJ's public GitHub repositories and two team repositories pinned on his public profile: [Concord](https://github.com/BeyondBug/Concord) and [VigilentOps](https://github.com/BeyondBug/VigilentOps). Profile and contact details come from the existing portfolio content and public profile links. CVE, report, article and achievement collections are empty until verified public entries are supplied.

## Runtime

- Three.js **0.180.0**, `assets/vendor/three.core.min.js`, `three.module.min.js`, `utils/BufferGeometryUtils.js`, `environments/RoomEnvironment.js`, `exporters/GLTFExporter.js`.
- Upstream: https://github.com/mrdoob/three.js/tree/r180 . MIT licence: [assets/vendor/three-LICENSE.txt](assets/vendor/three-LICENSE.txt).
- Local copies were obtained from the already installed r180 package and vendored modules in the existing workspace. Addon imports were changed to local relative module paths. There is no runtime CDN, npm install or bundler requirement.

## Original generated scene

`src/geometry.js`, `src/world.js`, `src/zoro.js`, `src/journey.js`, `src/sunny.js`, `src/encounters.js`, `src/adventure.js` and `src/assembly.js` generate the editable geometry, layout, vertex colours, material settings, wordmark textures, procedural ocean and animated transport routes. The character, ship and architecture are authored fan art; the tree, sky and wood assets listed below are licensed third-party additions. No AI image is loaded by the world. One Piece character/setting rights remain with their respective owners; this is an unofficial personal fan-art study.

`assets/world/egghead-world.glb` is an optional generated glTF 2.0 export of the authoring hierarchy, including building/character parts, the scanned trees, material-batched moving assemblies, instanced palms, local label textures, a sun light and the 125-second `Egghead_Journey` camera clip. It is generated with the vendored Three.js GLTFExporter. The browser uses source-generated geometry plus the separate optimized tree GLB and does **not** download this complete world GLB on startup. Ocean/sky shaders and live idle/wind/transit/landing/combat/robot motion are implemented in JavaScript and are not baked into the GLB. The complete GLB is suitable for import into Blender; a separate packed `.blend` source for the optimized tree is included.

## Licensed additions for the current scene

All three sources are [Poly Haven CC0](https://polyhaven.com/license). Source metadata and file checksums were checked before import. The model and materials are bundled locally; the page makes no asset request to Poly Haven at runtime.

- [Island Tree 01](https://polyhaven.com/a/island_tree_01), by Rico Cilliers and Rob Tuytel: scanned 1K glTF material and mesh, reduced in Blender from 1,599,403 faces to 71,973 faces for `assets/models/island-tree-01.glb` and 23,031 faces for `assets/models/island-tree-01-mobile.glb`. Six clones share the loaded geometry and materials. The packed, editable optimized source is `assets/source/island-tree-01.blend`.
- [Kloofendal 48d Partly Cloudy Pure Sky](https://polyhaven.com/a/kloofendal_48d_partly_cloudy_puresky): 1K HDR source converted to a 2048×1024 local JPEG in `assets/textures/egghead-sky.jpg`. The sky sphere blends the photographic cloud layer into the original Egghead colour gradient near the horizon.
- [Wooden Planks](https://polyhaven.com/a/wooden_planks), by Charlotte Baglioni and Dario Barresi: 1K diffuse, normal and roughness JPEG maps in `assets/textures/sunny-wood-*`. These add surface detail to the Sunny's hull and deck.

`assets/poster.webp` is a clean render of the original 3D scene, without the page UI, generated by `scripts/verify-world.mjs`. It supplies the still fallback when WebGL cannot initialise. `docs/screenshots/` holds generated browser verification captures. `docs/verification.json` and `docs/firefox-verification.json` contain measured checks.

## Reference images

See [research/README.md](research/README.md) and [research/references/sources.json](research/references/sources.json). Retrieved reference pictures and supplied screenshots are kept in `research/references/` for visual study. They are not loaded by the application, generated by this project, or represented as licensed runtime textures. No Wano or Spectrona assets are used in this project.

## Expanded adventure assets

- `src/sunny.js`: original lofted hull geometry, wooden hull joints, rails, sails, Straw Hat mesh emblem, lion prow, cabin, rigging, orange trees and small Luffy figure. The 6.3-second landing and splash sequence is original fan-art choreography, not a frame-accurate recreation of a canonical landing.
- `src/encounters.js`: original S-Hawk and Emet geometry; three drawn katana models, a 7.5-second repeating combat sequence, sparse sword trails and impact rays. These are simplified stylised fan-art characters, not official production meshes.
- `src/assembly.js`: original seeded 128×128 normal maps and canvas-generated 64×64 contact-shadow textures. They are produced locally without image-generation or external texture downloads.
- `src/adventure.js`: original pier, harbour fixtures, twelve additional city blocks, service paths/cabinets, energy turbines and ascent gantry.
- `docs/expansion-baseline.json`: recorded earlier route length, tour duration and island footprint. `docs/adventure-verification.json` and `docs/adventure-firefox-verification.json`: new measured browser checks. New screenshots include nine destination frames, mobile frames and timed action poses. `assets/poster.webp` and `assets/world/egghead-world.glb` were regenerated for the expanded scene. No new library was added.

Character/setting research for this expansion is recorded in [research/README.md](research/README.md). Research imagery remains outside the runtime assets.

## Cinematic camera revision

`src/journey.js` now authors 24 original camera poses, continuous position/heading/pitch/lens interpolation and a critically damped scroll controller. The existing Swarm `forest-motion.js` controller was read as a movement reference; the DogFood project was not edited. `src/adventure.js` blends subject tracking and coordinates the ship with journey progress. The poster and GLB camera clip were regenerated. Live lens changes and subject tracking are implemented in JavaScript; the GLB has a fixed-lens camera clip. No additional library or downloaded asset was used.

Measurements and new captures: `docs/CINEMATIC-VERIFICATION.md`, `docs/cinematic-verification.json`, `docs/cinematic-firefox-verification.json` and the existing `docs/screenshots/` directory. The camera tests are in `scripts/test-journey.mjs`; rendering checks use the existing Chromium/Firefox scripts.
