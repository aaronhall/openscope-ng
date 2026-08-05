import { test, expect, vi } from 'vitest';

import RunwayCollection from '../../../src/assets/scripts/client/airport/runway/RunwayCollection';
import RunwayModel from '../../../src/assets/scripts/client/airport/runway/RunwayModel';
import RunwayRelationshipModel from '../../../src/assets/scripts/client/airport/runway/RunwayRelationshipModel';
import {
    airportModelFixture,
    airportPositionFixtureKLAS
} from '../../fixtures/airportFixtures';
import { AIRPORT_JSON_KLAS_MOCK } from '../_mocks/airportJsonMock';

const RUNWAY_LIST_MOCK = AIRPORT_JSON_KLAS_MOCK.runways;

test('throws when called with missing parameters', () => {
    const expectedMessage = /Invalid parameter\(s\) passed to RunwayCollection constructor\. Expected runwayJson and airportPositionModel to be defined, but received .*/;

    expect(() => new RunwayCollection(), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();

    expect(() => new RunwayCollection(RUNWAY_LIST_MOCK), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => new RunwayCollection(airportPositionFixtureKLAS), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();

    expect(() => new RunwayCollection(null, airportPositionFixtureKLAS), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => new RunwayCollection(RUNWAY_LIST_MOCK, null), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
});

test('throws when called with invalid runwayJson', () => {
    const expectedMessage = /Invalid runwayJson passed to RunwayCollection constructor\. Expected a non-empty array, but received .*/;

    expect(() => new RunwayCollection({}, airportPositionFixtureKLAS), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => new RunwayCollection([], airportPositionFixtureKLAS), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => new RunwayCollection(42, airportPositionFixtureKLAS), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => new RunwayCollection('threeve', airportPositionFixtureKLAS), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => new RunwayCollection(false, airportPositionFixtureKLAS), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
});

test('does not throw when called with valid parameters', () => {
    expect(() => new RunwayCollection(RUNWAY_LIST_MOCK, airportPositionFixtureKLAS)).not.toThrow();
});

test('sets #_items when instantiated', () => {
    const collection = new RunwayCollection(RUNWAY_LIST_MOCK, airportPositionFixtureKLAS);

    expect(collection.length === 8).toBe(true);
});

test('provides #runways getter that returns the contents of #_items', () => {
    const collection = new RunwayCollection(RUNWAY_LIST_MOCK, airportPositionFixtureKLAS);

    expect(collection.runways.length === 8).toBe(true);
    expect(collection.runways[0] instanceof RunwayModel).toBe(true);
});

test('.findRunwayModelByName() returns null when passed an invalid runway name', () => {
    const collection = new RunwayCollection(RUNWAY_LIST_MOCK, airportPositionFixtureKLAS);
    const result = collection.findRunwayModelByName();

    expect(!result).toBe(true);
});

test('.findRunwayModelByName() returns a RunwayModel when passed a valid runway name', () => {
    const runwayNameMock = '07L';
    const collection = new RunwayCollection(RUNWAY_LIST_MOCK, airportPositionFixtureKLAS);
    const result = collection.findRunwayModelByName(runwayNameMock);

    expect(result instanceof RunwayModel).toBe(true);
    expect(result.name === runwayNameMock).toBe(true);
});

test('.getRunwayRelationshipForRunwayNames() returns a RunwayRelationshipModel given two runwayName strings', () => {
    const collection = new RunwayCollection(RUNWAY_LIST_MOCK, airportPositionFixtureKLAS);
    const result = collection.getRunwayRelationshipForRunwayNames('07l', '07r');

    expect(result instanceof RunwayRelationshipModel).toBe(true);
});

test('.areRunwaysParallel() returns true given two runwayName strings for parallel runways', () => {
    const collection = new RunwayCollection(RUNWAY_LIST_MOCK, airportPositionFixtureKLAS);

    expect(collection.areRunwaysParallel('07l', '07r')).toBe(true);
});

test('.areRunwaysParallel() returns false given two runwayName strings for non-parallel runways', () => {
    const collection = new RunwayCollection(RUNWAY_LIST_MOCK, airportPositionFixtureKLAS);

    expect(collection.areRunwaysParallel('07l', '19l')).toBe(false);
});

test.skip('.findBestRunwayForWind()', (t) => {
    const getWindMock = () => ({
        speed: 6,
        angle: 3.839724354387525
    });
    const collection = new RunwayCollection(RUNWAY_LIST_MOCK, airportPositionFixtureKLAS);
    const result = collection.findBestRunwayForWind(getWindMock);

    // TODO: this result varies and should be investigated as to why
    expect(result === '25L').toBe(true);
});

test.todo('.removeAircraftFromAllRunwayQueues()');

test('_buildRunwayRelationships() builds an object with a key for each runway name', () => {
    const expectedResult = ['07L', '25R', '07R', '25L', '01R', '19L', '01L', '19R'];
    const collection = new RunwayCollection(RUNWAY_LIST_MOCK, airportPositionFixtureKLAS);
    collection._runwayRelationships = {};

    collection._buildRunwayRelationships();

    const result = Object.keys(collection._runwayRelationships);

    expect(result).toEqual(expectedResult);
});
