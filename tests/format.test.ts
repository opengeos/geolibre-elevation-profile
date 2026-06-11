import { describe, it, expect } from 'vitest';
import {
  formatElevation,
  formatDistance,
  unitSystemLabel,
  UNIT_SYSTEMS,
} from '../src/lib/elevation/format';

describe('formatElevation', () => {
  it('rounds meters in metric', () => {
    expect(formatElevation(742.4, 'metric')).toBe('742 m');
    expect(formatElevation(-3.2, 'metric')).toBe('-3 m');
  });

  it('converts to feet in imperial', () => {
    expect(formatElevation(100, 'imperial')).toBe('328 ft');
    expect(formatElevation(0, 'imperial')).toBe('0 ft');
  });
});

describe('formatDistance', () => {
  it('uses meters below 1 km in metric', () => {
    expect(formatDistance(850, 'metric')).toBe('850 m');
  });

  it('uses kilometers at or above 1 km in metric', () => {
    expect(formatDistance(1500, 'metric')).toBe('1.50 km');
    expect(formatDistance(12345, 'metric')).toBe('12.35 km');
  });

  it('uses miles for longer imperial distances', () => {
    expect(formatDistance(1609.34, 'imperial')).toBe('1.00 mi');
  });

  it('uses feet for short imperial distances', () => {
    expect(formatDistance(30, 'imperial')).toBe('98 ft');
  });
});

describe('unit metadata', () => {
  it('exposes both systems in order', () => {
    expect(UNIT_SYSTEMS).toEqual(['metric', 'imperial']);
  });

  it('labels each system', () => {
    expect(unitSystemLabel('metric')).toBe('m / km');
    expect(unitSystemLabel('imperial')).toBe('ft / mi');
  });
});
