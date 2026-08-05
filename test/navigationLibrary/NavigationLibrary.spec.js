import { test, expect, vi } from 'vitest';
import NavigationLibrary from '../../src/assets/scripts/client/navigationLibrary/NavigationLibrary';
import { AIRPORT_JSON_KLAS_MOCK } from '../airport/_mocks/airportJsonMock';

test('throws when attempting to create an instance', () => {
    expect(() => new NavigationLibrary()).toThrow();
    expect(() => new NavigationLibrary(AIRPORT_JSON_KLAS_MOCK)).toThrow();
});

test('.getAllFixNamesInUse() returns list of all fix names used in all procedures and airways', () => {
    NavigationLibrary.init(AIRPORT_JSON_KLAS_MOCK);

    const fixNameList = NavigationLibrary._getAllFixNamesInUse();

    expect(fixNameList.length === 93).toBe(true);
});

test('._holdCollection() is populated correctly', () => {
    NavigationLibrary.reset();
    NavigationLibrary.init(AIRPORT_JSON_KLAS_MOCK);
    const bakkrHold = NavigationLibrary.findHoldParametersByFix('BAKRR');
    // "360|right|4nm|S230-"
    const expectedResult = {
        inboundHeading: Math.PI,
        turnDirection: 'right',
        legLength: '4nm',
        speedMaximum: 230,
    };

    expect(bakkrHold).toEqual(expectedResult);
});

test('.getFixSpokenName() returns input in lowercase if fix does not exist', () => {
    NavigationLibrary.reset();
    NavigationLibrary.init(AIRPORT_JSON_KLAS_MOCK);
    const result = NavigationLibrary.getFixSpokenName('ASDFG');

    expect(result).toEqual('asdfg');
});
