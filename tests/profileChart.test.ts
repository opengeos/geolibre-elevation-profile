import { describe, it, expect } from 'vitest';
import {
  buildChartGeometry,
  type ProfilePoint,
} from '../src/lib/chart/profileChart';

const PADDING = { top: 10, right: 10, bottom: 20, left: 40 };
const WIDTH = 240;
const HEIGHT = 120;

const points: ProfilePoint[] = [
  { distance: 0, elevation: 100 },
  { distance: 50, elevation: 150 },
  { distance: 100, elevation: 120 },
];

describe('buildChartGeometry', () => {
  it('maps distance to the horizontal plot range', () => {
    const geo = buildChartGeometry(points, WIDTH, HEIGHT, PADDING);
    expect(geo.xScale(0)).toBeCloseTo(PADDING.left, 6);
    expect(geo.xScale(geo.totalDistance)).toBeCloseTo(WIDTH - PADDING.right, 6);
    expect(geo.xScale(50)).toBeCloseTo((PADDING.left + (WIDTH - PADDING.right)) / 2, 6);
  });

  it('maps the lowest elevation to the bottom and the highest to the top', () => {
    const geo = buildChartGeometry(points, WIDTH, HEIGHT, PADDING);
    const plotBottom = HEIGHT - PADDING.bottom;
    expect(geo.yScale(geo.minElevation)).toBeCloseTo(plotBottom, 6);
    expect(geo.yScale(geo.maxElevation)).toBeCloseTo(PADDING.top, 6);
  });

  it('reports min and max elevation', () => {
    const geo = buildChartGeometry(points, WIDTH, HEIGHT, PADDING);
    expect(geo.minElevation).toBe(100);
    expect(geo.maxElevation).toBe(150);
  });

  it('builds a line path beginning with a move command and an closed area path', () => {
    const geo = buildChartGeometry(points, WIDTH, HEIGHT, PADDING);
    expect(geo.linePath.startsWith('M')).toBe(true);
    expect(geo.linePath).toContain('L');
    expect(geo.areaPath.endsWith('Z')).toBe(true);
  });

  it('centers a flat profile without producing NaN', () => {
    const flat: ProfilePoint[] = [
      { distance: 0, elevation: 200 },
      { distance: 100, elevation: 200 },
    ];
    const geo = buildChartGeometry(flat, WIDTH, HEIGHT, PADDING);
    const y = geo.yScale(200);
    expect(Number.isNaN(y)).toBe(false);
    expect(y).toBeCloseTo(PADDING.top + (HEIGHT - PADDING.top - PADDING.bottom) / 2, 6);
  });

  it('resolves hover x to the nearest sample index', () => {
    const geo = buildChartGeometry(points, WIDTH, HEIGHT, PADDING);
    expect(geo.indexForX(PADDING.left)).toBe(0);
    expect(geo.indexForX(WIDTH - PADDING.right)).toBe(points.length - 1);
    expect(geo.indexForX((PADDING.left + (WIDTH - PADDING.right)) / 2)).toBe(1);
  });

  it('clamps hover x outside the plot range', () => {
    const geo = buildChartGeometry(points, WIDTH, HEIGHT, PADDING);
    expect(geo.indexForX(-100)).toBe(0);
    expect(geo.indexForX(10000)).toBe(points.length - 1);
  });

  it('handles a single point and degenerate distance', () => {
    const single: ProfilePoint[] = [{ distance: 0, elevation: 50 }];
    const geo = buildChartGeometry(single, WIDTH, HEIGHT, PADDING);
    expect(geo.indexForX(123)).toBe(0);
    expect(geo.xScale(0)).toBeCloseTo(PADDING.left, 6);
    expect(geo.linePath.startsWith('M')).toBe(true);
  });
});
