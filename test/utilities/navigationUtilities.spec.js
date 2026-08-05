import { test, expect, vi } from 'vitest';
import { assembleProceduralRouteString, parseAltitudeRestriction, parseSpeedRestriction } from '../../src/assets/scripts/client/utilities/navigationUtilities';

test('assembleProceduralRouteString() concatenates provided strings with appropriate separator character', () => {
    const entryFixName = 'ENTRY';
    const procedureName = 'PRCDR';
    const exitFixName = 'EXITT';
    const expectedResult = 'ENTRY.PRCDR.EXITT';
    const result = assembleProceduralRouteString(entryFixName, procedureName, exitFixName);

    expect(result === expectedResult).toBe(true);
});

test('.parseAltitudeRestriction() returns empty array for invalid restrictions', () => {
    const empty = [];

    // Empty value
    expect(parseAltitudeRestriction()).toEqual(empty);
    expect(parseAltitudeRestriction(null)).toEqual(empty);
    expect(parseAltitudeRestriction('')).toEqual(empty);
    // No prefix
    expect(parseAltitudeRestriction('80')).toEqual(empty);
    expect(parseAltitudeRestriction('80+')).toEqual(empty);
    // Invalid limit symbol
    expect(parseAltitudeRestriction('A80@')).toEqual(empty);
    // More than 99,999 ft
    expect(parseAltitudeRestriction('A1000')).toEqual(empty);
    expect(parseAltitudeRestriction('A1000+')).toEqual(empty);
    expect(parseAltitudeRestriction('A1000-')).toEqual(empty);
});

test('.parseAltitudeRestriction() returns expected values', () => {
    const expectedOneDigit = [800, ''];
    const expectedAbove = [8000, '+'];
    const expectedBelow = [14000, '-'];
    const expectedExact = [16000, ''];

    expect(parseAltitudeRestriction('A8')).toEqual(expectedOneDigit);
    expect(parseAltitudeRestriction('A80+')).toEqual(expectedAbove);
    expect(parseAltitudeRestriction('A140-')).toEqual(expectedBelow);
    expect(parseAltitudeRestriction('A160')).toEqual(expectedExact);
});

test('.parseSpeedRestriction() returns empty array for invalid restrictions', () => {
    const empty = [];

    // Empty value
    expect(parseSpeedRestriction()).toEqual(empty);
    expect(parseSpeedRestriction(null)).toEqual(empty);
    expect(parseSpeedRestriction('')).toEqual(empty);
    // No prefix
    expect(parseSpeedRestriction('250')).toEqual(empty);
    expect(parseSpeedRestriction('250+')).toEqual(empty);
    // Speed is less than 100 kts
    expect(parseSpeedRestriction('S50')).toEqual(empty);
    expect(parseSpeedRestriction('S50+')).toEqual(empty);
    expect(parseSpeedRestriction('S50')).toEqual(empty);
    // Invalid limit symbol
    expect(parseSpeedRestriction('S250@')).toEqual(empty);
    // Speed more than 999 kts
    expect(parseSpeedRestriction('S1000')).toEqual(empty);
    expect(parseSpeedRestriction('S1000+')).toEqual(empty);
    expect(parseSpeedRestriction('S1000-')).toEqual(empty);
});

test('.parseSpeedRestriction() returns expected values', () => {
    const expectedAbove = [220, '+'];
    const expectedBelow = [185, '-'];
    const expectedExact = [230, ''];

    expect(parseSpeedRestriction('S220+')).toEqual(expectedAbove);
    expect(parseSpeedRestriction('S185-')).toEqual(expectedBelow);
    expect(parseSpeedRestriction('S230')).toEqual(expectedExact);
});
