import { test, expect, vi } from 'vitest';
import sinon from 'sinon';
import _isEqual from 'lodash/isEqual';
import _round from 'lodash/round';
import SpawnPatternModel from '../../src/assets/scripts/client/trafficGenerator/SpawnPatternModel';
import {
    createAirportControllerFixture,
    resetAirportControllerFixture
} from '../fixtures/airportFixtures';
import {
    createNavigationLibraryFixture,
    resetNavigationLibraryFixture
} from '../fixtures/navigationLibraryFixtures';
import {
    DEPARTURE_PATTERN_MOCK,
    DEPARTURE_PATTERN_ROUTE_STRING_MOCK,
    ARRIVAL_PATTERN_MOCK,
    ARRIVAL_PATTERN_MOCK_ALL_STRINGS,
    ARRIVAL_PATTERN_CYCLIC_MOCK,
    ARRIVAL_PATTERN_WAVE_MOCK,
    ARRIVAL_PATTERN_ROUTE_STRING_MOCK,
    ARRIVAL_PATTERN_FLOAT_RATE_MOCK
} from './_mocks/spawnPatternMocks';
import { INVALID_NUMBER } from '../../src/assets/scripts/client/constants/globalConstants';
import { DEFAULT_SCREEN_POSITION } from '../../src/assets/scripts/client/constants/positionConstants';

beforeEach(() => {
    createNavigationLibraryFixture();
    createAirportControllerFixture();
});

afterEach(() => {
    resetNavigationLibraryFixture();
    resetAirportControllerFixture();
});

test('does not throw when called without parameters', () => {
    expect(() => new SpawnPatternModel()).not.toThrow();
    expect(() => new SpawnPatternModel([])).not.toThrow();
    expect(() => new SpawnPatternModel({})).not.toThrow();
    expect(() => new SpawnPatternModel(42)).not.toThrow();
    expect(() => new SpawnPatternModel(false)).not.toThrow();
});

test('.init() throws when called with invalid parameters', () => {
    const model = new SpawnPatternModel();

    expect(() => model.init()).not.toThrow();
});

test('does not throw when called with valid parameters', () => {
    expect(() => new SpawnPatternModel(DEPARTURE_PATTERN_MOCK)).not.toThrow();
    expect(() => new SpawnPatternModel(DEPARTURE_PATTERN_ROUTE_STRING_MOCK)).not.toThrow();
    expect(() => new SpawnPatternModel(ARRIVAL_PATTERN_MOCK)).not.toThrow();
    expect(() => new SpawnPatternModel(ARRIVAL_PATTERN_ROUTE_STRING_MOCK)).not.toThrow();
});

test('initializes correctly when spawn pattern definition uses string type for number values', () => {
    const model = new SpawnPatternModel(ARRIVAL_PATTERN_MOCK_ALL_STRINGS);

    expect(model._minimumAltitude === 36000).toBe(true);
    expect(model._maximumAltitude === 36000).toBe(true);
    expect(model.speed === 320).toBe(true);
    expect(model.rate === 10).toBe(true);
});

test('initializes correctly when rate is passed as a float', () => {
    const model = new SpawnPatternModel(ARRIVAL_PATTERN_FLOAT_RATE_MOCK);

    expect(model.rate === 3.3).toBe(true);
});

test('#position defaults to DEFAULT_SCREEN_POSITION', () => {
    const model = new SpawnPatternModel(DEPARTURE_PATTERN_MOCK);

    expect(_isEqual(model.relativePosition, DEFAULT_SCREEN_POSITION)).toBe(true);
});

test('#altitude returns a random altitude rounded to the nearest 1,000ft', () => {
    const model = new SpawnPatternModel(ARRIVAL_PATTERN_MOCK);
    const result = model.altitude;
    const expectedResult = _round(result, -3);

    expect(_isEqual(result, expectedResult)).toBe(true);
    expect(typeof result === 'number').toBe(true);
});

test('#id returns #_id', () => {
    const model = new SpawnPatternModel(ARRIVAL_PATTERN_MOCK);
    const expectedResult = 'some-value';
    model._id = expectedResult;
    const result = model.id;

    expect(result === expectedResult).toBe(true);
});

test('#positionModel returns #_positionModel', () => {
    const model = new SpawnPatternModel(ARRIVAL_PATTERN_MOCK);
    const expectedResult = 'some-value';
    model._positionModel = expectedResult;
    const result = model.positionModel;

    expect(result === expectedResult).toBe(true);
});

test('#airportIcao returns the airport icao when type is arrival', () => {
    const model = new SpawnPatternModel(ARRIVAL_PATTERN_MOCK);
    const expectedResult = 'KLAS';
    const result = model.airportIcao;

    expect(result === expectedResult).toBe(true);
});

test('#airportIcao returns the airport icao when type is departure', () => {
    const model = new SpawnPatternModel(DEPARTURE_PATTERN_MOCK);
    const expectedResult = 'KLAS';
    const result = model.airportIcao;

    expect(result === expectedResult).toBe(true);
});

test('#airportIcao returns the airport icao when type is overflight', () => {
    const model = new SpawnPatternModel(ARRIVAL_PATTERN_MOCK);
    const isOverflightStub = sinon.stub(model, 'isOverflight').returns(true);
    const expectedResult = 'overflight';
    const result = model.airportIcao;

    expect(result === expectedResult).toBe(true);

    isOverflightStub.restore();
});

test('.cycleStart() returns early if cycleStartTime does not equal -1', () => {
    const cycleStartTimeMock = 42;
    const model = new SpawnPatternModel(ARRIVAL_PATTERN_MOCK);
    model.cycleStartTime = cycleStartTimeMock;

    model.cycleStart(33);

    expect(model.cycleStartTime === cycleStartTimeMock).toBe(true);
});

test('.cycleStart() sets cycleStartTime with a startTime + offset', () => {
    const cycleStartTimeMock = 42;
    const model = new SpawnPatternModel(ARRIVAL_PATTERN_MOCK);
    model.offset = 0;
    model.cycleStartTime = INVALID_NUMBER;

    model.cycleStart(cycleStartTimeMock);

    expect(model.cycleStartTime === cycleStartTimeMock).toBe(true);
});

test('.getNextDelayValue() returns a random number between minimumDelay and maximumDelay', () => {
    const model = new SpawnPatternModel(ARRIVAL_PATTERN_MOCK);
    const result = model.getNextDelayValue();

    expect(typeof result === 'number').toBe(true);
});

test('.getNextDelayValue() calls ._calculateRandomDelayPeriod() if SPAWN_METHOD.RANDOM', () => {
    const model = new SpawnPatternModel(ARRIVAL_PATTERN_MOCK);
    const _calculateRandomDelayPeriodSpy = sinon.spy(model, '_calculateRandomDelayPeriod');
    model.method = 'random';

    model.getNextDelayValue();

    expect(_calculateRandomDelayPeriodSpy.calledOnce).toBe(true);
});

test('.getNextDelayValue() calls ._calculateNextCyclicDelayPeriod() if SPAWN_METHOD.CYCLIC', () => {
    const gameTimeMock = 42;
    const model = new SpawnPatternModel(ARRIVAL_PATTERN_CYCLIC_MOCK);
    const _calculateNextCyclicDelayPeriodSpy = sinon.spy(model, '_calculateNextCyclicDelayPeriod');

    model.getNextDelayValue(gameTimeMock);

    expect(_calculateNextCyclicDelayPeriodSpy.calledWithExactly(gameTimeMock)).toBe(true);
});

test('.getNextDelayValue() calls ._calculateNextSurgeDelayPeriod() if SPAWN_METHOD.SURGE', () => {
    const gameTimeMock = 42;
    const model = new SpawnPatternModel(ARRIVAL_PATTERN_MOCK);
    const _calculateNextSurgeDelayPeriodSpy = sinon.spy(model, '_calculateNextSurgeDelayPeriod');
    model.method = 'surge';

    model.getNextDelayValue(gameTimeMock);

    expect(_calculateNextSurgeDelayPeriodSpy.calledWithExactly(gameTimeMock)).toBe(true);
});

test('.getNextDelayValue() calls ._calculateNextWaveDelayPeriod() if SPAWN_METHOD.WAVE', () => {
    const gameTimeMock = 42;
    const model = new SpawnPatternModel(ARRIVAL_PATTERN_WAVE_MOCK);
    const _calculateNextWaveDelayPeriodSpy = sinon.spy(model, '_calculateNextWaveDelayPeriod');

    model.getNextDelayValue(gameTimeMock);

    expect(_calculateNextWaveDelayPeriodSpy.calledWithExactly(gameTimeMock)).toBe(true);
});

test('._calculateNextCyclicDelayPeriod() returns 360 when gameTime is 0', () => {
    const gameTimeMock = 0;
    const model = new SpawnPatternModel(ARRIVAL_PATTERN_CYCLIC_MOCK);
    const result = model._calculateNextCyclicDelayPeriod(gameTimeMock);

    expect(result === 360).toBe(true);
});

test.skip('._calculateNextWaveDelayPeriod()', (t) => {
    const gameTimeMock = 3320;
    const model = new SpawnPatternModel(ARRIVAL_PATTERN_WAVE_MOCK);
    const result = model._calculateNextWaveDelayPeriod(gameTimeMock);

    // expect(result === 360).toBe(true);
});

test('._setMinMaxAltitude() sets _minimumAltitude and _maximumAltitude when an array of numbers is passed ', () => {
    // creating new mock here so as not to overwrite and affect original
    const arrivalMock = Object.assign({}, ARRIVAL_PATTERN_MOCK, { altitude: 0 });
    const altitudeMock = [10000, 20000];
    const model = new SpawnPatternModel(arrivalMock);

    model._setMinMaxAltitude(altitudeMock);

    expect(model._minimumAltitude === altitudeMock[0]).toBe(true);
    expect(model._maximumAltitude === altitudeMock[1]).toBe(true);
});

test('._setMinMaxAltitude() sets _minimumAltitude and _maximumAltitude when an array of strings is passed ', () => {
    // creating new mock here so as not to overwrite and affect original
    const arrivalMock = Object.assign({}, ARRIVAL_PATTERN_MOCK, { altitude: 0 });
    const altitudeMock = ['10000', '20000'];
    const model = new SpawnPatternModel(arrivalMock);

    model._setMinMaxAltitude(altitudeMock);

    expect(model._minimumAltitude === 10000).toBe(true);
    expect(model._maximumAltitude === 20000).toBe(true);
});

test('._setMinMaxAltitude() sets _minimumAltitude and _maximumAltitude when a number is passed ', () => {
    // creating new mock here so as not to overwrite and affect original
    const arrivalMock = Object.assign({}, ARRIVAL_PATTERN_MOCK, { altitude: 0 });
    const altitudeMock = 23000;
    const model = new SpawnPatternModel(arrivalMock);

    model._setMinMaxAltitude(altitudeMock);

    expect(model._minimumAltitude === altitudeMock).toBe(true);
    expect(model._maximumAltitude === altitudeMock).toBe(true);
});

test('._setMinMaxAltitude() sets _minimumAltitude and _maximumAltitude when a string is passed ', () => {
    // creating new mock here so as not to overwrite and affect original
    const arrivalMock = Object.assign({}, ARRIVAL_PATTERN_MOCK, { altitude: 0 });
    const altitudeMock = '23000';
    const model = new SpawnPatternModel(arrivalMock);

    model._setMinMaxAltitude(altitudeMock);

    expect(model._minimumAltitude === 23000).toBe(true);
    expect(model._maximumAltitude === 23000).toBe(true);
});

test('._initializePositionAndHeadingForArrival() returns early when spawnPattern.category is departure', () => {
    const model = new SpawnPatternModel(DEPARTURE_PATTERN_MOCK);

    model._initializePositionAndHeadingForAirborneAircraft(DEPARTURE_PATTERN_MOCK);

    expect(model.heading === -999).toBe(true);
    expect(_isEqual(model.relativePosition, DEFAULT_SCREEN_POSITION)).toBe(true);
});

test('._initializePositionAndHeadingForArrival() calculates aircraft heading and position when provided a route', () => {
    const expectedHeadingResult = 4.436187691083426;
    const expectedPositionResult = [220.0165474765974, 137.76227044819646];
    const model = new SpawnPatternModel(ARRIVAL_PATTERN_MOCK);

    model._initializePositionAndHeadingForAirborneAircraft(ARRIVAL_PATTERN_MOCK);

    expect(model.heading === expectedHeadingResult).toBe(true);
    expect(_isEqual(model.relativePosition, expectedPositionResult)).toBe(true);
});

test('._calculateSpawnHeading() returns bearing between route\'s first and second waypoints', () => {
    const mock = Object.assign(
        {},
        ARRIVAL_PATTERN_MOCK,
        {
            route: 'JESJI..BAKRR'
        }
    );

    const model = new SpawnPatternModel(mock);
    const expectedResult = 1.3415936051582544;
    const result = model._calculateSpawnHeading();

    expect(result === expectedResult).toBe(true);
});
