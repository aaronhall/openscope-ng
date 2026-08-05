import { test, expect, vi } from 'vitest';
import _isEqual from 'lodash/isEqual';

import AirlineCollection from '../../src/assets/scripts/client/airline/AirlineCollection';
import AirlineModel from '../../src/assets/scripts/client/airline/AirlineModel';
import { AIRLINE_DEFINITION_LIST_MOCK } from './_mocks/airlineMocks';

test('throws when called with invalid data', () => {
    const expectedMessage = /Invalid airlineList passed to AirlineCollection constructor\. Expected a non-empty array, but received .*/;
    expect(() => new AirlineCollection(), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => new AirlineCollection(null), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => new AirlineCollection({}), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => new AirlineCollection([]), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => new AirlineCollection(42), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => new AirlineCollection('threeve'), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => new AirlineCollection(false), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
});

test('does not throw when called with valid data', () => {
    expect(() => new AirlineCollection(AIRLINE_DEFINITION_LIST_MOCK)).not.toThrow();
});

test('flightNumbers returns a list of flightNumbers from all AirlineModels in the collection', () => {
    const expectedResult = ['123', '321', '234', '432'];
    const collection = new AirlineCollection(AIRLINE_DEFINITION_LIST_MOCK);
    collection._items[0].activeFlightNumbers = ['123', '321'];
    collection._items[1].activeFlightNumbers = ['234', '432'];

    expect(_isEqual(collection.flightNumbers, expectedResult)).toBe(true);
});

test('.findAirlineById() returns an AirlineModel when supplied an airlineId without fleet', () => {
    const collection = new AirlineCollection(AIRLINE_DEFINITION_LIST_MOCK);
    const result = collection.findAirlineById('aal');

    expect(result instanceof AirlineModel).toBe(true);
    expect(result.icao === 'aal').toBe(true);
});

test('.findAirlineById() returns an AirlineModel when supplied an airlineId in uppercase without fleet', () => {
    const collection = new AirlineCollection(AIRLINE_DEFINITION_LIST_MOCK);
    const result = collection.findAirlineById('AAL');

    expect(result instanceof AirlineModel).toBe(true);
    expect(result.icao === 'aal').toBe(true);
});

test('.findAirlineById() returns an AirlineModel when supplied an airlineId mixed case', () => {
    const collection = new AirlineCollection(AIRLINE_DEFINITION_LIST_MOCK);
    const result = collection.findAirlineById('uAl');

    expect(result instanceof AirlineModel).toBe(true);
    expect(result.icao === 'ual').toBe(true);
});

test('.findAirlineById() returns an AirlineModel when supplied an airlineId with fleet', () => {
    const collection = new AirlineCollection(AIRLINE_DEFINITION_LIST_MOCK);
    const result = collection.findAirlineById('ual/long');

    expect(result instanceof AirlineModel).toBe(true);
    expect(result.icao === 'ual').toBe(true);
});
