import { test, expect, vi } from 'vitest';
import sinon from 'sinon';
import GameController from '../../src/assets/scripts/client/game/GameController';
import SpawnScheduler from '../../src/assets/scripts/client/trafficGenerator/SpawnScheduler';
import SpawnPatternCollection from '../../src/assets/scripts/client/trafficGenerator/SpawnPatternCollection';
import {
    createAirportControllerFixture,
    resetAirportControllerFixture,
} from '../fixtures/airportFixtures';
import {
    createNavigationLibraryFixture,
    resetNavigationLibraryFixture,
} from '../fixtures/navigationLibraryFixtures';
import { AIRPORT_JSON_FOR_SPAWN_MOCK } from './_mocks/spawnPatternMocks';
import { INVALID_NUMBER } from '../../src/assets/scripts/client/constants/globalConstants';

let aircraftControllerStub;
let spawnPatternCollectionFixture;
let sandbox; // using the sinon sandbox ensures stubs are restored after each test

beforeEach(() => {
    createNavigationLibraryFixture();
    createAirportControllerFixture();
    SpawnPatternCollection.init(AIRPORT_JSON_FOR_SPAWN_MOCK);

    sandbox = sinon.createSandbox();
    aircraftControllerStub = {
        createAircraftWithSpawnPatternModel: sinon.stub(),
        createPreSpawnAircraftWithSpawnPatternModel: sinon.stub(),
    };
});

afterEach(() => {
    resetNavigationLibraryFixture();
    resetAirportControllerFixture();
    sandbox.restore();

    spawnPatternCollectionFixture = null;
    aircraftControllerStub = null;
});

test('throws when passed invalid parameters', () => {
    expect(() => SpawnScheduler.init()).toThrow();
    expect(() => SpawnScheduler.init(spawnPatternCollectionFixture)).toThrow();
    expect(() => SpawnScheduler.init({}, aircraftControllerStub)).toThrow();
});

test('does not throw when passed valid parameters', () => {
    expect(() => SpawnScheduler.init(aircraftControllerStub)).not.toThrow();
});

test('.createSchedulesFromList() calls .createNextSchedule() for each SpawnPatternModel in the collection', () => {
    const createSchedulesFromListSpy = sandbox.spy(SpawnScheduler, 'createSchedulesFromList');
    const createNextScheduleSpy = sandbox.spy(SpawnScheduler, 'createNextSchedule');
    const expectedCallCount = SpawnPatternCollection.spawnPatternModels.length;

    SpawnScheduler.init(aircraftControllerStub);

    expect(createSchedulesFromListSpy.called).toBe(true);
    expect(createNextScheduleSpy.callCount === expectedCallCount).toBe(true);

    createSchedulesFromListSpy.restore();
    createNextScheduleSpy.restore();
});

test('.createSchedulesFromList() calls aircraftController.createPreSpawnAircraftWithSpawnPatternModel() if preSpawnAircraftList has items', () => {
    SpawnScheduler.init(aircraftControllerStub);
    SpawnScheduler.createSchedulesFromList();

    expect(aircraftControllerStub.createPreSpawnAircraftWithSpawnPatternModel.called).toBe(true);
});

test.skip('.createNextSchedule() calls GameController.game_timeout()', (t) => {
    const gameControllerGameTimeoutStub = {
        game_timeout: sandbox.stub(),
        game: {
            time: 0,
        },
    };
    SpawnScheduler.init(aircraftControllerStub);
    const spawnPatternModel = SpawnPatternCollection._items[0];

    SpawnScheduler.createNextSchedule(spawnPatternModel, aircraftControllerStub);

    expect(gameControllerGameTimeoutStub.game_timeout.called).toBe(true);
});

test('.createAircraftAndRegisterNextTimeout() calls aircraftController.createAircraftWithSpawnPatternModel()', () => {
    SpawnScheduler.init(aircraftControllerStub);
    const spawnPatternModel = SpawnPatternCollection._items[0];

    SpawnScheduler.createAircraftAndRegisterNextTimeout([
        spawnPatternModel,
        aircraftControllerStub,
    ]);

    expect(aircraftControllerStub.createAircraftWithSpawnPatternModel.called).toBe(true);
});

test('.createAircraftAndRegisterNextTimeout() calls .createNextSchedule()', () => {
    SpawnScheduler.init(aircraftControllerStub);
    const createNextScheduleSpy = sandbox.spy(SpawnScheduler, 'createNextSchedule');
    const spawnPatternModel = SpawnPatternCollection._items[0];

    SpawnScheduler.createAircraftAndRegisterNextTimeout([
        spawnPatternModel,
        aircraftControllerStub,
    ]);

    expect(createNextScheduleSpy.calledOnce).toBe(true);

    createNextScheduleSpy.restore();
});

test('.resetTimer() returns early when SpawnPatternModel has no #scheduleId', () => {
    SpawnScheduler.init(aircraftControllerStub);
    const destroyTimerStub = sandbox.stub(GameController, 'destroyTimer');
    const spawnPatternModel = SpawnPatternCollection._items[0];
    spawnPatternModel.scheduleId = INVALID_NUMBER;

    SpawnScheduler.resetTimer(spawnPatternModel);

    delete spawnPatternModel.scheduleId;

    SpawnScheduler.resetTimer(spawnPatternModel);

    expect(destroyTimerStub.notCalled).toBe(true);

    destroyTimerStub.restore();
});

test('.resetTimer() destroys existing timers but does not create a new spawn schedule when SpawnPatternModel has a non-positive spawn rate', () => {
    SpawnScheduler.init(aircraftControllerStub);
    const spawnPatternModel = SpawnPatternCollection._items[0];
    const destroyTimerStub = sandbox.stub(GameController, 'destroyTimer');
    const getNextDelayValueStub = sandbox.stub(spawnPatternModel, 'getNextDelayValue');
    spawnPatternModel.rate = 0;

    SpawnScheduler.resetTimer(spawnPatternModel);

    spawnPatternModel.rate = -6;
    spawnPatternModel.scheduleId = 10;

    SpawnScheduler.resetTimer(spawnPatternModel);

    expect(destroyTimerStub.calledTwice).toBe(true);
    expect(getNextDelayValueStub.notCalled).toBe(true);

    destroyTimerStub.restore();
    getNextDelayValueStub.restore();
});

// test('.resetTimer() updates remaining time when timer has not yet expired', () => {
//     SpawnScheduler.init(aircraftControllerStub);
//     const spawnPatternModel = SpawnPatternCollection._items[0];
//
//     sandbox.stub(spawnPatternModel, 'getNextDelayValue').returns(15);
//
//     // TimeKeeper.accumulatedDeltaTime += 10;
//     const oldTimerValue = TimeKeeper.accumulatedDeltaTime;
//     const createAircraftWithSpawnPatternModelStub = sandbox.stub(spawnPatternModel.aircraftController, 'createAircraftWithSpawnPatternModel');
//     const _createTimeoutStub = sandbox.stub(SpawnScheduler, '_createTimeout');
//
//     SpawnScheduler.resetTimer(spawnPatternModel);
//
//     expect(createAircraftWithSpawnPatternModelStub.notCalled).toBe(true);
//     expect(_createTimeoutStub.calledWithExactly(spawnPatternModel, oldTimerValue + (15))).toBe(true);
// });
