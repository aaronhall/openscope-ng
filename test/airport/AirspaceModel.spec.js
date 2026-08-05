import { test, expect, vi } from 'vitest';

import AirspaceModel from '../../src/assets/scripts/client/airport/AirspaceModel';
import DynamicPositionModel from '../../src/assets/scripts/client/base/DynamicPositionModel';
import StaticPositionModel from '../../src/assets/scripts/client/base/StaticPositionModel';
import { AIRSPACE_MOCK, AIRSPACE_MOCK_WITH_CLOSING_ENTRY } from './_mocks/airspaceModelMocks';

const currentPosition = ['N36.080056', 'W115.15225', '2181ft'];
const magneticNorth = 11.9;
const airportPositionFixtureKSFO = new StaticPositionModel(currentPosition, null, magneticNorth);

test('throws if called with invalid parameters', () => {
    expect(() => new AirspaceModel()).toThrow();
    expect(() => new AirspaceModel(AIRSPACE_MOCK)).toThrow();
    expect(() => new AirspaceModel(null, airportPositionFixtureKSFO, magneticNorth)).toThrow();
    expect(() => new AirspaceModel(AIRSPACE_MOCK, null, magneticNorth)).toThrow();
    expect(() => new AirspaceModel(AIRSPACE_MOCK, airportPositionFixtureKSFO)).toThrow();
    expect(() => new AirspaceModel(AIRSPACE_MOCK, airportPositionFixtureKSFO)).toThrow();
});

test('does not throw when instantiated with a 0 magneticNorth', () => {
    expect(() => new AirspaceModel(AIRSPACE_MOCK, airportPositionFixtureKSFO, 0)).not.toThrow();
});

test('accepts an airspace object that is used to set the instance properties', () => {
    const model = new AirspaceModel(AIRSPACE_MOCK, airportPositionFixtureKSFO, magneticNorth);

    expect(typeof model._id === 'undefined').toBe(false);
    expect(model.floor === AIRSPACE_MOCK.floor * 100).toBe(true);
    expect(model.ceiling === AIRSPACE_MOCK.ceiling * 100).toBe(true);
    expect(model.airspace_class === AIRSPACE_MOCK.airspace_class).toBe(true);
    expect(model.poly.length === AIRSPACE_MOCK.poly.length).toBe(true);
});

test('removes last element in poly array if it is the same as the first element', () => {
    const model = new AirspaceModel(
        AIRSPACE_MOCK_WITH_CLOSING_ENTRY,
        airportPositionFixtureKSFO,
        magneticNorth
    );

    expect(model.poly.length === AIRSPACE_MOCK_WITH_CLOSING_ENTRY.poly.length).toBe(false);
    expect(model.poly.length === AIRSPACE_MOCK_WITH_CLOSING_ENTRY.poly.length - 1).toBe(true);
});

test('.isPointInside() returns true if the specified point is inside the lateral and vertical boundaries', () => {
    const model = new AirspaceModel(
        AIRSPACE_MOCK_WITH_CLOSING_ENTRY,
        airportPositionFixtureKSFO,
        magneticNorth
    );
    const airportPosition = airportPositionFixtureKSFO;
    const airportMagNorth = airportPositionFixtureKSFO.magneticNorth;
    const coordinatesMock = [36, -114.5];
    const positionMock = DynamicPositionModel.calculateRelativePosition(
        coordinatesMock,
        airportPosition,
        airportMagNorth
    );
    const altitudeMock = 19000;
    const result = model.isPointInside(positionMock, altitudeMock);

    expect(result).toBe(true);
});

test('.isPointInside() returns false if the specified point is within the lateral boundaries but not within the vertical boundaries', () => {
    const model = new AirspaceModel(
        AIRSPACE_MOCK_WITH_CLOSING_ENTRY,
        airportPositionFixtureKSFO,
        magneticNorth
    );
    const airportPosition = airportPositionFixtureKSFO;
    const airportMagNorth = airportPositionFixtureKSFO.magneticNorth;
    const coordinatesMock = [36, -114.5];
    const positionMock = DynamicPositionModel.calculateRelativePosition(
        coordinatesMock,
        airportPosition,
        airportMagNorth
    );
    const altitudeMock = 19001;
    const result = model.isPointInside(positionMock, altitudeMock);

    expect(result).toBe(false);
});

test('.isPointInside() returns false if the specified point is within vertical boundaries but not within the lateral boundaries', () => {
    const model = new AirspaceModel(
        AIRSPACE_MOCK_WITH_CLOSING_ENTRY,
        airportPositionFixtureKSFO,
        magneticNorth
    );
    const airportPosition = airportPositionFixtureKSFO;
    const airportMagNorth = airportPositionFixtureKSFO.magneticNorth;
    const coordinatesMock = [36, -114];
    const positionMock = DynamicPositionModel.calculateRelativePosition(
        coordinatesMock,
        airportPosition,
        airportMagNorth
    );
    const altitudeMock = 19000;
    const result = model.isPointInside(positionMock, altitudeMock);

    expect(result).toBe(false);
});
