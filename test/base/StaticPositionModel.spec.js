import { test, expect, vi } from 'vitest';
import _isEqual from 'lodash/isEqual';
import StaticPositionModel from '../../src/assets/scripts/client/base/StaticPositionModel';
import { airportPositionFixtureKLAS } from '../fixtures/airportFixtures';
import {
    DEFAULT_SCREEN_POSITION,
    RELATIVE_POSITION_OFFSET_INDEX,
} from '../../src/assets/scripts/client/constants/positionConstants';

const INVALID_COORDINATES_MOCK = ['NN36d38m01.199', -114.5];
const LAT_LONG_MOCK = ['N36d38m01.199', 'W114d36m17.219'];
const LAT_LONG_DECIMAL_MOCK = [36.63366638888889, -114.60478305555554];
const LAT_LONG_DECIMAL_MOCK_2 = [35.855666666666664, -114.91];
const MAGNETIC_NORTH_MOCK = 0.2076941809873252;
const expectedRelativePosition = [35.448246791634254, 70.38079821863909];

test('throws when called to instantiate without parameters', () => {
    expect(() => new StaticPositionModel()).toThrow();
});

test('sets internal properties when provided valid parameters', () => {
    const result = new StaticPositionModel(
        LAT_LONG_MOCK,
        airportPositionFixtureKLAS,
        MAGNETIC_NORTH_MOCK
    );

    expect(result.latitude === LAT_LONG_DECIMAL_MOCK[0]).toBe(true);
    expect(result.longitude === LAT_LONG_DECIMAL_MOCK[1]).toBe(true);
    expect(result.elevation === 0).toBe(true);
    expect(_isEqual(result.relativePosition, expectedRelativePosition)).toBe(true);
    expect(result.x === expectedRelativePosition[RELATIVE_POSITION_OFFSET_INDEX.LONGITUDINAL]).toBe(
        true
    );
    expect(result.y === expectedRelativePosition[RELATIVE_POSITION_OFFSET_INDEX.LATITUDINAL]).toBe(
        true
    );
    expect(_isEqual(result._referencePosition, airportPositionFixtureKLAS)).toBe(true);
    expect(result._magneticNorth === 0.2076941809873252).toBe(true);
    expect(_isEqual(result.gps, LAT_LONG_DECIMAL_MOCK)).toBe(true);
    expect(result.gpsXY[0] === LAT_LONG_DECIMAL_MOCK[1]).toBe(true);
    expect(result.gpsXY[1] === LAT_LONG_DECIMAL_MOCK[0]).toBe(true);
});

test('get relativePosition() returns [0, 0] if no reference position is provided', () => {
    const positionModel = new StaticPositionModel(LAT_LONG_MOCK, null, MAGNETIC_NORTH_MOCK);
    const result = positionModel.relativePosition;
    const expectedResult = DEFAULT_SCREEN_POSITION;

    expect(_isEqual(result, expectedResult)).toBe(true);
});

test('.setCoordinates() makes no changes if invalid coordinates are passed', () => {
    const position1 = new StaticPositionModel(
        LAT_LONG_MOCK,
        airportPositionFixtureKLAS,
        MAGNETIC_NORTH_MOCK
    );
    const originalCoordinates = position1.gps;

    position1.setCoordinates(INVALID_COORDINATES_MOCK);

    const endingCoordinates = position1.gps;

    expect(_isEqual(originalCoordinates, endingCoordinates)).toBe(true);
});

test('.setCoordinates() makes no changes if valid coordinates are passed', () => {
    const position1 = new StaticPositionModel(
        LAT_LONG_MOCK,
        airportPositionFixtureKLAS,
        MAGNETIC_NORTH_MOCK
    );
    const originalCoordinates = position1.gps;

    position1.setCoordinates(LAT_LONG_DECIMAL_MOCK_2);

    const endingCoordinates = position1.gps;

    expect(_isEqual(originalCoordinates, endingCoordinates)).toBe(true);
});
