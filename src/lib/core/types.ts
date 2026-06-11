import type { LngLat } from '../elevation/geometry';
import type { UnitSystem } from '../elevation/format';

/** Corner of the map the control can dock to. */
export type ControlPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

/** Options for configuring the {@link ElevationProfileControl}. */
export interface ElevationProfileControlOptions {
  /** Start collapsed (toggle button only). @default true */
  collapsed?: boolean;
  /** Title shown in the panel header. @default 'Elevation Profile' */
  title?: string;
  /** Panel width in pixels. @default 320 */
  panelWidth?: number;
  /** Initial unit system. @default 'metric' */
  unitSystem?: UnitSystem;
  /** Extra CSS class for the control container. */
  className?: string;
  /**
   * Maximum number of points sampled per elevation request. Capped at the
   * provider limit (100) internally. @default 100
   */
  maxSamples?: number;
}

/** Serializable state persisted with a GeoLibre project. */
export interface ElevationProfileState {
  /** Whether the panel is collapsed. */
  collapsed: boolean;
  /** Active unit system. */
  unitSystem: UnitSystem;
  /** The profiled line as `[lng, lat]` vertices, or `null` when none is drawn. */
  line: LngLat[] | null;
}
