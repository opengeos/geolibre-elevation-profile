import { describe, it, expect } from 'vitest';
import { profileToCsv } from '../src/lib/export/csv';
import type { ProfilePoint } from '../src/lib/chart/profileChart';
import type { LngLat } from '../src/lib/elevation/geometry';

const points: ProfilePoint[] = [
  { distance: 0, elevation: 100.4 },
  { distance: 123.456, elevation: 150.95 },
];
const coords: LngLat[] = [
  [13.4123456, 52.52],
  [13.42, 52.53],
];

describe('profileToCsv', () => {
  it('emits a header and one row per sample', () => {
    const csv = profileToCsv(points, coords);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('index,longitude,latitude,distance_m,elevation_m');
    expect(lines).toHaveLength(3);
  });

  it('rounds distance, elevation, and coordinates to two decimals', () => {
    const csv = profileToCsv(points, coords);
    const lines = csv.split('\n');
    expect(lines[1]).toBe('0,13.41,52.52,0,100.4');
    expect(lines[2]).toBe('1,13.42,52.53,123.46,150.95');
  });

  it('leaves coordinate columns blank when a sample has no coordinate', () => {
    const csv = profileToCsv(points, []);
    const lines = csv.split('\n');
    expect(lines[1]).toBe('0,,,0,100.4');
  });
});
