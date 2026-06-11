import { describe, it, expect, vi } from 'vitest';
import {
  ELEVATION_LINE_PARAM,
  getElevationLineValue,
  encodeLine,
  parseLine,
  maybeHandleDeepLink,
} from '../src/lib/utils/deep-link';
import type { LngLat } from '../src/lib/elevation/geometry';

const params = (search: string) => new URLSearchParams(search);

describe('getElevationLineValue', () => {
  it('returns the value when the parameter is present', () => {
    expect(
      getElevationLineValue(params('?elevation-line=13.41,52.52;8.23,46.85')),
    ).toBe('13.41,52.52;8.23,46.85');
  });

  it('returns null when the parameter is absent or blank', () => {
    expect(getElevationLineValue(params('?foo=bar'))).toBeNull();
    expect(getElevationLineValue(params('?elevation-line='))).toBeNull();
    expect(getElevationLineValue(params('?elevation-line=%20%20'))).toBeNull();
  });

  it('exposes the parameter name', () => {
    expect(ELEVATION_LINE_PARAM).toBe('elevation-line');
  });
});

describe('encodeLine / parseLine round-trip', () => {
  const line: LngLat[] = [
    [13.41, 52.52],
    [8.23, 46.85],
  ];

  it('encodes a polyline to a compact string', () => {
    expect(encodeLine(line)).toBe('13.41,52.52;8.23,46.85');
  });

  it('parses an encoded string back into coordinates', () => {
    expect(parseLine('13.41,52.52;8.23,46.85')).toEqual(line);
  });

  it('rounds coordinates to six decimal places when encoding', () => {
    expect(encodeLine([[1.123456789, 2.0]])).toBe('1.123457,2');
  });

  it('skips malformed or out-of-range pairs', () => {
    expect(parseLine('999,0;abc,def;10,20;30,40')).toEqual([
      [10, 20],
      [30, 40],
    ]);
  });

  it('returns null when fewer than two valid vertices remain', () => {
    expect(parseLine('10,20')).toBeNull();
    expect(parseLine('garbage')).toBeNull();
    expect(parseLine('')).toBeNull();
  });
});

describe('maybeHandleDeepLink', () => {
  it('forwards parsed coordinates when the parameter is a valid line', async () => {
    const consumer = { loadLine: vi.fn() };
    await maybeHandleDeepLink(
      consumer,
      params('?elevation-line=13.41,52.52;8.23,46.85'),
    );
    expect(consumer.loadLine).toHaveBeenCalledOnce();
    expect(consumer.loadLine).toHaveBeenCalledWith([
      [13.41, 52.52],
      [8.23, 46.85],
    ]);
  });

  it('does nothing when the parameter is absent, blank, or invalid', async () => {
    const consumer = { loadLine: vi.fn() };
    await maybeHandleDeepLink(consumer, params('?other=1'));
    await maybeHandleDeepLink(consumer, params('?elevation-line='));
    await maybeHandleDeepLink(consumer, params('?elevation-line=10,20'));
    expect(consumer.loadLine).not.toHaveBeenCalled();
  });
});
