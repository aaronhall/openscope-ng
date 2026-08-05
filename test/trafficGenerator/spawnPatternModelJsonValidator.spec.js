import { test, expect, vi } from 'vitest';
import { spawnPatternModelJsonValidator } from '../../src/assets/scripts/client/trafficGenerator/spawnPatternModelJsonValidator';
import { ARRIVAL_PATTERN_MOCK, DEPARTURE_PATTERN_MOCK } from './_mocks/spawnPatternMocks';

const invalidSpawnPattern = {
    route: 'KLAS.BOACH6.HEC',
    altitude: null,
    method: 'random',
    rate: 5,
    speed: null,
    threeve: 42,
    42: 'threeve',
};

test('spawnPatternModelJsonValidator() retruns true when passed a valid arrival spawnPattern ', () => {
    expect(spawnPatternModelJsonValidator(ARRIVAL_PATTERN_MOCK)).toBe(true);
});

test('spawnPatternModelJsonValidator() returns true when passed a valid departure spawnPattern', () => {
    expect(spawnPatternModelJsonValidator(DEPARTURE_PATTERN_MOCK)).toBe(true);
});

test('spawnPatternModelJsonValidator() returns false when passed an invalid spawnPattern with unsupported keys', () => {
    expect(spawnPatternModelJsonValidator(invalidSpawnPattern)).toBe(false);
});
