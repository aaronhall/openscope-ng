import { test, expect, vi } from 'vitest';
import sinon from 'sinon';

import AirportModel from '../../src/assets/scripts/client/airport/AirportModel';
import DynamicPositionModel from '../../src/assets/scripts/client/base/DynamicPositionModel';
import { FLIGHT_CATEGORY } from '../../src/assets/scripts/client/constants/aircraftConstants';
import { AIRPORT_JSON_KLAS_MOCK } from './_mocks/airportJsonMock';

test('does not throw when passed valid parameters', () => {
    expect(() => new AirportModel(AIRPORT_JSON_KLAS_MOCK)).not.toThrow();
});

test('#runways retuns an array of RunwayModels with the correct data', () => {
    const model = new AirportModel(AIRPORT_JSON_KLAS_MOCK);

    expect(model.runways[0][0].name === '07L').toBe(true);
    expect(model.runways[0][1].name === '25R').toBe(true);
    expect(model.runways[0][0].relativePosition).toEqual([
        -1.5972765965064895, -0.7590007123826077,
    ]);
    expect(model.runways[0][1].relativePosition).toEqual([2.8236983855119275, 0.17990498917699685]);
});

test('does not call .setCurrentPosition() when airportData does not have a position value', () => {
    const invalidAirportJsonMock = Object.assign({}, AIRPORT_JSON_KLAS_MOCK, { position: null });
    const model = new AirportModel(AIRPORT_JSON_KLAS_MOCK);
    const setCurrentPositionSpy = sinon.spy(model, 'setCurrentPosition');

    model.init(invalidAirportJsonMock);

    expect(setCurrentPositionSpy.called).toBe(false);
});

test('calls .setCurrentPosition() when airportData has a position value', () => {
    const model = new AirportModel(AIRPORT_JSON_KLAS_MOCK);
    const setCurrentPositionSpy = sinon.spy(model, 'setCurrentPosition');

    model.init(AIRPORT_JSON_KLAS_MOCK);

    expect(setCurrentPositionSpy.calledOnce).toBe(true);
});

test('.setCurrentPosition() returns early when passed an invalid coordinate', () => {
    const model = new AirportModel(AIRPORT_JSON_KLAS_MOCK);
    model._positionModel = null;

    model.setCurrentPosition([]);

    expect(!model._positionModel).toBe(true);
});

test('.buildAirportAirspace() returns early when passed a null or undefined argument', () => {
    const model = new AirportModel(AIRPORT_JSON_KLAS_MOCK);
    model.airspace = null;

    model.buildAirspace();

    expect(!model.airspace).toBe(true);
});

test('.buildRestrictedAreas() returns early when passed a null or undefined argument', () => {
    const model = new AirportModel(AIRPORT_JSON_KLAS_MOCK);
    model.restricted_areas = null;

    model.buildRestrictedAreas();

    expect(!model.restricted_areas).toBe(true);
});

test('.updateCurrentWind() returns early when passed a null or undefined argument', () => {
    const model = new AirportModel(AIRPORT_JSON_KLAS_MOCK);
    model.wind.speed = 42;
    model.wind.angle = 42;

    model.updateCurrentWind();

    expect(model.wind.speed === 42).toBe(true);
    expect(model.wind.angle === 42).toBe(true);
});

test('.set() calls .load() when #lodaed is false', () => {
    const model = new AirportModel(AIRPORT_JSON_KLAS_MOCK);
    const loadSpy = sinon.spy(model, 'load');
    model.loaded = false;

    model.set(AIRPORT_JSON_KLAS_MOCK);

    expect(loadSpy.calledWithExactly(AIRPORT_JSON_KLAS_MOCK)).toBe(true);
});

test('.loadTerrain() returns early when #has_terrain is false', () => {
    const model = new AirportModel(AIRPORT_JSON_KLAS_MOCK);
    const parseTerrainSpy = sinon.spy(model, 'parseTerrain');
    model.has_terrain = false;

    model.loadTerrain();

    expect(parseTerrainSpy.calledOnce).toBe(false);
});

test('.load() calls .onLoadIntialAirportFromJson() when passed an object', () => {
    const model = new AirportModel(AIRPORT_JSON_KLAS_MOCK);
    const onLoadIntialAirportFromJsonSpy = sinon.spy(model, 'onLoadIntialAirportFromJson');

    model.load(AIRPORT_JSON_KLAS_MOCK);

    expect(onLoadIntialAirportFromJsonSpy.calledWithExactly(AIRPORT_JSON_KLAS_MOCK)).toBe(true);
});

test('.load() does not call .onLoadIntialAirportFromJson() when no parameters are received', () => {
    const model = new AirportModel(AIRPORT_JSON_KLAS_MOCK);
    const onLoadIntialAirportFromJsonSpy = sinon.spy(model, 'onLoadIntialAirportFromJson');

    model.load();

    expect(onLoadIntialAirportFromJsonSpy.called).toBe(false);
});

test('.getRunwayByName() returns null when passed an invalid runwayname', () => {
    const model = new AirportModel(AIRPORT_JSON_KLAS_MOCK);
    const result = model.getRunway();

    expect(!result).toBe(true);
});

test('.getActiveRunwayForCategory() returns the correct RunwayModel for departure', () => {
    const model = new AirportModel(AIRPORT_JSON_KLAS_MOCK);
    const result = model.getActiveRunwayForCategory(FLIGHT_CATEGORY.DEPARTURE);

    expect(result.name === model.departureRunwayModel.name).toBe(true);
});

test('.getActiveRunwayForCategory() returns the correct RunwayModel for arrival', () => {
    const model = new AirportModel(AIRPORT_JSON_KLAS_MOCK);
    const result = model.getActiveRunwayForCategory(FLIGHT_CATEGORY.ARRIVAL);

    expect(result.name === model.arrivalRunwayModel.name).toBe(true);
});

test('.getActiveRunwayForCategory() returns the arrivalRunway when an invalid category is passed', () => {
    const model = new AirportModel(AIRPORT_JSON_KLAS_MOCK);
    const result = model.getActiveRunwayForCategory('threeve');

    expect(result.name === model.arrivalRunwayModel.name).toBe(true);
});

test('.isPointWithinAirspace() returns true when the provided point is inside the lateral and vertical boundaries', () => {
    const model = new AirportModel(AIRPORT_JSON_KLAS_MOCK);
    const coordinatesMock = [36, -114.5];
    const positionMock = DynamicPositionModel.calculateRelativePosition(
        coordinatesMock,
        model.positionModel,
        model.magneticNorth
    );
    const altitudeMock = 19000;
    const result = model.isPointWithinAirspace(positionMock, altitudeMock);

    expect(result).toBe(true);
});

test('.isPointWithinAirspace() returns false when the provided point is inside the lateral boundary but not within vertical boundaries', () => {
    const model = new AirportModel(AIRPORT_JSON_KLAS_MOCK);
    const coordinatesMock = [36, -114.5];
    const positionMock = DynamicPositionModel.calculateRelativePosition(
        coordinatesMock,
        model.positionModel,
        model.magneticNorth
    );
    const altitudeMock = 19001;
    const result = model.isPointWithinAirspace(positionMock, altitudeMock);

    expect(result).toBe(false);
});

test('.isPointWithinAirspace() returns false when the provided point is inside the vertical boundary but not within lateral boundaries', () => {
    const model = new AirportModel(AIRPORT_JSON_KLAS_MOCK);
    const coordinatesMock = [36, -114];
    const positionMock = DynamicPositionModel.calculateRelativePosition(
        coordinatesMock,
        model.positionModel,
        model.magneticNorth
    );
    const altitudeMock = 19000;
    const result = model.isPointWithinAirspace(positionMock, altitudeMock);

    expect(result).toBe(false);
});

test('.mapCollection is valid', () => {
    const model = new AirportModel(AIRPORT_JSON_KLAS_MOCK);

    expect(model.mapCollection.hasVisibleMaps).toBe(true);
});

test.skip('.removeAircraftFromAllRunwayQueues()', (t) => {
    const model = new AirportModel(AIRPORT_JSON_KLAS_MOCK);
    const removeAircraftFromAllRunwayQueuesSpy = sinon.spy(
        model._runwayCollection,
        'removeAircraftFromAllRunwayQueues'
    );
    model.removeAircraftFromAllRunwayQueues({});

    expect(removeAircraftFromAllRunwayQueuesSpy.calledOnce).toBe(true);
});

test('.resetAllRunwayQueues() calls .resetQueue() for all runways', () => {
    const model = new AirportModel(AIRPORT_JSON_KLAS_MOCK);
    const resetQueueSpy07L = sinon.spy(
        model._runwayCollection.findRunwayModelByName('07L'),
        'resetQueue'
    );
    const resetQueueSpy25R = sinon.spy(
        model._runwayCollection.findRunwayModelByName('25R'),
        'resetQueue'
    );
    const resetQueueSpy07R = sinon.spy(
        model._runwayCollection.findRunwayModelByName('07R'),
        'resetQueue'
    );
    const resetQueueSpy25L = sinon.spy(
        model._runwayCollection.findRunwayModelByName('25L'),
        'resetQueue'
    );
    const resetQueueSpy01L = sinon.spy(
        model._runwayCollection.findRunwayModelByName('01L'),
        'resetQueue'
    );
    const resetQueueSpy19R = sinon.spy(
        model._runwayCollection.findRunwayModelByName('19R'),
        'resetQueue'
    );
    const resetQueueSpy01R = sinon.spy(
        model._runwayCollection.findRunwayModelByName('01R'),
        'resetQueue'
    );
    const resetQueueSpy19L = sinon.spy(
        model._runwayCollection.findRunwayModelByName('19L'),
        'resetQueue'
    );

    model.resetAllRunwayQueues();

    expect(resetQueueSpy07L.calledWithExactly()).toBe(true);
    expect(resetQueueSpy25R.calledWithExactly()).toBe(true);
    expect(resetQueueSpy07R.calledWithExactly()).toBe(true);
    expect(resetQueueSpy25L.calledWithExactly()).toBe(true);
    expect(resetQueueSpy01L.calledWithExactly()).toBe(true);
    expect(resetQueueSpy19R.calledWithExactly()).toBe(true);
    expect(resetQueueSpy01R.calledWithExactly()).toBe(true);
    expect(resetQueueSpy19L.calledWithExactly()).toBe(true);
});
