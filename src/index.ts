// Import styles
import './lib/styles/elevation-profile.css';

// Core control
export { ElevationProfileControl } from './lib/core/ElevationProfileControl';

// Types
export type {
  ElevationProfileControlOptions,
  ElevationProfileState,
  ControlPosition,
} from './lib/core/types';

// GeoLibre host-plugin contract
export type {
  GeoLibreAppAPI,
  GeoLibrePlugin,
  GeoLibreControl,
  GeoLibreMapControlPosition,
} from './lib/geolibre/host-api';

// Elevation + geometry helpers
export {
  haversineMeters,
  cumulativeDistances,
  resampleLine,
  computeStats,
} from './lib/elevation/geometry';
export type {
  LngLat,
  ResampledLine,
  ProfileStats,
} from './lib/elevation/geometry';

export {
  fetchElevations,
  ElevationFetchError,
  MAX_POINTS_PER_REQUEST,
} from './lib/elevation/client';
export type { FetchLike } from './lib/elevation/client';

export {
  formatDistance,
  formatElevation,
  unitSystemLabel,
  UNIT_SYSTEMS,
} from './lib/elevation/format';
export type { UnitSystem } from './lib/elevation/format';

// Chart geometry
export { buildChartGeometry } from './lib/chart/profileChart';
export type {
  ProfilePoint,
  ChartGeometry,
  ChartPadding,
} from './lib/chart/profileChart';

// Deep-linking helpers
export {
  ELEVATION_LINE_PARAM,
  getElevationLineValue,
  encodeLine,
  parseLine,
  maybeHandleDeepLink,
} from './lib/utils/deep-link';
export type { DeepLinkConsumer } from './lib/utils/deep-link';
