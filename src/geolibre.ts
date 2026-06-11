import { ElevationProfileControl } from './lib/core/ElevationProfileControl';
import type { ElevationProfileState } from './lib/core/types';
import type {
  GeoLibreMapControlPosition,
  GeoLibrePlugin,
} from './lib/geolibre/host-api';
import type { LngLat } from './lib/elevation/geometry';
import type { UnitSystem } from './lib/elevation/format';
import { ELEVATION_LINE_PARAM, maybeHandleDeepLink } from './lib/utils/deep-link';
import './lib/styles/elevation-profile.css';

let control: ElevationProfileControl | null = null;
let position: GeoLibreMapControlPosition = 'top-left';
let pendingState: Partial<ElevationProfileState> | null = null;

function createControl(): ElevationProfileControl {
  const next = new ElevationProfileControl({
    collapsed: pendingState?.collapsed ?? true,
    unitSystem: pendingState?.unitSystem ?? 'metric',
  });
  if (pendingState) next.setState(pendingState);
  return next;
}

function isLngLatArray(value: unknown): value is LngLat[] {
  return (
    Array.isArray(value) &&
    value.every(
      (pair) =>
        Array.isArray(pair) &&
        pair.length === 2 &&
        typeof pair[0] === 'number' &&
        typeof pair[1] === 'number',
    )
  );
}

function isPluginState(value: unknown): value is Partial<ElevationProfileState> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  if ('collapsed' in candidate && typeof candidate.collapsed !== 'boolean') {
    return false;
  }
  if (
    'unitSystem' in candidate &&
    candidate.unitSystem !== 'metric' &&
    candidate.unitSystem !== 'imperial'
  ) {
    return false;
  }
  if (
    'line' in candidate &&
    candidate.line !== null &&
    !isLngLatArray(candidate.line)
  ) {
    return false;
  }
  return true;
}

/**
 * The GeoLibre plugin entry point. GeoLibre loads the built bundle and reads
 * this exported object to drive the plugin lifecycle.
 */
export const plugin: GeoLibrePlugin<ElevationProfileControl> = {
  id: 'geolibre-elevation-profile',
  name: 'Elevation Profile',
  version: '0.1.0',
  urlParameterNames: [ELEVATION_LINE_PARAM],

  activate(app) {
    control = control ?? createControl();
    const added = app.addMapControl(control, position);
    if (!added) {
      control = null;
      return false;
    }
  },

  // Deep link: GeoLibre auto-activates the plugin for a URL like
  // ?elevation-line=13.41,52.52;8.23,46.85 and dispatches the params here.
  handleUrlParameters(_app, params) {
    if (control) return maybeHandleDeepLink(control, params);
  },

  deactivate(app) {
    if (!control) return;
    pendingState = control.getState();
    app.removeMapControl(control);
    control = null;
  },

  getMapControlPosition() {
    return position;
  },

  setMapControlPosition(app, nextPosition) {
    position = nextPosition;
    if (!control) return;
    app.removeMapControl(control);
    const added = app.addMapControl(control, position);
    if (!added) {
      pendingState = control.getState();
      control = null;
      return false;
    }
  },

  getProjectState() {
    return control?.getState() ?? pendingState ?? undefined;
  },

  applyProjectState(_app, state) {
    if (!isPluginState(state)) return false;
    pendingState = state as Partial<ElevationProfileState> & {
      unitSystem?: UnitSystem;
    };
    control?.setState(pendingState);
  },
};

export default plugin;
