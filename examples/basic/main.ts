import maplibregl from 'maplibre-gl';
import { ElevationProfileControl } from '../../src/index';
import '../../src/index.css';
import 'maplibre-gl/dist/maplibre-gl.css';

// Center over the Pennine Alps (near the Matterhorn) for dramatic terrain.
const map = new maplibregl.Map({
  container: 'map',
  style: 'https://tiles.openfreemap.org/styles/liberty',
  center: [7.75, 45.95],
  zoom: 10.5,
});

map.addControl(new maplibregl.NavigationControl(), 'top-right');
map.addControl(new maplibregl.FullscreenControl(), 'top-right');

map.on('load', () => {
  // Start expanded so the panel is visible immediately in the example.
  const elevationProfile = new ElevationProfileControl({
    collapsed: false,
    panelWidth: 320,
  });
  map.addControl(elevationProfile, 'top-right');
  map.addControl(new maplibregl.GlobeControl(), 'top-right');

  console.info('Elevation Profile control added. Draw a line to profile it.');
});
