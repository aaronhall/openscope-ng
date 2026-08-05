/* eslint-disable arrow-parens, max-len, import/no-extraneous-dependencies*/
import { test, expect, vi } from 'vitest';
import _forEach from 'lodash/forEach';

import AircraftTypeDefinitionCollection from '../../src/assets/scripts/client/aircraft/AircraftTypeDefinitionCollection';
import AircraftTypeDefinitionModel from '../../src/assets/scripts/client/aircraft/AircraftTypeDefinitionModel';
import { AIRCRAFT_DEFINITION_LIST_MOCK } from './_mocks/aircraftMocks';

test('should throw when passed invalid parameters', () => {
    const expectedMessage =
        /Invalid aircraftTypeDefinitionList passed to AircraftTypeDefinitionCollection constructor\. Expected a non-empty array, but received .*/;

    expect(() => new AircraftTypeDefinitionCollection(), {
        instanceOf: TypeError,
        message: expectedMessage,
    }).toThrow();
    expect(() => new AircraftTypeDefinitionCollection(null), {
        instanceOf: TypeError,
        message: expectedMessage,
    }).toThrow();
    expect(() => new AircraftTypeDefinitionCollection({}), {
        instanceOf: TypeError,
        message: expectedMessage,
    }).toThrow();
    expect(() => new AircraftTypeDefinitionCollection([]), {
        instanceOf: TypeError,
        message: expectedMessage,
    }).toThrow();
    expect(() => new AircraftTypeDefinitionCollection(42), {
        instanceOf: TypeError,
        message: expectedMessage,
    }).toThrow();
    expect(() => new AircraftTypeDefinitionCollection('threeve'), {
        instanceOf: TypeError,
        message: expectedMessage,
    }).toThrow();
    expect(() => new AircraftTypeDefinitionCollection(false), {
        instanceOf: TypeError,
        message: expectedMessage,
    }).toThrow();
});

test('does not throw when passed valid parameters', () => {
    expect(() => new AircraftTypeDefinitionCollection(AIRCRAFT_DEFINITION_LIST_MOCK)).not.toThrow();
});

test('.findAircraftTypeDefinitionModelByIcao() returns an AircraftTypeDefinitionModel when provided a valid aircraft icao', () => {
    const expectedResult = 'B737';
    const collection = new AircraftTypeDefinitionCollection(AIRCRAFT_DEFINITION_LIST_MOCK);
    const result = collection.findAircraftTypeDefinitionModelByIcao('B737');

    expect(result instanceof AircraftTypeDefinitionModel).toBe(true);
    expect(result.icao === expectedResult).toBe(true);
});

test('._buildAircraftTypeDefinitionModelList() returns a list of AircraftTypeDefinitionModel objects', () => {
    const collection = new AircraftTypeDefinitionCollection(AIRCRAFT_DEFINITION_LIST_MOCK);
    const results = collection._buildAircraftTypeDefinitionModelList(AIRCRAFT_DEFINITION_LIST_MOCK);

    _forEach(results, (result, i) => {
        expect(result instanceof AircraftTypeDefinitionModel).toBe(true);
        expect(result.icao === AIRCRAFT_DEFINITION_LIST_MOCK[i].icao).toBe(true);
    });
});

test.skip('.getAircraftDefinitionForAirlineId()', (t) => {
    expect(true).toBe(true);
});
