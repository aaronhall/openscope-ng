import { test, expect, vi } from 'vitest';

import { createAirportControllerFixture } from '../fixtures/airportFixtures';
import { createNavigationLibraryFixture } from '../fixtures/navigationLibraryFixtures';
import AircraftModel from '../../src/assets/scripts/client/aircraft/AircraftModel';
import MeasureTool from '../../src/assets/scripts/client/measurement/MeasureTool';
import FixCollection from '../../src/assets/scripts/client/navigationLibrary/FixCollection';
import MeasureLegModel from '../../src/assets/scripts/client/measurement/MeasureLegModel';
import { MEASURE_TOOL_STYLE } from '../../src/assets/scripts/client/constants/inputConstants';
import { ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK } from '../aircraft/_mocks/aircraftMocks';

const CURSOR_POSITION = [500, 20];

function createAircaft() {
    return new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK);
}

beforeAll(() => {
    createNavigationLibraryFixture();
    createAirportControllerFixture();
});

beforeEach(() => {
    MeasureTool.reset();
});

test('.addPoint() throws when #isMeasuring is not set', (t) => {
    expect(() => MeasureTool.addPoint(CURSOR_POSITION)).toThrow();
});

test('.removePreviousPoint() throws when #isMeasuring is not set', (t) => {
    expect(() => MeasureTool.removePreviousPoint()).toThrow();
});

test('.updateLastPoint() throws when #isMeasuring is not set', (t) => {
    expect(() => MeasureTool.updateLastPoint(CURSOR_POSITION)).toThrow();
});

test('.addPoint() throws when point value is invalid', (t) => {
    MeasureTool.startNewPath();

    expect(() => MeasureTool.addPoint({})).toThrow();
    expect(() => MeasureTool.addPoint(null)).toThrow();
    expect(() => MeasureTool.addPoint(FixCollection.findFixByName('BAKRR'))).not.toThrow();
    expect(() => MeasureTool.updateLastPoint(createAircaft())).not.toThrow();
    expect(() => MeasureTool.addPoint(CURSOR_POSITION)).not.toThrow();
});

test(".startNewPath() throws when the current path hasn't been ended.", (t) => {
    expect(() => MeasureTool.startNewPath()).not.toThrow();
    expect(() => MeasureTool.startNewPath()).toThrow();
});

test('.updateLastPoint() throws when point value is invalid', (t) => {
    MeasureTool.startNewPath();

    expect(() => MeasureTool.updateLastPoint({})).toThrow();
    expect(() => MeasureTool.updateLastPoint(null)).toThrow();
    expect(() => MeasureTool.updateLastPoint(FixCollection.findFixByName('BAKRR'))).not.toThrow();
    expect(() => MeasureTool.updateLastPoint(createAircaft())).not.toThrow();
    expect(() => MeasureTool.updateLastPoint(CURSOR_POSITION)).not.toThrow();
});

test('hasPaths returns correct value', (t) => {
    expect(MeasureTool.hasPaths).toBe(false);

    MeasureTool.startNewPath();

    expect(MeasureTool.hasPaths).toBe(true);
});

test('.addPoint() sets the correct flags', (t) => {
    MeasureTool.startNewPath();

    expect(MeasureTool.isMeasuring).toBe(true);
    expect(MeasureTool.hasStarted).toBe(false);

    MeasureTool.addPoint(FixCollection.findFixByName('DBIGE'));

    expect(MeasureTool.isMeasuring).toBe(true);
    expect(MeasureTool.hasStarted).toBe(true);

    MeasureTool.endPath();

    expect(MeasureTool.isMeasuring).toBe(false);
    expect(MeasureTool.hasStarted).toBe(false);
});

test('.buildPathInfo() returns an empty array when there are no saved points', (t) => {
    const bakrr = FixCollection.findFixByName('BAKRR');

    MeasureTool.startNewPath();
    MeasureTool.addPoint(bakrr);
    MeasureTool.endPath();

    const pathInfo = MeasureTool.buildPathInfo();

    expect(pathInfo).toEqual([]);
});

test('.buildPathInfo() returns an empty array when there is only one saved point', (t) => {
    const bakrr = FixCollection.findFixByName('BAKRR');

    MeasureTool.startNewPath();
    MeasureTool.addPoint(bakrr);
    MeasureTool.addPoint(CURSOR_POSITION);
    MeasureTool.endPath();

    const pathInfo = MeasureTool.buildPathInfo();

    expect(pathInfo).toEqual([]);
});

test('.buildPathInfo() builds a correct MeasureLegModel from FixModel points', (t) => {
    const bakrr = FixCollection.findFixByName('BAKRR');
    const dbige = FixCollection.findFixByName('DBIGE');

    MeasureTool.startNewPath();
    MeasureTool.addPoint(bakrr);
    MeasureTool.addPoint(dbige);
    MeasureTool.addPoint(CURSOR_POSITION);
    MeasureTool.endPath();

    const [pathInfo] = MeasureTool.buildPathInfo();
    const { initialTurn, firstLeg } = pathInfo;

    expect(initialTurn).toBe(null);
    expect(firstLeg instanceof MeasureLegModel).toBe(true);
    expect(firstLeg.previous).not.toBe(null);
    expect(firstLeg.startPoint).not.toBe(null);
    expect(firstLeg.next).toBe(null);

    expect(firstLeg.startPoint).toEqual(bakrr.relativePosition);
    expect(firstLeg.endPoint).toEqual(dbige.relativePosition);
    expect(firstLeg.midPoint).not.toBe(null);
    expect(firstLeg.bearing).not.toBe(0);
    expect(firstLeg.distance).not.toBe(0);
    expect(firstLeg.labels.length).toBe(1);
    expect(firstLeg.radius).toBe(0);
});

test('.buildPathInfo() builds a correct MeasureLegModel from mixed points', (t) => {
    const bakrr = FixCollection.findFixByName('BAKRR');
    const aircraft = createAircaft();
    aircraft.groundSpeed = 180;

    MeasureTool.startNewPath();
    MeasureTool.setStyle(MEASURE_TOOL_STYLE.ALL_ARCED);
    MeasureTool.addPoint(aircraft);
    MeasureTool.addPoint(bakrr);
    MeasureTool.addPoint(CURSOR_POSITION); // will be kept
    MeasureTool.addPoint(CURSOR_POSITION); // will be removed
    MeasureTool.endPath();

    const [pathInfo] = MeasureTool.buildPathInfo();
    const { initialTurn, firstLeg } = pathInfo;
    const leg1 = firstLeg.next;

    expect(initialTurn).not.toBe(null);
    expect(firstLeg instanceof MeasureLegModel).toBe(true);
    expect(leg1.next).toBe(null);

    expect(initialTurn.turnRadius).not.toBe(0);
    expect(firstLeg.radius).not.toBe(0);
    expect(leg1.radius).toBe(0);
});

test('.removePreviousPoint() removes the second-to-last point in the current path', (t) => {
    const bakrr = FixCollection.findFixByName('BAKRR');
    const dbige = FixCollection.findFixByName('DBIGE');

    MeasureTool.startNewPath();
    MeasureTool.addPoint(bakrr);
    MeasureTool.addPoint(dbige);
    MeasureTool.addPoint(CURSOR_POSITION);

    expect(MeasureTool._currentPath._points.length).toBe(3);

    MeasureTool.removePreviousPoint();

    expect(MeasureTool._currentPath._points.length).toBe(2);
    expect(MeasureTool._currentPath._points).toEqual([bakrr, CURSOR_POSITION]);
});

test('.reset() clears the flags to their initial state', (t) => {
    MeasureTool.startNewPath();
    MeasureTool.addPoint(FixCollection.findFixByName('BAKRR'));
    MeasureTool.addPoint(FixCollection.findFixByName('DBIGE'));
    MeasureTool.endPath();
    MeasureTool.reset();

    expect(MeasureTool.hasStarted).toBe(false);
    expect(MeasureTool.isMeasuring).toBe(false);
});

test('.setStyle() correctly sets the _style property', (t) => {
    MeasureTool.setStyle(MEASURE_TOOL_STYLE.STRAIGHT);
    expect(MeasureTool._style).toBe(MEASURE_TOOL_STYLE.STRAIGHT);

    MeasureTool.setStyle(MEASURE_TOOL_STYLE.ARC_TO_NEXT);
    expect(MeasureTool._style).toBe(MEASURE_TOOL_STYLE.ARC_TO_NEXT);

    MeasureTool.setStyle(MEASURE_TOOL_STYLE.ALL_ARCED);
    expect(MeasureTool._style).toBe(MEASURE_TOOL_STYLE.ALL_ARCED);

    MeasureTool.setStyle('a random value');
    expect(MeasureTool._style).toBe(MEASURE_TOOL_STYLE.STRAIGHT);
});

test('.updateLastPoint() adds a new point if there is no point to update', (t) => {
    MeasureTool.startNewPath();
    MeasureTool.addPoint(FixCollection.findFixByName('BAKRR'));
    MeasureTool.updateLastPoint(CURSOR_POSITION);

    expect(MeasureTool._currentPath._points.length).toBe(2);
});

test('.updateLastPoint() updates the last point', (t) => {
    MeasureTool.startNewPath();
    MeasureTool.addPoint(FixCollection.findFixByName('BAKRR'));
    MeasureTool.addPoint(FixCollection.findFixByName('DBIGE'));
    MeasureTool.updateLastPoint(CURSOR_POSITION);

    expect(MeasureTool._currentPath._points.length).toBe(2);
});
