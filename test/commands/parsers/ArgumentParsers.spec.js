/* eslint-disable arrow-parens, max-len, import/no-extraneous-dependencies */
import { test, expect, vi } from 'vitest';

import {
    altitudeParser,
    headingParser,
    findHoldCommandByType,
    holdParser,
    isLegLengthArg,
    timewarpParser,
    optionalAltitudeParser,
    crossingParser
} from '../../../src/assets/scripts/client/commands/parsers/argumentParsers';

test('.altitudeParser() converts a string flight level altitude to a number altitude in thousands', () => {
    const result = altitudeParser(['080']);

    expect(result[0] === 8000).toBe(true);
});

test('.altitudeParser() returns true if the second argument is not undefined', () => {
    const result = altitudeParser(['080', 'ex']);

    expect(result[1]).toBe(true);
});

test('.altitudeParser() returns an array of length two when passed a single argument', () => {
    const result = altitudeParser(['080']);

    expect(result.length === 2).toBe(true);
    expect(result[0] === 8000).toBe(true);
    expect(result[1]).toBe(false);
});

test('.optionalAltitudeParser() converts a string flight level altitude to a number altitude in thousands', () => {
    const result = optionalAltitudeParser(['080']);

    expect(result[0] === 8000).toBe(true);
});

test('.optionalAltitudeParser() returns true if there is no argument', () => {
    const result = optionalAltitudeParser([]);

    expect(result.length === 0).toBe(true);
});

test('.headingParser() throws if it does not receive 1 or 2 arguments', () => {
    expect(() => headingParser([])).toThrow();
    expect(() => headingParser(['l', '042', 'threeve'])).toThrow();
});

test('.headingParser() returns an array of length 3 when passed new heading as the second argument', () => {
    const result = headingParser(['042']);

    expect(result.length === 3).toBe(true);
    expect(!result[0]).toBe(true);
    expect(result[1] === 42).toBe(true);
    expect(result[2]).toBe(false);
});

test('.headingParser() returns an array of length 3 when passed direction and heading as arguments', () => {
    const result = headingParser(['left', '42']);

    expect(result.length === 3).toBe(true);
    expect(result[0] === 'left').toBe(true);
    expect(result[1] === 42).toBe(true);
    expect(result[2]).toBe(true);
});

test('.headingParser() translates l to left as the first value', () => {
    const result = headingParser(['l', '042']);

    expect(result[0] === 'left').toBe(true);
});

test('.headingParser() translates r to right as the first value', () => {
    const result = headingParser(['r', '042']);

    expect(result[0] === 'right').toBe(true);
});

// specfic use cases for headingParser
test('.headingParser() parses two digit heading as an incremental heading', () => {
    const result = headingParser(['r', '42']);

    expect(result[0] === 'right').toBe(true);
    expect(result[1] === 42).toBe(true);
    expect(result[2]).toBe(true);
});

test('.headingParser() parses three digit heading as a generic heading', () => {
    const result = headingParser(['r', '042']);

    expect(result[0] === 'right').toBe(true);
    expect(result[1] === 42).toBe(true);
    expect(result[2]).toBe(false);
});

test('.findHoldCommandByType() returns a turnDirection when passed a variation of left or right', () => {
    const argsMock = ['dumba', 'l', '3nm'];
    expect(findHoldCommandByType('turnDirection', argsMock)).toBe('left');
});

test('.findHoldCommandByType() returns a legLength when passed a valid legLength in min', () => {
    const argsMock = ['dumba', 'l', '3min'];
    expect(findHoldCommandByType('legLength', argsMock)).toBe('3min');
});

test('.findHoldCommandByType() returns a legLength when passed a valid legLength in nm', () => {
    const argsMock = ['dumba', 'l', '3nm'];
    expect(findHoldCommandByType('legLength', argsMock)).toBe('3nm');
});

test('.findHoldCommandByType() returns a fixName when passed a valid fixName', () => {
    const argsMock = ['dumba', 'l', '3nm'];
    expect(findHoldCommandByType('fixName', argsMock)).toBe('dumba');
});

test('.isLegLengthArg() returns false when passed an invalid integer leg length', () => {
    expect(isLegLengthArg('1')).toBe(false);
    expect(isLegLengthArg('0min')).toBe(false);
    expect(isLegLengthArg('0nm')).toBe(false);
    expect(isLegLengthArg('50min')).toBe(false);
    expect(isLegLengthArg('50nm')).toBe(false);
    expect(isLegLengthArg('1km')).toBe(false);
    expect(isLegLengthArg('-1nm')).toBe(false);
});

test('.isLegLengthArg() returns false when passed an invalid decimal leg length', () => {
    expect(isLegLengthArg('1.0')).toBe(false);
    expect(isLegLengthArg('0.0min')).toBe(false);
    expect(isLegLengthArg('0.0nm')).toBe(false);
    expect(isLegLengthArg('50.0min')).toBe(false);
    expect(isLegLengthArg('50.0nm')).toBe(false);
    expect(isLegLengthArg('1.0km')).toBe(false);
    expect(isLegLengthArg('-1.0nm')).toBe(false);
    expect(isLegLengthArg('1.05min')).toBe(false);
    expect(isLegLengthArg('1.05nm')).toBe(false);
});

test('.isLegLengthArg() returns true when passed a valid integer leg length', () => {
    expect(isLegLengthArg('1min')).toBe(true);
    expect(isLegLengthArg('2min')).toBe(true);
    expect(isLegLengthArg('10min')).toBe(true);
    expect(isLegLengthArg('49min')).toBe(true);
    expect(isLegLengthArg('1nm')).toBe(true);
    expect(isLegLengthArg('2nm')).toBe(true);
    expect(isLegLengthArg('10nm')).toBe(true);
    expect(isLegLengthArg('49nm')).toBe(true);
});

test('.isLegLengthArg() returns true when passed a valid decimal leg length', () => {
    expect(isLegLengthArg('0.1min')).toBe(true);
    expect(isLegLengthArg('1.0min')).toBe(true);
    expect(isLegLengthArg('2.0min')).toBe(true);
    expect(isLegLengthArg('10.0min')).toBe(true);
    expect(isLegLengthArg('49.9min')).toBe(true);
    expect(isLegLengthArg('0.1nm')).toBe(true);
    expect(isLegLengthArg('1.0nm')).toBe(true);
    expect(isLegLengthArg('2.0nm')).toBe(true);
    expect(isLegLengthArg('10.0nm')).toBe(true);
    expect(isLegLengthArg('49.9nm')).toBe(true);
});

test('.holdParser() returns an array of length 4 when passed a fixname as the only argument', () => {
    const expectedResult = [null, null, 'dumba', null];
    const result = holdParser(['dumba']);

    expect(result).toEqual(expectedResult);
});

test('.holdParser() returns an array of length 4 when passed a direction and fixname as arguments', () => {
    const expectedResult = ['left', null, 'dumba', null];
    let result = holdParser(['dumba', 'left']);
    expect(result).toEqual(expectedResult);

    result = holdParser(['left', 'dumba']);
    expect(result).toEqual(expectedResult);
});

test('.holdParser() returns an array of length 4 when passed a legLength and fixname as arguments', () => {
    const expectedResult = [null, '1min', 'dumba', null];
    let result = holdParser(['dumba', '1min']);
    expect(result).toEqual(expectedResult);

    result = holdParser(['1min', 'dumba']);
    expect(result).toEqual(expectedResult);
});

test('.holdParser() returns an array of length 4 when passed a direction, legLength and fixname as arguments', () => {
    const expectedResult = ['left', '1min', 'dumba', null];
    let result = holdParser(['dumba', 'left', '1min']);
    expect(result).toEqual(expectedResult);

    result = holdParser(['left', '1min', 'dumba']);
    expect(result).toEqual(expectedResult);

    result = holdParser(['1min', 'left', 'dumba']);
    expect(result).toEqual(expectedResult);

    result = holdParser(['left', 'dumba', '1min']);
    expect(result).toEqual(expectedResult);
});

test('.holdParser() returns an array of length 4 when passed a direction, legLength, fixname and radial as arguments', () => {
    const expectedResult = ['left', '1min', 'dumba', 7];
    let result = holdParser(['dumba', 'left', '1min', '007']);
    expect(result).toEqual(expectedResult);

    result = holdParser(['left', '1min', 'dumba', '007']);
    expect(result).toEqual(expectedResult);

    result = holdParser(['1min', 'left', 'dumba', '007']);
    expect(result).toEqual(expectedResult);

    result = holdParser(['left', 'dumba', '1min', '007']);
    expect(result).toEqual(expectedResult);

    result = holdParser(['left', 'dumba', '007', '1min']);
    expect(result).toEqual(expectedResult);
});

test('.timewarpParser() returns an array with 0 as a value when provided no args', () => {
    const result = timewarpParser([]);

    expect(result[0] === 1).toBe(true);
});

test('.timewarpParser() returns an array with 50 as a value when provided as an arg', () => {
    const result = timewarpParser([50]);

    expect(result[0] === 50).toBe(true);
});


test('.crossingParser() returns an array with the correct values when provided all args', () => {
    const result = crossingParser(['LEMDY', 'a50', 's210']);

    expect(result[0] === 'LEMDY').toBe(true);
    expect(result[1] === 5000).toBe(true);
    expect(result[2] === 210).toBe(true);
});

test('.crossingParser() returns an array with the correct values when provided altitude as an arg', () => {
    const result = crossingParser(['LEMDY', 'a50']);

    expect(result[0] === 'LEMDY').toBe(true);
    expect(result[1] === 5000).toBe(true);
});

test('.crossingParser() returns an array with the correct values when provided speed as an arg', () => {
    const result = crossingParser(['LEMDY', 's210']);

    expect(result[0] === 'LEMDY').toBe(true);
    expect(result[2] === 210).toBe(true);
});
