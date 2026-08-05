import { test, expect, vi } from 'vitest';
import _isEqual from 'lodash/isEqual';

import DynamicPositionModel from '../../src/assets/scripts/client/base/DynamicPositionModel';
import { airportPositionFixtureKLAS } from '../fixtures/airportFixtures';
import { DEFAULT_SCREEN_POSITION } from '../../src/assets/scripts/client/constants/positionConstants';

const BEARING_RADIANS_MOCK = 0.610865;
const DISTANCE_NM_MOCK = 50;
const INVALID_COORDINATES_MOCK = ['NN36d38m01.199', -114.5];
const LAT_LONG_MOCK = ['N36d38m01.199', 'W114d36m17.219'];
const LAT_LONG_DECIMAL_MOCK = [36.63366638888889, -114.60478305555554];
const LAT_LONG_MOCK_2 = ['N35d51.34m0', 'W114d54.60m0'];
const LAT_LONG_DECIMAL_MOCK_2 = [35.855666666666664, -114.91];
const MAGNETIC_NORTH_MOCK = 0.2076941809873252;
const RELATIVE_POSITION_MOCK = [3, 4]; // distance 5km along a 045 magnetic bearing
const expectedrelativePosition = [35.448246791634254, 70.38079821863909];

test('throws when called to instantiate without parameters', () => {
    expect(() => new DynamicPositionModel()).toThrow();
});

test('sets internal properties when provided valid parameters', () => {
    const result = new DynamicPositionModel(
        LAT_LONG_MOCK,
        airportPositionFixtureKLAS,
        MAGNETIC_NORTH_MOCK
    );

    expect(result.latitude === LAT_LONG_DECIMAL_MOCK[0]).toBe(true);
    expect(result.longitude === LAT_LONG_DECIMAL_MOCK[1]).toBe(true);
    expect(result.elevation === 0).toBe(true);
    expect(_isEqual(result.relativePosition, expectedrelativePosition)).toBe(true);
    expect(_isEqual(result._referencePosition, airportPositionFixtureKLAS)).toBe(true);
    expect(result._magneticNorth === 0.2076941809873252).toBe(true);
    expect(_isEqual(result.gps, LAT_LONG_DECIMAL_MOCK)).toBe(true);
    expect(result.gpsXY[0] === LAT_LONG_DECIMAL_MOCK[1]).toBe(true);
    expect(result.gpsXY[1] === LAT_LONG_DECIMAL_MOCK[0]).toBe(true);
});

test('get relativePosition() returns [0, 0] if no reference position is provided', () => {
    const result = new DynamicPositionModel(LAT_LONG_MOCK, null, MAGNETIC_NORTH_MOCK);
    const expectedResult = DEFAULT_SCREEN_POSITION;

    expect(_isEqual(result.relativePosition, expectedResult)).toBe(true);
});

test('get magneticNorth() returns the value of #_magneticNorth', () => {
    const positionModel = new DynamicPositionModel(LAT_LONG_MOCK, null, MAGNETIC_NORTH_MOCK);
    const result = positionModel.magneticNorth;
    const expectedResult = MAGNETIC_NORTH_MOCK;

    expect(_isEqual(result, expectedResult)).toBe(true);
});

test('.bearingFromPosition() returns the correct bearing between two DynamicPositionModel instances', () => {
    const position1 = new DynamicPositionModel(
        LAT_LONG_MOCK,
        airportPositionFixtureKLAS,
        MAGNETIC_NORTH_MOCK
    );
    const position2 = new DynamicPositionModel(
        LAT_LONG_MOCK_2,
        airportPositionFixtureKLAS,
        MAGNETIC_NORTH_MOCK
    );
    const expectedResult = 0.09716579176803017;
    const result = position1.bearingFromPosition(position2);

    expect(result === expectedResult).toBe(true);
});

test('.bearingToPosition() returns the correct bearing between two DynamicPositionModel instances', () => {
    const position1 = new DynamicPositionModel(
        LAT_LONG_MOCK,
        airportPositionFixtureKLAS,
        MAGNETIC_NORTH_MOCK
    );
    const position2 = new DynamicPositionModel(
        LAT_LONG_MOCK_2,
        airportPositionFixtureKLAS,
        MAGNETIC_NORTH_MOCK
    );
    const expectedResult = 3.2419080533939235;
    const result = position1.bearingToPosition(position2);

    expect(result === expectedResult).toBe(true);
});

test('.calculateRelativePosition() static method throws when coordinates are undefined', () => {
    const referencePosition = new DynamicPositionModel(LAT_LONG_MOCK, null, MAGNETIC_NORTH_MOCK);

    expect(() =>
        DynamicPositionModel.calculateRelativePosition(
            undefined,
            referencePosition,
            MAGNETIC_NORTH_MOCK
        )
    ).toThrow();
});

test('.calculateRelativePosition() static method throws when referencePosition is undefined', () => {
    expect(() =>
        DynamicPositionModel.calculateRelativePosition(
            LAT_LONG_MOCK,
            undefined,
            MAGNETIC_NORTH_MOCK
        )
    ).toThrow();
});

test('.calculateRelativePosition() static method throws when magnetic north is undefined', () => {
    const referencePosition = new DynamicPositionModel(LAT_LONG_MOCK, null, MAGNETIC_NORTH_MOCK);

    expect(() =>
        DynamicPositionModel.calculateRelativePosition(LAT_LONG_MOCK, referencePosition)
    ).toThrow();
});

test('.calculateRelativePosition() static method returns correctly translated value', () => {
    const referencePosition = new DynamicPositionModel(LAT_LONG_MOCK, null, MAGNETIC_NORTH_MOCK);
    const expectedResult = [-8.81063082871495, -90.26632595066663];
    const result = DynamicPositionModel.calculateRelativePosition(
        LAT_LONG_MOCK_2,
        referencePosition,
        MAGNETIC_NORTH_MOCK
    );

    expect(result).toEqual(expectedResult);
});

// user bug test case
test('.calculateRelativePosition() static method does not throw when it receives 0 for magnetic_north', () => {
    expect(
        () => new DynamicPositionModel(LAT_LONG_MOCK, airportPositionFixtureKLAS, 0)
    ).not.toThrow();
    expect(() =>
        DynamicPositionModel.calculateRelativePosition(LAT_LONG_MOCK, airportPositionFixtureKLAS, 0)
    ).not.toThrow();
});

test('.calculateGpsCoordinatesFromRelativePosition() static method throws when offset values are undefined', () => {
    const referencePosition = new DynamicPositionModel(LAT_LONG_MOCK, null, MAGNETIC_NORTH_MOCK);

    expect(() =>
        DynamicPositionModel.calculateGpsCoordinatesFromRelativePosition(
            undefined,
            referencePosition
        )
    ).toThrow();
});

test('.calculateGpsCoordinatesFromRelativePosition() static method throws when referencePosition is undefined', () => {
    expect(() =>
        DynamicPositionModel.calculateGpsCoordinatesFromRelativePosition(LAT_LONG_MOCK)
    ).toThrow();
});

test('.calculateGpsCoordinatesFromRelativePosition() static method returns correctly translated value', () => {
    const referencePosition = new DynamicPositionModel(
        LAT_LONG_DECIMAL_MOCK,
        null,
        MAGNETIC_NORTH_MOCK
    );
    const expectedResult = [36.66329597581823, -114.5626240216674];
    const result = DynamicPositionModel.calculateGpsCoordinatesFromRelativePosition(
        RELATIVE_POSITION_MOCK,
        referencePosition
    );

    expect(result).toEqual(expectedResult);
});

test('.distanceToPosition() returns the correct distance between two DynamicPositionModel instances', () => {
    const position1 = new DynamicPositionModel(
        LAT_LONG_MOCK,
        airportPositionFixtureKLAS,
        MAGNETIC_NORTH_MOCK
    );
    const position2 = new DynamicPositionModel(
        LAT_LONG_MOCK_2,
        airportPositionFixtureKLAS,
        MAGNETIC_NORTH_MOCK
    );
    const expectedResult = 48.99277192716842;
    const result = position1.distanceToPosition(position2);

    expect(result === expectedResult).toBe(true);
});

test('.generateDynamicPositionFromBearingAndDistance() returns an accurate new DynamicPositionModel instance', () => {
    const position1 = new DynamicPositionModel(
        LAT_LONG_MOCK,
        airportPositionFixtureKLAS,
        MAGNETIC_NORTH_MOCK
    );
    const position2 = position1.generateDynamicPositionFromBearingAndDistance(
        BEARING_RADIANS_MOCK,
        DISTANCE_NM_MOCK
    );
    const result = position2.gps;
    const expectedResult = [37.200260478622035, -113.84138604883545];

    expect(position2 instanceof DynamicPositionModel).toBe(true);
    expect(_isEqual(result, expectedResult)).toBe(true);
});

test('.setCoordinates() returns early with error and makes no changes if invalid coordinates are passed', () => {
    const position1 = new DynamicPositionModel(
        LAT_LONG_MOCK,
        airportPositionFixtureKLAS,
        MAGNETIC_NORTH_MOCK
    );
    const originalCoordinates = position1.gps;
    const retval = position1.setCoordinates(INVALID_COORDINATES_MOCK);
    const endingCoordinates = position1.gps;

    expect(retval instanceof TypeError).toBe(true);
    expect(_isEqual(originalCoordinates, endingCoordinates)).toBe(true);
});

test('.setCoordinates() sets the latitude and longitude when provided valid data', () => {
    const position1 = new DynamicPositionModel(
        LAT_LONG_MOCK,
        airportPositionFixtureKLAS,
        MAGNETIC_NORTH_MOCK
    );

    position1.setCoordinates(LAT_LONG_DECIMAL_MOCK_2);

    const result = position1.gps;
    const expectedResult = LAT_LONG_DECIMAL_MOCK_2;

    expect(_isEqual(result, expectedResult)).toBe(true);
});
