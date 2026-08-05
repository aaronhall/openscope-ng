import { test, expect, vi } from 'vitest';
import sinon from 'sinon';
import SpawnPatternCollection from '../../src/assets/scripts/client/trafficGenerator/SpawnPatternCollection';
import {
    createAirportControllerFixture,
    resetAirportControllerFixture
} from '../fixtures/airportFixtures';
import {
    createNavigationLibraryFixture,
    resetNavigationLibraryFixture
} from '../fixtures/navigationLibraryFixtures';
import { spawnPatternModelArrivalFixture, spawnPatternModelDepartureFixture } from '../fixtures/trafficGeneratorFixtures';
import { AIRPORT_JSON_FOR_SPAWN_MOCK } from './_mocks/spawnPatternMocks';

let sandbox; // using the sinon sandbox ensures stubs are restored after each test

beforeEach(() => {
    sandbox = sinon.createSandbox();

    createNavigationLibraryFixture();
    createAirportControllerFixture();
});

afterEach(() => {
    sandbox.restore();

    resetNavigationLibraryFixture();
    resetAirportControllerFixture();
    SpawnPatternCollection.reset();
});

test('.init() throws when the provided airport JSON data is empty or invalid', () => {
    const expectedMessage = /Invalid airportJson passed to SpawnPatternCollection\.init\. Expected a non-empty object, but received .*/;

    expect(() => SpawnPatternCollection.init(), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => SpawnPatternCollection.init(null), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => SpawnPatternCollection.init([]), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => SpawnPatternCollection.init({}), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => SpawnPatternCollection.init(42), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => SpawnPatternCollection.init('threeve'), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => SpawnPatternCollection.init(false), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
});

test('.init() calls _buildSpawnPatternModels()', () => {
    const _buildSpawnPatternModelsSpy = sandbox.spy(SpawnPatternCollection, '_buildSpawnPatternModels');

    SpawnPatternCollection.init(AIRPORT_JSON_FOR_SPAWN_MOCK);

    expect(_buildSpawnPatternModelsSpy.calledWithExactly(AIRPORT_JSON_FOR_SPAWN_MOCK.spawnPatterns)).toBe(true);
});

test('.addItems() does not call .addItem() if passed an invalid value', () => {
    SpawnPatternCollection.init(AIRPORT_JSON_FOR_SPAWN_MOCK);

    const addItemSpy = sandbox.spy(SpawnPatternCollection, 'addItem');

    SpawnPatternCollection.addItems([]);
    expect(addItemSpy.called).toBe(false);

    SpawnPatternCollection.addItems();
    expect(addItemSpy.called).toBe(false);

    addItemSpy.restore();
});

test('.addItems() calls .addItem() for each item in the list passed as an argument', () => {
    SpawnPatternCollection.init(AIRPORT_JSON_FOR_SPAWN_MOCK);

    const addItemSpy = sandbox.spy(SpawnPatternCollection, 'addItem');

    SpawnPatternCollection.addItems([spawnPatternModelArrivalFixture, spawnPatternModelDepartureFixture]);

    expect(addItemSpy.calledTwice).toBe(true);

    addItemSpy.restore();
});

test('.addItem() throws if anything other than a SpawnPatternModel is passed as an argument', () => {
    SpawnPatternCollection.init(AIRPORT_JSON_FOR_SPAWN_MOCK);

    expect(() => SpawnPatternCollection.addItem()).toThrow();
    expect(() => SpawnPatternCollection.addItem([])).toThrow();
    expect(() => SpawnPatternCollection.addItem({})).toThrow();
    expect(() => SpawnPatternCollection.addItem(42)).toThrow();
    expect(() => SpawnPatternCollection.addItem('threeve')).toThrow();
    expect(() => SpawnPatternCollection.addItem(false)).toThrow();
    expect(() => SpawnPatternCollection.addItem(null)).toThrow();
    expect(() => SpawnPatternCollection.addItem(undefined)).toThrow();
});

test('.findSpawnPatternsByCategory() returns an empty array when no spawn patterns of the specified category are found', () => {
    SpawnPatternCollection.init(AIRPORT_JSON_FOR_SPAWN_MOCK);
    SpawnPatternCollection.addItems([spawnPatternModelArrivalFixture, spawnPatternModelDepartureFixture]);

    const categoryMock = 'threeve';
    const expectedResult = [];
    const result = SpawnPatternCollection.findSpawnPatternsByCategory(categoryMock);

    expect(result).toEqual(expectedResult);
});

test('.findSpawnPatternsByCategory() returns all SpawnPatternModels in the collection which have the specified category', () => {
    SpawnPatternCollection.init(AIRPORT_JSON_FOR_SPAWN_MOCK);
    SpawnPatternCollection.addItems([
        spawnPatternModelArrivalFixture,
        spawnPatternModelDepartureFixture
    ]);

    const categoryMock = 'arrival';
    const result = SpawnPatternCollection.findSpawnPatternsByCategory(categoryMock);

    expect(result.every((spawnPatternModel) => spawnPatternModel.category === categoryMock)).toBe(true);
});
