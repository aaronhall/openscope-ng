import { test, expect, vi } from 'vitest';

import MapCollection from '../../src/assets/scripts/client/airport/MapCollection';
import StaticPositionModel from '../../src/assets/scripts/client/base/StaticPositionModel';
import {
    MAP_NAMES_MOCK,
    MAP_NAMES_MOCK_EMPTY,
    MAP_MOCK,
    MAP_MOCK_LEGACY,
    DEFAULT_MAPS_MOCK
} from './_mocks/mapCollectionMocks';

const currentPosition = ['N44.879722', 'W063.510278', '2181ft'];
const magneticNorth = -18;
const airportPositionFixtureKCYHZ = new StaticPositionModel(currentPosition, null, magneticNorth);

test('throws if called with missing parameters', () => {
    const expectedMessage = /Invalid parameter\(s\) passed to MapCollection constructor\. Expected mapJson, defaultMaps, airportPositionModel and magneticNorth to be defined, but received .*/;

    expect(() => new MapCollection(), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();

    expect(() => new MapCollection(MAP_MOCK), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => new MapCollection(DEFAULT_MAPS_MOCK), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => new MapCollection(airportPositionFixtureKCYHZ), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => new MapCollection(magneticNorth), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();

    expect(() => new MapCollection(DEFAULT_MAPS_MOCK, airportPositionFixtureKCYHZ, magneticNorth), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => new MapCollection(MAP_MOCK, airportPositionFixtureKCYHZ, magneticNorth), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => new MapCollection(MAP_MOCK, DEFAULT_MAPS_MOCK, magneticNorth), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => new MapCollection(MAP_MOCK, DEFAULT_MAPS_MOCK, airportPositionFixtureKCYHZ), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();

    expect(() => new MapCollection(null, DEFAULT_MAPS_MOCK, airportPositionFixtureKCYHZ, magneticNorth), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => new MapCollection(MAP_MOCK, null, airportPositionFixtureKCYHZ, magneticNorth), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => new MapCollection(MAP_MOCK, DEFAULT_MAPS_MOCK, null, magneticNorth), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => new MapCollection(MAP_MOCK, DEFAULT_MAPS_MOCK, airportPositionFixtureKCYHZ, null), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
});

test('throws if called with invalid mapJson', () => {
    const expectedMessage = /Invalid mapJson passed to MapCollection constructor\. Expected a non-empty array, but received .*/;

    expect(() => new MapCollection({}, DEFAULT_MAPS_MOCK, airportPositionFixtureKCYHZ, magneticNorth), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => new MapCollection([], DEFAULT_MAPS_MOCK, airportPositionFixtureKCYHZ, magneticNorth), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => new MapCollection(42, DEFAULT_MAPS_MOCK, airportPositionFixtureKCYHZ, magneticNorth), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => new MapCollection('threeve', DEFAULT_MAPS_MOCK, airportPositionFixtureKCYHZ, magneticNorth), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => new MapCollection(false, DEFAULT_MAPS_MOCK, airportPositionFixtureKCYHZ, magneticNorth), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
});

test('throws if called with invalid defaultMaps', () => {
    const expectedMessage = /Invalid defaultMaps passed to MapCollection constructor\. Expected a non-empty array, but received .*/;

    expect(() => new MapCollection(MAP_MOCK, {}, airportPositionFixtureKCYHZ, magneticNorth), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => new MapCollection(MAP_MOCK, [], airportPositionFixtureKCYHZ, magneticNorth), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => new MapCollection(MAP_MOCK, 42, airportPositionFixtureKCYHZ, magneticNorth), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => new MapCollection(MAP_MOCK, 'threeve', airportPositionFixtureKCYHZ, magneticNorth), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => new MapCollection(MAP_MOCK, false, airportPositionFixtureKCYHZ, magneticNorth), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
});

test('throws if called with invalid airportPositionModel', () => {
    const expectedMessage = /Invalid airportPositionModel passed to MapCollection constructor\. Expected instance of StaticPositionModel, but received .*/;

    expect(() => new MapCollection(MAP_MOCK, DEFAULT_MAPS_MOCK, {}, magneticNorth), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => new MapCollection(MAP_MOCK, DEFAULT_MAPS_MOCK, [], magneticNorth), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => new MapCollection(MAP_MOCK, DEFAULT_MAPS_MOCK, 42, magneticNorth), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => new MapCollection(MAP_MOCK, DEFAULT_MAPS_MOCK, 'threeve', magneticNorth), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => new MapCollection(MAP_MOCK, DEFAULT_MAPS_MOCK, false, magneticNorth), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
});

test('throws if called with a legacy map', () => {
    expect(() => new MapCollection(MAP_MOCK_LEGACY, DEFAULT_MAPS_MOCK, airportPositionFixtureKCYHZ, magneticNorth)).toThrow();
});

test('does not throw when instantiated with a 0 magneticNorth', () => {
    expect(() => new MapCollection(MAP_MOCK, DEFAULT_MAPS_MOCK, airportPositionFixtureKCYHZ, 0)).not.toThrow();
});

test('accepts a map array that is used to set the instance properties', () => {
    const model = new MapCollection(MAP_MOCK, DEFAULT_MAPS_MOCK, airportPositionFixtureKCYHZ, magneticNorth);

    expect(typeof model._id).not.toBe('undefined');
    expect(model.length).toBe(MAP_MOCK.length);
    expect(model.getMapNames().length).toBe(MAP_MOCK.length);
    expect(model.hasVisibleMaps).toBe(true);
    expect(model.getVisibleMapLines().length).toBe(MAP_MOCK[0].lines.length);

    const first = model.maps[0];

    expect(first.name).toBe(MAP_MOCK[0].name);
    expect(first.lines.length).toBe(MAP_MOCK[0].lines.length);
});

test('accepts a string array that is used to set the visible maps', () => {
    const model = new MapCollection(MAP_MOCK, DEFAULT_MAPS_MOCK, airportPositionFixtureKCYHZ, magneticNorth);

    expect(() => model.setVisibleMaps(MAP_NAMES_MOCK)).not.toThrow();
    expect(model.getVisibleMapNames().length).toBe(MAP_NAMES_MOCK.length);

    expect(() => model.setVisibleMaps(MAP_NAMES_MOCK_EMPTY)).not.toThrow();
    expect(model.getVisibleMapLines().length).toBe(MAP_NAMES_MOCK_EMPTY.length);
});
