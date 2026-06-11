# Examples

A standalone example you can run locally to test the Elevation Profile control
outside GeoLibre, using plain MapLibre GL JS.

## Basic example

`basic/` mounts the `ElevationProfileControl` on a MapLibre map centered over the
Pennine Alps. Open the mountain icon (top-right), click **Draw line**, click
points across the terrain, and double-click to finish.

## Run locally

```bash
npm install
npm run dev
# then open http://localhost:5173/examples/basic/
```

The dev server's landing page (http://localhost:5173/) also links to the
example.

## Build for deployment

```bash
npm run build:examples
```

The static site is written to `dist-examples/`. The same build is published to
GitHub Pages on every push to `main` (see `.github/workflows/deploy-pages.yml`).
