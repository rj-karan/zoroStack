# Karan RJ — Egghead portfolio

An unofficial, independently authored One Piece Egghead world. The island has 172 × 138 unit radii, with a wider grassland and a dense coastal forest of tall trunks, layered leaf crowns, palms and understory plants around the futuristic city. Its saucer towers, ring laboratories, transparent habitats and transit tubes sit beneath the cloud platform carrying Punk Records. Marine warships, pirate vessels and animated mechanical sea beasts circle the coast; small service robots patrol the city and Vega Force 1 moves through the shallows. Scroll with the Sunny as it circles the island, fires its Coup de Burst, lands at the harbour, then continues through Fabriophase, Zoro's promenade, Emet and Punk Records. Twelve physical displays sit at those locations. Click a display to read it; scroll or press Escape to return to the world.

The setting is a stylized fan-art interpretation, not an exact reconstruction of every character and object in the arc. The current characters are Zoro in his Egghead clothing, S-Hawk, Emet and a small Luffy on the Sunny. The scene uses authored geometry, local Three.js and credited wood textures. There are no AI-generated image assets, photographic sky or scanned broadleaf trees in the running scene.

## Run

```sh
python server.py --host 127.0.0.1 --port 8090
```

Open http://localhost:8090/. No installation or build step is required. The published project lives at https://zororj.me/zoroStack/; the root GitHub Pages repository redirects https://zororj.me/ there.

## Content and editing

- `content/site.json`: biography, introduction and social/contact links.
- `content/projects.json`: six selected projects, with additional entries paginated on the final project display.
- `content/reports.json`, `cves.json`, `articles.json`, `achievements.json`: separate archives at separate locations. Unpublished entries are omitted.
- Reports and articles accept `summary`, `body` and optional external `url`. Long text is paginated on the physical display. Markdown source is currently shown as plain text in this world version.
- No public CVEs, reports, articles or achievements have been supplied; those archives honestly show an empty state.
- `.pages.yml` is the Pages CMS editing schema. The content is ready for a GitHub-backed editor; the repository owner must sign in to Pages CMS and authorize the repository to use its hosted editor. No CMS login/backend is bundled in the site.
- `directory.html` is a keyboard-accessible, readable alternative containing the same content and working links.

## Source

`src/world.js` and `src/megaworld.js` build the 172 × 138 unit island, layered grass, rocky forested shoreline, compact city, palms, transit, cloud platform and cracked Punk Records dome. `sunny.js`, `fleet.js`, `creatures.js`, `zoro.js`, `encounters.js` and `adventure.js` contain the ships, sea beasts, robots, character geometry and animation. `exhibit-route.js` records the content locations. `portfolio.js` creates physical terminals with safe URL handling, text pagination and raycast interactions. `journey.js` defines the world-first camera route; `main.js` handles lighting, motion and reading focus.

See `ASSET-SOURCES.md` for source credits. Current previews: [island overview](docs/egghead-overview.png), [coastal forest](docs/egghead-forest.png), [fleet](docs/egghead-fleet.png) and [Sunny harbour landing](docs/egghead-harbor.png). The `research/` images are study references, not runtime textures. Historical screenshots and measurements are retained in `docs/`; the current route captures are under `docs/screenshots/current/`.

## Verification

```sh
node --test --test-isolation=none scripts/test-journey.mjs
node scripts/verify-portfolio.mjs
```

The browser script requires local Chromium and a running preview. It checks the twelve stations, real clicks on physical controls, pagination, repository URLs, the text directory, mobile layout and runtime exceptions. Phone checks are viewport emulation, not physical-device testing. Rendering speed depends on the device; the scene reduces resolution on slow hardware.

`WORLD_EXPORT=1 node scripts/verify-world.mjs` optionally regenerates `assets/world/egghead-world.glb` for Blender. The website builds its scene from source and does not download this optional authoring export. JavaScript animation and custom ocean/sky shaders are not baked into GLB.

The enlarged scene remains an original stylized interpretation of Egghead. [Official Egghead story and imagery](https://one-piece.com/story/egghead/index.html) were used as visual reference; this is not an exhaustive reproduction of every arc asset.
