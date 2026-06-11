import { describe, it, expect } from 'vitest';
import {
  haversineMeters,
  cumulativeDistances,
  resampleLine,
  computeStats,
  type LngLat,
} from '../src/lib/elevation/geometry';

describe('haversineMeters', () => {
  it('is zero for identical points', () => {
    expect(haversineMeters([0, 0], [0, 0])).toBe(0);
  });

  it('measures ~111.195 km for one degree of latitude', () => {
    expect(haversineMeters([0, 0], [0, 1])).toBeCloseTo(111194.9, 0);
  });

  it('measures ~111.195 km for one degree of longitude at the equator', () => {
    expect(haversineMeters([0, 0], [1, 0])).toBeCloseTo(111194.9, 0);
  });

  it('shrinks longitude distance with latitude (cos factor)', () => {
    const atEquator = haversineMeters([0, 0], [1, 0]);
    const atSixty = haversineMeters([0, 60], [1, 60]);
    // One degree of longitude at 60N is about half the equatorial value.
    expect(atSixty).toBeCloseTo(atEquator * Math.cos((60 * Math.PI) / 180), -1);
  });

  it('is symmetric', () => {
    const a: LngLat = [-122.3, 47.6];
    const b: LngLat = [-122.1, 47.7];
    expect(haversineMeters(a, b)).toBeCloseTo(haversineMeters(b, a), 9);
  });
});

describe('cumulativeDistances', () => {
  it('starts at zero and accumulates per segment', () => {
    const coords: LngLat[] = [
      [0, 0],
      [0, 1],
      [0, 2],
    ];
    const result = cumulativeDistances(coords);
    expect(result).toHaveLength(3);
    expect(result[0]).toBe(0);
    expect(result[1]).toBeCloseTo(111194.9, 0);
    expect(result[2]).toBeCloseTo(2 * 111194.9, 0);
  });

  it('returns an empty array for no coordinates', () => {
    expect(cumulativeDistances([])).toEqual([]);
  });
});

describe('resampleLine', () => {
  const line: LngLat[] = [
    [0, 0],
    [0, 1],
  ];

  it('produces exactly maxPoints samples', () => {
    expect(resampleLine(line, 10).coords).toHaveLength(10);
    expect(resampleLine(line, 100).coords).toHaveLength(100);
  });

  it('keeps the original endpoints', () => {
    const { coords } = resampleLine(line, 25);
    expect(coords[0]).toEqual([0, 0]);
    expect(coords[coords.length - 1]).toEqual([0, 1]);
  });

  it('returns monotonic distances starting at 0 and ending at the total length', () => {
    const { distances } = resampleLine(line, 50);
    expect(distances[0]).toBe(0);
    expect(distances[distances.length - 1]).toBeCloseTo(111194.9, 0);
    for (let i = 1; i < distances.length; i += 1) {
      expect(distances[i]).toBeGreaterThan(distances[i - 1]);
    }
  });

  it('places the midpoint sample at half distance for a straight line', () => {
    const { coords, distances } = resampleLine(line, 3);
    expect(coords[1][1]).toBeCloseTo(0.5, 6);
    expect(distances[1]).toBeCloseTo(111194.9 / 2, 0);
  });

  it('coerces maxPoints below 2 up to the endpoints', () => {
    expect(resampleLine(line, 1).coords).toHaveLength(2);
  });

  it('handles empty and single-point input', () => {
    expect(resampleLine([], 10)).toEqual({ coords: [], distances: [] });
    expect(resampleLine([[5, 6]], 10)).toEqual({
      coords: [[5, 6]],
      distances: [0],
    });
  });

  it('handles a degenerate line of identical vertices', () => {
    const result = resampleLine(
      [
        [3, 3],
        [3, 3],
      ],
      10,
    );
    expect(result.distances).toEqual([0, 0]);
  });

  it('samples across multiple segments', () => {
    const multi: LngLat[] = [
      [0, 0],
      [0, 1],
      [1, 1],
    ];
    const { coords } = resampleLine(multi, 5);
    expect(coords).toHaveLength(5);
    expect(coords[0]).toEqual([0, 0]);
    expect(coords[coords.length - 1]).toEqual([1, 1]);
  });
});

describe('computeStats', () => {
  it('computes min, max, gain, loss, and total distance', () => {
    const elevations = [10, 20, 15, 25];
    const distances = [0, 100, 200, 300];
    const stats = computeStats(elevations, distances);
    expect(stats.min).toBe(10);
    expect(stats.max).toBe(25);
    expect(stats.gain).toBe(20); // (20-10) + (25-15)
    expect(stats.loss).toBe(5); // (15-20)
    expect(stats.totalDistance).toBe(300);
  });

  it('treats a flat profile as zero gain and loss', () => {
    const stats = computeStats([5, 5, 5], [0, 10, 20]);
    expect(stats.gain).toBe(0);
    expect(stats.loss).toBe(0);
    expect(stats.min).toBe(5);
    expect(stats.max).toBe(5);
  });

  it('handles empty elevations', () => {
    expect(computeStats([], [])).toEqual({
      min: 0,
      max: 0,
      gain: 0,
      loss: 0,
      totalDistance: 0,
    });
  });
});
