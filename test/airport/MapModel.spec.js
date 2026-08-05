import { test, expect, vi } from 'vitest';
import MapModel from '../../src/assets/scripts/client/airport/MapModel';
import StaticPositionModel from '../../src/assets/scripts/client/base/StaticPositionModel';
import {
    MAP_MOCK,
    MAP_MOCK_NO_LINES,
    MAP_MOCK_EMPTY_LINES,
    MAP_MOCK_NO_NAME,
} from './_mocks/mapModelMocks';

const currentPosition = ['N44.879722', 'W063.510278', '2181ft'];
const magneticNorth = -18;
const airportPositionFixtureKCYHZ = new StaticPositionModel(currentPosition, null, magneticNorth);

test('throws if called with missing parameters', () => {
    const expectedMessage =
        /Invalid parameter\(s\) passed to MapModel constructor\. Expected map, airportPosition and magneticNorth to be defined, but received .*/;

    expect(() => new MapModel(), {
        instanceOf: TypeError,
        message: expectedMessage,
    }).toThrow();

    expect(() => new MapModel(MAP_MOCK), {
        instanceOf: TypeError,
        message: expectedMessage,
    }).toThrow();
    expect(() => new MapModel(airportPositionFixtureKCYHZ), {
        instanceOf: TypeError,
        message: expectedMessage,
    }).toThrow();
    expect(() => new MapModel(magneticNorth), {
        instanceOf: TypeError,
        message: expectedMessage,
    }).toThrow();

    expect(() => new MapModel(airportPositionFixtureKCYHZ, magneticNorth), {
        instanceOf: TypeError,
        message: expectedMessage,
    }).toThrow();
    expect(() => new MapModel(MAP_MOCK, magneticNorth), {
        instanceOf: TypeError,
        message: expectedMessage,
    }).toThrow();
    expect(() => new MapModel(MAP_MOCK, airportPositionFixtureKCYHZ), {
        instanceOf: TypeError,
        message: expectedMessage,
    }).toThrow();

    expect(() => new MapModel(null, airportPositionFixtureKCYHZ, magneticNorth), {
        instanceOf: TypeError,
        message: expectedMessage,
    }).toThrow();
    expect(() => new MapModel(MAP_MOCK, null, magneticNorth), {
        instanceOf: TypeError,
        message: expectedMessage,
    }).toThrow();
    expect(() => new MapModel(MAP_MOCK, airportPositionFixtureKCYHZ, null), {
        instanceOf: TypeError,
        message: expectedMessage,
    }).toThrow();
});

test('throws if called with invalid map', () => {
    const expectedMessage =
        /Invalid map passed to MapModel constructor\. Expected a non-empty object, but received .*/;

    expect(() => new MapModel({}, airportPositionFixtureKCYHZ, magneticNorth), {
        instanceOf: TypeError,
        message: expectedMessage,
    }).toThrow();
    expect(() => new MapModel([], airportPositionFixtureKCYHZ, magneticNorth), {
        instanceOf: TypeError,
        message: expectedMessage,
    }).toThrow();
    expect(() => new MapModel(42, airportPositionFixtureKCYHZ, magneticNorth), {
        instanceOf: TypeError,
        message: expectedMessage,
    }).toThrow();
    expect(() => new MapModel('threeve', airportPositionFixtureKCYHZ, magneticNorth), {
        instanceOf: TypeError,
        message: expectedMessage,
    }).toThrow();
    expect(() => new MapModel(false, airportPositionFixtureKCYHZ, magneticNorth), {
        instanceOf: TypeError,
        message: expectedMessage,
    }).toThrow();
});

test('throws if called with a map with no name', () => {
    const expectedMessage =
        /Invalid map passed to MapModel constructor\. Expected map.name to be a string, but received .*/;

    expect(() => new MapModel(MAP_MOCK_NO_NAME, airportPositionFixtureKCYHZ, magneticNorth), {
        instanceOf: TypeError,
        message: expectedMessage,
    }).toThrow();
});

test('throws if called with a map with invalid lines', () => {
    const expectedMessage =
        /Invalid map passed to MapModel constructor\. Expected map.lines to be a non-empty array, but received .*/;

    expect(() => new MapModel(MAP_MOCK_NO_LINES, airportPositionFixtureKCYHZ, magneticNorth), {
        instanceOf: TypeError,
        message: expectedMessage,
    }).toThrow();
    expect(() => new MapModel(MAP_MOCK_EMPTY_LINES, airportPositionFixtureKCYHZ, magneticNorth), {
        instanceOf: TypeError,
        message: expectedMessage,
    }).toThrow();
});

test('throws if called with invalid airportPosition', () => {
    const expectedMessage =
        /Invalid airportPosition passed to MapModel constructor\. Expected instance of StaticPositionModel, but received .*/;

    expect(() => new MapModel(MAP_MOCK, {}, magneticNorth), {
        instanceOf: TypeError,
        message: expectedMessage,
    }).toThrow();
    expect(() => new MapModel(MAP_MOCK, [], magneticNorth), {
        instanceOf: TypeError,
        message: expectedMessage,
    }).toThrow();
    expect(() => new MapModel(MAP_MOCK, 42, magneticNorth), {
        instanceOf: TypeError,
        message: expectedMessage,
    }).toThrow();
    expect(() => new MapModel(MAP_MOCK, 'threeve', magneticNorth), {
        instanceOf: TypeError,
        message: expectedMessage,
    }).toThrow();
    expect(() => new MapModel(MAP_MOCK, false, magneticNorth), {
        instanceOf: TypeError,
        message: expectedMessage,
    }).toThrow();
});

test('does not throw when called with valid data', () => {
    expect(() => new MapModel(MAP_MOCK, airportPositionFixtureKCYHZ, magneticNorth)).not.toThrow();
});

test('accepts a map object that is used to set the instance properties', () => {
    const model = new MapModel(MAP_MOCK, airportPositionFixtureKCYHZ, magneticNorth);

    expect(typeof model._id).not.toBe('undefined');
    expect(model.name).toBe(MAP_MOCK.name);
    expect(model.lines.length).toBe(MAP_MOCK.lines.length);
});
