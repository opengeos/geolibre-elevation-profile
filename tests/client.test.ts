import { describe, it, expect, vi } from 'vitest';
import {
  fetchElevations,
  ElevationFetchError,
  MAX_POINTS_PER_REQUEST,
  type FetchLike,
} from '../src/lib/elevation/client';
import type { LngLat } from '../src/lib/elevation/geometry';

const okResponse = (body: unknown): Response =>
  ({
    ok: true,
    status: 200,
    json: async () => body,
  }) as Response;

const points: LngLat[] = [
  [13.41, 52.52],
  [8.23, 46.85],
];

describe('fetchElevations', () => {
  it('returns the elevation array on success', async () => {
    const fetchImpl: FetchLike = vi.fn(async () =>
      okResponse({ elevation: [38, 761] }),
    );
    const result = await fetchElevations(points, fetchImpl);
    expect(result).toEqual([38, 761]);
  });

  it('builds a latitude/longitude query string from the points', async () => {
    const fetchImpl = vi.fn(async () => okResponse({ elevation: [38, 761] }));
    await fetchElevations(points, fetchImpl);
    const calledUrl = fetchImpl.mock.calls[0][0] as string;
    expect(calledUrl).toContain('latitude=52.520000,46.850000');
    expect(calledUrl).toContain('longitude=13.410000,8.230000');
  });

  it('returns an empty array without calling fetch for no points', async () => {
    const fetchImpl = vi.fn();
    expect(await fetchElevations([], fetchImpl)).toEqual([]);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('throws when given more than the per-request maximum', async () => {
    const many: LngLat[] = Array.from(
      { length: MAX_POINTS_PER_REQUEST + 1 },
      () => [0, 0] as LngLat,
    );
    await expect(fetchElevations(many, vi.fn())).rejects.toBeInstanceOf(
      ElevationFetchError,
    );
  });

  it('throws on a non-2xx response', async () => {
    const fetchImpl: FetchLike = vi.fn(
      async () => ({ ok: false, status: 400, json: async () => ({}) }) as Response,
    );
    await expect(fetchElevations(points, fetchImpl)).rejects.toThrow(
      /HTTP 400/,
    );
  });

  it('throws on a length mismatch', async () => {
    const fetchImpl: FetchLike = vi.fn(async () =>
      okResponse({ elevation: [38] }),
    );
    await expect(fetchElevations(points, fetchImpl)).rejects.toThrow(
      /Expected 2 elevations/,
    );
  });

  it('throws on a malformed body', async () => {
    const fetchImpl: FetchLike = vi.fn(async () =>
      okResponse({ nope: true }),
    );
    await expect(fetchElevations(points, fetchImpl)).rejects.toThrow(
      /Malformed/,
    );
  });

  it('wraps network errors', async () => {
    const fetchImpl: FetchLike = vi.fn(async () => {
      throw new Error('offline');
    });
    await expect(fetchElevations(points, fetchImpl)).rejects.toThrow(
      /Could not reach the elevation service: offline/,
    );
  });
});
