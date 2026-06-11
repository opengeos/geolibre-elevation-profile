# GeoLibre Elevation Profile

A [GeoLibre](https://github.com/opengeos/GeoLibre) plugin that lets you **draw a
line on the map and instantly see an elevation profile along it**, with total
distance, ascent/descent, and min/max elevation. Elevations are sampled from the
free, key-less [Open-Meteo elevation API](https://open-meteo.com/en/docs/elevation-api).

Built from the [GeoLibre plugin template](https://github.com/opengeos/geolibre-plugin-template).
The control is a standard MapLibre `IControl`, so it also works in any plain
MapLibre GL JS app.

## Features

- **Draw to profile** - click points on the map, double-click (or press `Enter`)
  to finish, `Esc` to cancel.
- **Inline chart** - a self-contained SVG area chart (no chart library) of
  elevation vs. distance, with a hover crosshair that drops a marker on the map.
- **Stats** - total distance, min / max elevation, total ascent (up) and descent (down).
- **Export** - save the samples as **CSV** or the chart as an **SVG** image. Uses
  GeoLibre's host file save, so it works under both the Tauri desktop app (native
  save dialog) and the web app.
- **Metric / imperial** toggle for all readouts.
- **Theme-aware** - follows GeoLibre's light/dark design tokens, with standalone
  fallbacks.
- **Shareable & persistent** - the drawn line is saved with GeoLibre projects and
  can be shared by URL via `?elevation-line=lng,lat;lng,lat;...`.

## How it works

The line is resampled to at most 100 evenly spaced points (the Open-Meteo
per-request limit), elevations are fetched in a single request, and the profile
chart and statistics are rendered from the result. The endpoints of the drawn
line are always preserved.

## Install into GeoLibre

This plugin is published to the [GeoLibre marketplace](https://plugins.geolibre.app).
You can also build and load it directly:

```bash
npm install
npm run build:geolibre      # emits geolibre-plugin/dist/index.js + style.css
npm run package:geolibre     # zip for manual install
npm run install:geolibre     # install into a local GeoLibre Desktop build
```

The GeoLibre bundle and its manifest live in `geolibre-plugin/` (`plugin.json`
plus the built `dist/`).

## Development

```bash
npm install
npm run dev          # live demo (index.html) over the Matterhorn
npm test             # unit + control smoke tests (vitest)
npm run lint         # eslint
npm run build        # library build (ESM + CJS + types) and GeoLibre bundle
```

### Source layout

| Path | Responsibility |
| --- | --- |
| `src/lib/elevation/geometry.ts` | haversine distance, resampling, profile stats (pure) |
| `src/lib/elevation/format.ts` | metric/imperial distance & elevation formatting (pure) |
| `src/lib/elevation/client.ts` | Open-Meteo fetch client (injectable `fetch`) |
| `src/lib/chart/profileChart.ts` | SVG path + axis + hover geometry (pure) |
| `src/lib/core/ElevationProfileControl.ts` | the MapLibre `IControl` (DOM, drawing, rendering) |
| `src/lib/utils/deep-link.ts` | encode/parse the shareable line URL parameter |
| `src/geolibre.ts` | GeoLibre plugin entry point and lifecycle |

The pure modules carry the logic and are unit-tested; the control wires them to
the map and the panel UI.

## Use as a MapLibre control

```ts
import maplibregl from 'maplibre-gl';
import { ElevationProfileControl } from 'geolibre-elevation-profile';
import 'geolibre-elevation-profile/style.css';

const map = new maplibregl.Map({ /* ... */ });
map.addControl(new ElevationProfileControl({ collapsed: false }), 'top-right');
```

## License

MIT
