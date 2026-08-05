import { test, expect, vi } from 'vitest';
import _isEqual from 'lodash/isEqual';

import StaticPositionModel from '../../src/assets/scripts/client/base/StaticPositionModel';
import {
    calculateDistanceToPointForX,
    calculateDistanceToPointForY,
    adjustForMagneticNorth,
    hasCardinalDirectionInCoordinate
} from '../../src/assets/scripts/client/base/positionModelHelpers';

// klas airport reference
const AIRPORT_POSITION_FIXTURE = new StaticPositionModel(['N36.080056', 'W115.15225', '2181ft'], null, 11);

test('.calculateDistanceToPointForX() returns the distance from a reference position to a longitude', () => {
    const longitudeMock = -114.60478305555554;
    const expectedResult = 49.19924315595844;
    const result = calculateDistanceToPointForX(AIRPORT_POSITION_FIXTURE, AIRPORT_POSITION_FIXTURE.latitude, longitudeMock);

    expect(result === expectedResult).toBe(true);
});

test('.calculateDistanceToPointForY() returns the distance from a reference position to a latitude', () => {
    const latitudeMock = 36.63366638888889;
    const expectedResult = 61.55866658216595;
    const result = calculateDistanceToPointForY(AIRPORT_POSITION_FIXTURE, latitudeMock, AIRPORT_POSITION_FIXTURE.longitude);

    expect(result === expectedResult).toBe(true);
});

test('.adjustForMagneticNorth() adjusts x and y for magnetic north variation', () => {
    const xMock = 49.19924315595844;
    const yMock = 61.55866658216595;
    const magneticNorthMock = 0.2076941809873252;
    const expectedResult = {
        x: 35.448246791634254,
        y: 70.38079821863909
    };
    const result = adjustForMagneticNorth(xMock, yMock, magneticNorthMock);

    expect(_isEqual(result, expectedResult)).toBe(true);
});

test('.hasCardinalDirectionInCoordinate() ', () => {
    expect(hasCardinalDirectionInCoordinate('N36d38m01.199')).toBe(true);
    expect(hasCardinalDirectionInCoordinate('W115.15225')).toBe(true);
    expect(hasCardinalDirectionInCoordinate('123456')).toBe(false);
});
