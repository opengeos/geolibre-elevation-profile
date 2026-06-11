import { describe, it, expect, beforeEach } from 'vitest';
import { ElevationProfileControl } from '../src/lib/core/ElevationProfileControl';
import type { Map as MapLibreMap } from 'maplibre-gl';

/**
 * A minimal MapLibre map stub. The control only needs a container, a canvas with
 * a mutable style, event (de)registration, and the source/layer methods (which
 * are guarded by `isStyleLoaded` returning false here, so they are never hit).
 */
function createFakeMap(): { map: MapLibreMap; container: HTMLElement } {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const map = {
    getContainer: () => container,
    getCanvas: () => ({ style: {} as CSSStyleDeclaration }),
    isStyleLoaded: () => false,
    on: () => {},
    off: () => {},
    once: () => {},
    doubleClickZoom: { disable: () => {}, enable: () => {} },
    addSource: () => {},
    getSource: () => undefined,
    addLayer: () => {},
    getLayer: () => undefined,
    removeLayer: () => {},
    removeSource: () => {},
    fitBounds: () => {},
  };
  return { map: map as unknown as MapLibreMap, container };
}

describe('ElevationProfileControl', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('builds a toggle button and an attached panel on add', () => {
    const { map, container } = createFakeMap();
    const control = new ElevationProfileControl();
    const el = control.onAdd(map);

    expect(el.querySelector('.elevation-profile-toggle')).not.toBeNull();
    // The floating panel is appended to the map container, not the control.
    expect(container.querySelector('.elevation-profile-panel')).not.toBeNull();
  });

  it('reports sensible default state', () => {
    const { map } = createFakeMap();
    const control = new ElevationProfileControl();
    control.onAdd(map);
    expect(control.getState()).toEqual({
      collapsed: true,
      unitSystem: 'metric',
      line: null,
    });
  });

  it('expands and collapses the panel', () => {
    const { map, container } = createFakeMap();
    const control = new ElevationProfileControl();
    control.onAdd(map);
    const panel = container.querySelector('.elevation-profile-panel')!;

    expect(panel.classList.contains('expanded')).toBe(false);
    control.expand();
    expect(panel.classList.contains('expanded')).toBe(true);
    control.collapse();
    expect(panel.classList.contains('expanded')).toBe(false);
  });

  it('cycles the unit system when the unit button is clicked', () => {
    const { map, container } = createFakeMap();
    const control = new ElevationProfileControl();
    control.onAdd(map);
    const unitButton = container.querySelector<HTMLButtonElement>(
      '.elevation-profile-unit',
    )!;

    expect(unitButton.textContent).toBe('m / km');
    unitButton.click();
    expect(unitButton.textContent).toBe('ft / mi');
    expect(control.getState().unitSystem).toBe('imperial');
  });

  it('removes the panel and container on remove', () => {
    const { map, container } = createFakeMap();
    const control = new ElevationProfileControl();
    control.onAdd(map);
    expect(container.querySelector('.elevation-profile-panel')).not.toBeNull();
    control.onRemove();
    expect(container.querySelector('.elevation-profile-panel')).toBeNull();
  });

  it('renders the chart SVG and reveals export buttons after profiling a line', async () => {
    const { map, container } = createFakeMap();
    const control = new ElevationProfileControl({ collapsed: false });
    control.onAdd(map);

    const elevations = Array.from({ length: 100 }, (_, i) => 100 + i);
    const fetchMock = vi.fn(
      async () =>
        ({
          ok: true,
          status: 200,
          json: async () => ({ elevation: elevations }),
        }) as Response,
    );
    const originalFetch = globalThis.fetch;
    globalThis.fetch = fetchMock as typeof fetch;
    try {
      await control.loadLine([
        [0, 0],
        [0, 1],
      ]);
    } finally {
      globalThis.fetch = originalFetch;
    }

    // The chart must actually render (regression: it was hidden by :empty).
    expect(container.querySelector('.elevation-profile-svg')).not.toBeNull();
    const exportRow = container.querySelector<HTMLElement>(
      '.elevation-profile-export',
    )!;
    expect(exportRow.style.display).toBe('flex');
  });

  it('routes CSV and SVG export through the host exportTextFile', async () => {
    const { map } = createFakeMap();
    const exportTextFile = vi.fn();
    const control = new ElevationProfileControl({
      collapsed: false,
      exportTextFile,
    });
    control.onAdd(map);

    const fetchMock = vi.fn(
      async () =>
        ({
          ok: true,
          status: 200,
          json: async () => ({
            elevation: Array.from({ length: 100 }, (_, i) => 100 + i),
          }),
        }) as Response,
    );
    const originalFetch = globalThis.fetch;
    globalThis.fetch = fetchMock as typeof fetch;
    try {
      await control.loadLine([
        [0, 0],
        [0, 1],
      ]);
    } finally {
      globalThis.fetch = originalFetch;
    }

    const panel = map.getContainer();
    const [csvBtn, svgBtn] = Array.from(
      panel.querySelectorAll<HTMLButtonElement>('.elevation-profile-button-sm'),
    );
    csvBtn.click();
    svgBtn.click();

    expect(exportTextFile).toHaveBeenCalledTimes(2);
    expect(exportTextFile.mock.calls[0][0]).toBe('elevation-profile.csv');
    expect(exportTextFile.mock.calls[0][1]).toContain('distance_m,elevation_m');
    expect(exportTextFile.mock.calls[1][0]).toBe('elevation-profile.svg');
    expect(exportTextFile.mock.calls[1][1]).toContain('<svg');
  });

  it('honors initial options', () => {
    const { map, container } = createFakeMap();
    const control = new ElevationProfileControl({
      collapsed: false,
      unitSystem: 'imperial',
      title: 'Terrain Profile',
    });
    control.onAdd(map);
    const panel = container.querySelector<HTMLElement>('.elevation-profile-panel')!;
    expect(panel.classList.contains('expanded')).toBe(true);
    expect(panel.querySelector('.elevation-profile-title')?.textContent).toBe(
      'Terrain Profile',
    );
    expect(control.getState().unitSystem).toBe('imperial');
  });
});
