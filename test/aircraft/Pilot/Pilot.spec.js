import { test, expect, vi } from 'vitest';
import sinon from 'sinon';
import _isArray from 'lodash/isArray';
import _isObject from 'lodash/isObject';
import AircraftModel from '../../../src/assets/scripts/client/aircraft/AircraftModel';
import ModeController from '../../../src/assets/scripts/client/aircraft/ModeControl/ModeController';
import Pilot from '../../../src/assets/scripts/client/aircraft/Pilot/Pilot';
import {
    ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK,
    DEPARTURE_AIRCRAFT_INIT_PROPS_MOCK
} from '../_mocks/aircraftMocks';
import {
    createFmsArrivalFixture,
    createFmsDepartureFixture,
    createModeControllerFixture
} from '../../fixtures/aircraftFixtures';
import { airportModelFixture } from '../../fixtures/airportFixtures';
import { createNavigationLibraryFixture } from '../../fixtures/navigationLibraryFixtures';
import { INVALID_NUMBER } from '../../../src/assets/scripts/client/constants/globalConstants';

// mocks
const airportElevationMock = 11;
const airportIcaoMock = 'KLAS';
const airportNameMock = 'McCarran International Airport';
const runwayNameMock = '19L';
const runwayModelMock = airportModelFixture.getRunway(runwayNameMock);
const approachTypeMock = 'ils';

const validRouteStringMock = 'DAG.KEPEC3.KLAS07R';
const complexRouteString = 'COWBY..BIKKR..DAG.KEPEC3.KLAS01L';
const amendRouteString = 'DAG..HOLDM..PRINO';
const invalidRouteString = 'A..B.C.D';
const invalidAmendRouteString = 'A..B..C';
const sidIdMock = 'COWBY6';
const waypointNameMock = 'SUNST';
const holdParametersMock = {
    inboundHeading: -1.62476729292438,
    legLength: '1min',
    turnDirection: 'right'
};

const headingMock = 3.141592653589793;
const nextHeadingDegreesMock = 180;

const speedMock = 190;
const cruiseSpeedMock = 460;
const unattainableSpeedMock = 530;

const initialAltitudeMock = 18000;
const nextAltitudeMock = 5000;
const invalidAltitudeMock = 'threeve';

// helpers
function createPilotFixture() {
    return new Pilot(createFmsArrivalFixture(), createModeControllerFixture());
}

function buildPilotWithComplexRoute() {
    const pilot = createPilotFixture();

    pilot.replaceFlightPlanWithNewRoute(complexRouteString);

    return pilot;
}

let sandbox;
/* eslint-disable no-unused-vars, no-undef */
beforeEach(() => {
    sandbox = sinon.createSandbox();
});

afterEach(() => {
    sandbox.restore();
});
/* eslint-enable no-unused-vars, no-undef */

test('throws when instantiated without parameters', () => {
    expect(() => new Pilot()).toThrow();
    expect(() => new Pilot({})).toThrow();
    expect(() => new Pilot([])).toThrow();
    expect(() => new Pilot('threeve')).toThrow();
    expect(() => new Pilot(42)).toThrow();
    expect(() => new Pilot(false)).toThrow();
    expect(() => new Pilot(null, createModeControllerFixture())).toThrow();
    expect(() => new Pilot('', createModeControllerFixture())).toThrow();
    expect(() => new Pilot({}, createModeControllerFixture())).toThrow();
    expect(() => new Pilot(createFmsArrivalFixture(), {})).toThrow();
});

test('does not throw when passed valid parameters', () => {
    expect(() => createPilotFixture()).not.toThrow();
});

test('.reset() properly resets the instance properties to their null state', () => {
    const pilotModel = createPilotFixture().reset();

    expect(pilotModel._fms === null).toBe(true);
    expect(pilotModel._mcp === null).toBe(true);
    expect(pilotModel.hasApproachClearance === false).toBe(true);
    expect(pilotModel.hasDepartureClearance === false).toBe(true);
});

test('.shouldExpediteAltitudeChange() sets #shouldExpediteAltitudeChange to true and responds with a success message', () => {
    const expectedResult = [true, 'expediting to assigned altitude'];
    const pilot = createPilotFixture();
    const result = pilot.shouldExpediteAltitudeChange();

    expect(pilot._mcp.shouldExpediteAltitudeChange).toBe(true);
    expect(result).toEqual(expectedResult);
});

test('.applyArrivalProcedure() returns an error when passed an invalid routeString', () => {
    const expectedResult = [false, 'arrival procedure format not understood'];
    const pilot = createPilotFixture();
    const result = pilot.applyArrivalProcedure('~!@#$%', airportNameMock);

    expect(result).toEqual(expectedResult);
});

test('.applyArrivalProcedure() returns an error when passed an invalid procedure name', () => {
    const invalidRouteStringMock = 'DAG.~!@#$.KLAS';
    const expectedResult = [false, 'unknown procedure "~!@#$"'];
    const pilot = createPilotFixture();
    const result = pilot.applyArrivalProcedure(invalidRouteStringMock, airportNameMock);

    expect(result).toEqual(expectedResult);
});

test('.applyArrivalProcedure() returns an error when passed a procedure with an invaild entry', () => {
    const invalidRouteStringMock = 'a.KEPEC3.KLAS';
    const expectedResult = [false, 'route of "a.KEPEC3.KLAS" is not valid'];
    const pilot = createPilotFixture();
    const result = pilot.applyArrivalProcedure(invalidRouteStringMock, airportNameMock);

    expect(result).toEqual(expectedResult);
});

test('.applyArrivalProcedure() returns a success message after success', () => {
    const pilot = createPilotFixture();
    const result = pilot.applyArrivalProcedure(validRouteStringMock, airportNameMock);

    expect(_isArray(result)).toBe(true);
    expect(result[0]).toBe(true);
    expect(result[1].log === 'cleared to McCarran International Airport via the KEPEC3 arrival').toBe(true);
    expect(result[1].say === 'cleared to McCarran International Airport via the KEPEC THREE arrival').toBe(true);
});

test('.applyArrivalProcedure() calls #_fms.replaceArrivalProcedure() with the correct parameters', () => {
    const pilot = createPilotFixture();
    const replaceArrivalProcedureSpy = sinon.spy(pilot._fms, 'replaceArrivalProcedure');

    pilot.applyArrivalProcedure(validRouteStringMock, airportNameMock);

    expect(replaceArrivalProcedureSpy.calledWithExactly(validRouteStringMock)).toBe(true);
});

test('.applyDepartureProcedure() returns an error when passed an invalid sidId', () => {
    const procedureName = '~!@#$%';
    const expectedResult = [false, 'unknown procedure "~!@#$%"'];
    const pilot = new Pilot(createFmsDepartureFixture(), createModeControllerFixture(), createNavigationLibraryFixture());
    const result = pilot.applyDepartureProcedure(procedureName, airportIcaoMock);

    expect(result).toEqual(expectedResult);
    expect(pilot.hasDepartureClearance).toBe(false);
});

test('.applyDepartureProcedure() returns an error when passed an invalid runway', () => {
    const routeString = 'EDDF30R.COWBY6.GUP';
    const expectedResult = [false, 'requested route of "EDDF30R.COWBY6.GUP" is invalid'];
    const pilot = new Pilot(createFmsDepartureFixture(), createModeControllerFixture(), createNavigationLibraryFixture());
    const result = pilot.applyDepartureProcedure(routeString, airportIcaoMock);

    expect(result).toEqual(expectedResult);
    expect(pilot.hasDepartureClearance).toBe(false);
});

test('.applyDepartureProcedure() should NOT change mcp modes', () => {
    const pilot = new Pilot(createFmsDepartureFixture(), createModeControllerFixture(), createNavigationLibraryFixture());
    const mcp = pilot._mcp;
    const expectedAltitudeMode = mcp.altitudeMode;
    const expectedSpeedMode = mcp.speedMode;

    pilot.applyDepartureProcedure(sidIdMock, airportIcaoMock);

    // workaround: expect(pilot._mcp..altitudeMode).toBe(true) causes out of memory crash
    expect(mcp.altitudeMode === expectedAltitudeMode).toBe(true);
    expect(mcp.speedMode === expectedSpeedMode).toBe(true);
});

test('.applyDepartureProcedure() returns a success message after success', () => {
    const pilot = new Pilot(createFmsDepartureFixture(), createModeControllerFixture(), createNavigationLibraryFixture());
    const result = pilot.applyDepartureProcedure(sidIdMock, airportIcaoMock);

    expect(_isArray(result)).toBe(true);
    expect(result[0]).toBe(true);
    expect(result[1].log === 'cleared to destination via the COWBY6 departure, then as filed').toBe(true);
    expect(result[1].say === 'cleared to destination via the COWBOY SIX departure, then as filed').toBe(true);
});

test('.replaceFlightPlanWithNewRoute() returns an error when passed an invalid route', () => {
    const expectedResult = [
        false,
        {
            log: 'requested route of "a..b.c.d" is invalid',
            say: 'that route is invalid'
        }
    ];
    const pilot = createPilotFixture();
    const result = pilot.replaceFlightPlanWithNewRoute('a..b.c.d');

    expect(result).toEqual(expectedResult);
});

test('.replaceFlightPlanWithNewRoute() removes an existing route and replaces it with a new one', () => {
    const pilot = createPilotFixture();

    pilot.replaceFlightPlanWithNewRoute('COWBY..BIKKR');

    expect(pilot._fms.currentWaypoint.name === 'COWBY').toBe(true);
});

test.todo('.replaceFlightPlanWithNewRoute() replaces old route with new one, and skips ahead to the old current waypoint');

test('.replaceFlightPlanWithNewRoute() returns a success message when finished successfully', () => {
    const expectedResult = [
        true,
        {
            log: 'rerouting to: COWBY BIKKR',
            say: 'rerouting as requested'
        }
    ];
    const pilot = createPilotFixture();
    const result = pilot.replaceFlightPlanWithNewRoute('COWBY..BIKKR');

    expect(result).toEqual(expectedResult);
});

test('.applyPartialRouteAmendment() returns an error with passed an invalid routeString', () => {
    const expectedResult = [false, 'requested route of "A..B.C.D" is invalid'];
    const pilot = buildPilotWithComplexRoute();
    const result = pilot.applyPartialRouteAmendment(invalidRouteString);

    expect(result).toEqual(expectedResult);
});

test('.applyPartialRouteAmendment() returns an error with passed a routeString without a shared waypoint', () => {
    const expectedResult = [false, 'routes do not have continuity!'];
    const pilot = buildPilotWithComplexRoute();
    const result = pilot.applyPartialRouteAmendment('HITME..HOLDM');

    expect(result).toEqual(expectedResult);
});

test('.applyPartialRouteAmendment() returns a success message when complete', () => {
    const expectedResult = [
        true,
        {
            log: 'rerouting to: DAG HOLDM PRINO',
            say: 'rerouting as requested'
        }
    ];
    const pilot = buildPilotWithComplexRoute();
    const result = pilot.applyPartialRouteAmendment(amendRouteString);

    expect(result).toEqual(expectedResult);
});

test('.applyPartialRouteAmendment() calls #_fms.applyPartialRouteAmendment()', () => {
    const pilot = buildPilotWithComplexRoute();
    const fmsApplyPartialRouteAmendmentSpy = sinon.spy(pilot._fms, 'applyPartialRouteAmendment');
    const expectedResult = [
        true,
        {
            log: 'rerouting to: DAG HOLDM PRINO',
            say: 'rerouting as requested'
        }
    ];
    const result = pilot.applyPartialRouteAmendment(amendRouteString);

    expect(fmsApplyPartialRouteAmendmentSpy.calledWithExactly(amendRouteString)).toBe(true);
    expect(result).toEqual(expectedResult);
});

test('.applyPartialRouteAmendment() does not grant departure clearance when the route amendment fails', () => {
    const pilot = buildPilotWithComplexRoute();

    pilot.hasDepartureClearance = false;
    expect(pilot.hasDepartureClearance).toBe(false);

    const expectedResult = [false, `requested route of "${invalidAmendRouteString}" is invalid`];
    const result = pilot.applyPartialRouteAmendment(invalidAmendRouteString);

    expect(result).toEqual(expectedResult);
    expect(pilot.hasDepartureClearance).toBe(false);
});

test('.applyPartialRouteAmendment() grants departure clearance when the route amendment succeeds', () => {
    const pilot = buildPilotWithComplexRoute();

    pilot.hasDepartureClearance = false;
    expect(pilot.hasDepartureClearance).toBe(false);

    const expectedResult = [true,
        {
            log: 'rerouting to: DAG HOLDM PRINO',
            say: 'rerouting as requested'
        }
    ];
    const result = pilot.applyPartialRouteAmendment(amendRouteString);

    expect(result).toEqual(expectedResult);

    // workaround: expect(pilot.hasDepartureClearance).toBe(true) causes out of memory crash
    const departureClearance = pilot.hasDepartureClearance;
    expect(departureClearance).toBe(true);
});

test('.applyPartialRouteAmendment() calls .cancelHoldingPattern()', () => {
    const pilot = buildPilotWithComplexRoute();
    const cancelHoldingPatternSpy = sinon.spy(pilot, 'cancelHoldingPattern');

    pilot.initiateHoldingPattern('MISEN', holdParametersMock);
    pilot.applyPartialRouteAmendment(amendRouteString);

    expect(cancelHoldingPatternSpy.calledWithExactly()).toBe(true);
});

test('.cancelApproachClearance() returns early if #hasApproachClearance is false', () => {
    const aircraftModel = new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK, createNavigationLibraryFixture());
    const result = aircraftModel.pilot.cancelApproachClearance(aircraftModel);
    const expectedResult = [false, 'we have no approach clearance to cancel!'];

    expect(result).toEqual(expectedResult);
});

test('.cancelApproachClearance() sets the correct modes and values in the Mcp', () => {
    const nextAltitudeMock = 4000;
    const nextHeadingDegreesMock = 250;
    const shouldExpediteDescentMock = false;
    const shouldUseSoftCeilingMock = false;
    const aircraftModel = new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK, createNavigationLibraryFixture());

    aircraftModel.pilot.maintainAltitude(
        nextAltitudeMock,
        shouldExpediteDescentMock,
        shouldUseSoftCeilingMock,
        airportModelFixture,
        aircraftModel
    );
    aircraftModel.pilot.maintainHeading(aircraftModel, nextHeadingDegreesMock, null, false);
    aircraftModel.pilot.maintainSpeed(speedMock, aircraftModel);
    aircraftModel.pilot.conductInstrumentApproach(aircraftModel, approachTypeMock, runwayModelMock);
    aircraftModel.pilot.cancelApproachClearance(aircraftModel);

    expect(aircraftModel.pilot._mcp.altitudeMode === 'HOLD').toBe(true);
    expect(aircraftModel.pilot._mcp.altitude === nextAltitudeMock).toBe(true);
    expect(aircraftModel.pilot._mcp.headingMode === 'HOLD').toBe(true);
    expect(aircraftModel.pilot._mcp.heading === aircraftModel.heading).toBe(true);
    expect(aircraftModel.pilot._mcp.speedMode === 'HOLD').toBe(true);
    expect(aircraftModel.pilot._mcp.speed === speedMock).toBe(true);
});

test('.cancelApproachClearance() returns a success message when finished', () => {
    const aircraftModel = new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK, createNavigationLibraryFixture());
    const expectedResult = [
        true,
        'cancel approach clearance, fly present heading, maintain last assigned altitude and speed'
    ];

    aircraftModel.pilot.conductInstrumentApproach(aircraftModel, approachTypeMock, runwayModelMock);

    const result = aircraftModel.pilot.cancelApproachClearance(aircraftModel);

    expect(result).toEqual(expectedResult);
});

test('.cancelApproachClearance() sets #hasApproachClearance to false', () => {
    const aircraftModel = new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK, createNavigationLibraryFixture());

    aircraftModel.pilot.hasApproachClearance = true;

    aircraftModel.pilot.cancelApproachClearance(aircraftModel);

    expect(aircraftModel.pilot.hasApproachClearance).toBe(false);
});

test('.cancelHoldingPattern() returns error response when the aircraft does not have any hold waypoints', () => {
    const pilot = createPilotFixture();
    const expectedResult = [false, 'that must be for somebody else, we weren\'t given any holding instructions'];
    const result = pilot.cancelHoldingPattern();

    expect(result).toEqual(expectedResult);
});

test('.cancelHoldingPattern() returns error response when the aircraft has holding, but the specified fix is not on the route', () => {
    const pilot = createPilotFixture();

    pilot.initiateHoldingPattern('KEPEC', holdParametersMock);

    const expectedResult = [false, {
        log: 'that must be for somebody else, we weren\'t given holding over ABCDE',
        say: 'that must be for somebody else, we weren\'t given holding over abcde'
    }];
    const result = pilot.cancelHoldingPattern('ABCDE');

    expect(result).toEqual(expectedResult);
});

test('.cancelHoldingPattern() returns error response when the aircraft has holding, but not at the specified fix', () => {
    const pilot = createPilotFixture();

    pilot.initiateHoldingPattern('KEPEC', holdParametersMock);

    const expectedResult = [false, {
        log: 'that must be for somebody else, we weren\'t given holding over SUNST',
        say: 'that must be for somebody else, we weren\'t given holding over sunst'
    }];
    const result = pilot.cancelHoldingPattern('SUNST');

    expect(result).toEqual(expectedResult);
});

test('.cancelHoldingPattern() calls WaypointModel.deactivateHold() when no hold fix is specified', () => {
    const pilot = createPilotFixture();
    const currentWaypointModel = pilot._fms.currentWaypoint;
    const holdWaypointName = 'KEPEC';
    const holdWaypointModel = pilot._fms.findWaypoint(holdWaypointName);
    const currentWaypointDeactivateHoldStub = sinon.stub(currentWaypointModel, 'deactivateHold');
    const holdWaypointDeactivateHoldStub = sinon.stub(holdWaypointModel, 'deactivateHold');

    pilot.initiateHoldingPattern('KEPEC', holdParametersMock);

    const expectedResult = [true, {
        log: 'roger, we\'ll cancel the hold at KEPEC',
        say: 'roger, we\'ll cancel the hold at kepec'
    }];
    const result = pilot.cancelHoldingPattern();

    expect(result).toEqual(expectedResult);
    expect(currentWaypointDeactivateHoldStub.notCalled).toBe(true);
    expect(holdWaypointDeactivateHoldStub.calledWithExactly()).toBe(true);
});

test('.cancelHoldingPattern() calls WaypointModel.deactivateHold() when the fix is specified by the user', () => {
    const pilot = createPilotFixture();
    const currentWaypointModel = pilot._fms.currentWaypoint;
    const holdWaypointName = 'KEPEC';
    const holdWaypointModel = pilot._fms.findWaypoint(holdWaypointName);
    const currentWaypointDeactivateHoldStub = sinon.stub(currentWaypointModel, 'deactivateHold');
    const holdWaypointDeactivateHoldStub = sinon.stub(holdWaypointModel, 'deactivateHold');

    pilot.initiateHoldingPattern('KEPEC', holdParametersMock);

    const expectedResult = [true, {
        log: 'roger, we\'ll cancel the hold at KEPEC',
        say: 'roger, we\'ll cancel the hold at kepec'
    }];
    const result = pilot.cancelHoldingPattern('KEPEC');

    expect(result).toEqual(expectedResult);
    expect(currentWaypointDeactivateHoldStub.notCalled).toBe(true);
    expect(holdWaypointDeactivateHoldStub.calledWithExactly()).toBe(true);
});

test('.clearedAsFiled() grants pilot departure clearance and returns the correct response strings', () => {
    const aircraftModel = new AircraftModel(DEPARTURE_AIRCRAFT_INIT_PROPS_MOCK, createNavigationLibraryFixture());
    const result = aircraftModel.pilot.clearedAsFiled();

    expect(_isArray(result)).toBe(true);
    expect(result[0] === true).toBe(true);
    expect(_isObject(result[1])).toBe(true);
    expect(result[1].log === 'cleared to destination as filed').toBe(true);
    expect(result[1].say === 'cleared to destination as filed').toBe(true);
    expect(aircraftModel.pilot.hasDepartureClearance === true).toBe(true);
});

test('.climbViaSID() returns error response if #flightPlanAltitude has not been set', () => {
    const expectedResult = [false, 'unable, no altitude assigned'];
    const aircraftModel = new AircraftModel(DEPARTURE_AIRCRAFT_INIT_PROPS_MOCK);
    aircraftModel.altitude = 0;
    const pilot = new Pilot(createFmsDepartureFixture(), createModeControllerFixture(), createNavigationLibraryFixture());
    const previousFlightPlanAltitude = pilot._fms.flightPlanAltitude;
    pilot._fms.flightPlanAltitude = INVALID_NUMBER;

    const result = pilot.climbViaSid(aircraftModel);

    expect(result).toEqual(expectedResult);

    pilot._fms.flightPlanAltitude = previousFlightPlanAltitude;
});

test('.climbViaSID() returns early when the aircraft is already above the top altitude', () => {
    const aircraftModel = new AircraftModel(DEPARTURE_AIRCRAFT_INIT_PROPS_MOCK);
    aircraftModel.altitude = 13000;
    const topAltitude = 5000;
    const pilot = createPilotFixture();
    pilot._fms.departureAirportModel = airportModelFixture;
    const expectedResponse = [
        false,
        {
            log: 'unable, we\'re already at 13000',
            say: 'unable, we\'re already at one three thousand'
        }
    ];

    const response = pilot.climbViaSid(aircraftModel, topAltitude);

    expect(response).toEqual(expectedResponse);
});

test('.climbViaSID() correctly configures MCP and returns correct response when no altitude is given', () => {
    const aircraftModel = new AircraftModel(DEPARTURE_AIRCRAFT_INIT_PROPS_MOCK);
    aircraftModel.altitude = 0;
    const pilot = new Pilot(createFmsDepartureFixture(), createModeControllerFixture(), createNavigationLibraryFixture());
    pilot._fms.departureAirportModel = airportModelFixture;
    pilot._fms.flightPlanAltitude = 41000;
    const expectedResponse = [
        true,
        {
            log: 'climb via SID and maintain 19000',
            say: 'climb via SID and maintain flight level one niner zero'
        }
    ];

    const response = pilot.climbViaSid(aircraftModel);

    expect(response).toEqual(expectedResponse);
    expect(pilot._mcp.altitudeMode === 'VNAV').toBe(true);
    expect(pilot._mcp.speedMode === 'VNAV').toBe(true);
    expect(pilot._mcp.altitude === pilot._fms.departureAirportModel.maxAssignableAltitude).toBe(true);
});

test('.climbViaSID() correctly configures MCP and returns correct response when an altitude is given', () => {
    const aircraftModel = new AircraftModel(DEPARTURE_AIRCRAFT_INIT_PROPS_MOCK);
    aircraftModel.altitude = 0;
    const pilot = new Pilot(createFmsDepartureFixture(), createModeControllerFixture(), createNavigationLibraryFixture());
    pilot._fms.departureAirportModel = airportModelFixture;
    pilot._fms.flightPlanAltitude = 41000;
    const expectedResponse = [
        true,
        {
            log: 'climb via SID and maintain 11000',
            say: 'climb via SID and maintain one one thousand'
        }
    ];

    const response = pilot.climbViaSid(aircraftModel, 11000);

    expect(response).toEqual(expectedResponse);
    expect(pilot._mcp.altitudeMode === 'VNAV').toBe(true);
    expect(pilot._mcp.speedMode === 'VNAV').toBe(true);
    expect(pilot._mcp.altitude === 11000).toBe(true);
});

test('.conductInstrumentApproach() returns failure message when no runway is provided', () => {
    const aircraftModel = new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK, createNavigationLibraryFixture());
    const expectedResult = [false, 'the specified runway does not exist'];
    const result = aircraftModel.pilot.conductInstrumentApproach(aircraftModel, approachTypeMock, null);

    expect(result).toEqual(expectedResult);
});

test('.conductInstrumentApproach() returns failure message when assigned altitude is lower than minimum glideslope intercept altitude', () => {
    const expectedResult = [false, {
        log: 'unable ILS 19L, our assigned altitude is below the minimum glideslope ' +
            'intercept altitude, request climb to 3700',
        say: 'unable ILS one niner left, our assigned altitude is below the minimum ' +
            'glideslope intercept altitude, request climb to three thousand seven hundred'
    }];
    const aircraftModel = new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK, createNavigationLibraryFixture());

    aircraftModel.mcp.setAltitudeFieldValue(1);

    const result = aircraftModel.pilot.conductInstrumentApproach(aircraftModel, approachTypeMock, runwayModelMock);

    expect(result).toEqual(expectedResult);
});

test('.conductInstrumentApproach() calls .setArrivalRunway() with the runwayName', () => {
    const aircraftModel = new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK, createNavigationLibraryFixture());
    const setArrivalRunwaySpy = sinon.spy(aircraftModel.pilot._fms, 'setArrivalRunway');

    aircraftModel.pilot.conductInstrumentApproach(aircraftModel, approachTypeMock, runwayModelMock);

    expect(setArrivalRunwaySpy.calledWithExactly(runwayModelMock)).toBe(true);
});

test('.conductInstrumentApproach() calls ._interceptCourse() with the correct properties', () => {
    const aircraftModel = new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK, createNavigationLibraryFixture());
    const _interceptCourseSpy = sinon.spy(aircraftModel.pilot, '_interceptCourse');

    aircraftModel.pilot.conductInstrumentApproach(aircraftModel, approachTypeMock, runwayModelMock);

    expect(_interceptCourseSpy.calledWithExactly(runwayModelMock.positionModel, runwayModelMock.angle)).toBe(true);
});

test('.conductInstrumentApproach() calls ._interceptGlidepath() with the correct properties', () => {
    const aircraftModel = new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK, createNavigationLibraryFixture());
    const _interceptGlidepathSpy = sinon.spy(aircraftModel.pilot, '_interceptGlidepath');

    aircraftModel.pilot.conductInstrumentApproach(aircraftModel, approachTypeMock, runwayModelMock);

    expect(_interceptGlidepathSpy.calledWithExactly(
        runwayModelMock.positionModel,
        runwayModelMock.angle,
        runwayModelMock.ils.glideslopeGradient
    )).toBe(true);
});

test('.conductInstrumentApproach() calls .cancelHoldingPattern', () => {
    const aircraftModel = new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK, createNavigationLibraryFixture());
    const cancelHoldingPatternSpy = sinon.spy(aircraftModel.pilot, 'cancelHoldingPattern');

    aircraftModel.pilot._fms.setFlightPhase('HOLD');
    aircraftModel.pilot.conductInstrumentApproach(aircraftModel, approachTypeMock, runwayModelMock);

    expect(cancelHoldingPatternSpy.calledWithExactly()).toBe(true);
});

test('.conductInstrumentApproach() sets #hasApproachClearance to true', () => {
    const aircraftModel = new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK, createNavigationLibraryFixture());
    aircraftModel.pilot.conductInstrumentApproach(aircraftModel, approachTypeMock, runwayModelMock);

    expect(aircraftModel.pilot.hasApproachClearance).toBe(true);
});

test('.conductInstrumentApproach() returns a success message', () => {
    const aircraftModel = new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK, createNavigationLibraryFixture());
    const expectedResult = [
        true,
        {
            log: 'cleared ILS runway 19L approach',
            say: 'cleared ILS runway one niner left approach'
        }
    ];
    const result = aircraftModel.pilot.conductInstrumentApproach(aircraftModel, approachTypeMock, runwayModelMock);

    expect(result).toEqual(expectedResult);
});

test('.crossFix() returns early when the specified fix does not exist', () => {
    const aircraftModel = new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK);
    const invalidFixNameMock = 'threeve';
    const altitudeMock = 13000;
    const expectedResult = [false, {
        log: 'unable to find \'THREEVE\'',
        say: 'unable to find threeve'
    }];
    const result = aircraftModel.pilot.crossFix(aircraftModel, invalidFixNameMock, altitudeMock);

    expect(result).toEqual(expectedResult);
});

test('.crossFix() returns early when the specified fix exists but is not on the aircraft\'s route', () => {
    const aircraftModel = new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK);
    const nonRouteFixNameMock = 'ogkij';
    const altitudeMock = 13000;
    const expectedResult = [false, {
        log: 'unable, \'OGKIJ\' is not on our route',
        say: 'unable, ogkij is not on our route'
    }];
    const result = aircraftModel.pilot.crossFix(aircraftModel, nonRouteFixNameMock, altitudeMock);

    expect(result).toEqual(expectedResult);
});

test('.crossFix() returns early when the specified altitude fails .validateNextAltitude()', () => {
    const aircraftModel = new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK);
    const fixNameMock = 'kepec';
    const altitudeMock = 13000;
    const expectedResult = [false, 'some reply from validate-next-altitude'];

    sinon.stub(aircraftModel, 'validateNextAltitude').returns(expectedResult);

    const result = aircraftModel.pilot.crossFix(aircraftModel, fixNameMock, altitudeMock);

    expect(result).toEqual(expectedResult);
});

test('.crossFix() correctly configures arrival aircraft\'s MCP and returns correct response when provided valid parameters', () => {
    const aircraftModel = new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK);
    const fixNameMock = 'kepec';
    const altitudeMock = 13000;
    const expectedResult = [true, {
        log: 'cross KEPEC at 13000',
        say: 'cross kepec at one three thousand'
    }];
    const result = aircraftModel.pilot.crossFix(aircraftModel, fixNameMock, altitudeMock);

    expect(result).toEqual(expectedResult);
});

test('.crossFix() correctly configures departure aircraft\'s MCP and returns correct response when provided valid parameters', () => {
    const aircraftModel = new AircraftModel(DEPARTURE_AIRCRAFT_INIT_PROPS_MOCK);
    const fixNameMock = 'cowby';
    const altitudeMock = 13000;
    const expectedResult = [true, {
        log: 'cross COWBY at 13000',
        say: 'cross cowby at one three thousand'
    }];
    const result = aircraftModel.pilot.crossFix(aircraftModel, fixNameMock, altitudeMock);

    expect(result).toEqual(expectedResult);
});

test('.descendViaStar() returns early when provided bottom altitude parameter is invalid', () => {
    const aircraftModel = new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK);
    const pilot = createPilotFixture();

    pilot._mcp.setAltitudeFieldValue(initialAltitudeMock);
    pilot._mcp.setAltitudeHold();

    const expectedResponse = [false, 'unable to maintain an altitude of threeve'];
    const response = pilot.descendViaStar(aircraftModel, invalidAltitudeMock);

    expect(response).toEqual(expectedResponse);
    expect(pilot._mcp.altitude === initialAltitudeMock).toBe(true);
});

test('.descendViaStar() returns early when no bottom altitude param provided and FMS has no bottom altitude', () => {
    const aircraftModel = new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK);
    const pilot = createPilotFixture();
    const failureResponseMock = [false, 'unable, no altitude assigned'];

    pilot._mcp.setAltitudeFieldValue(initialAltitudeMock);
    pilot._mcp.setAltitudeHold();

    // replace route with one that will have NO altitude restrictions whatsoever
    pilot.replaceFlightPlanWithNewRoute('DAG..MISEN..CLARR..SKEBR..KEPEC..IPUMY..NIPZO..SUNST');

    const response = pilot.descendViaStar(aircraftModel);

    expect(response).toEqual(failureResponseMock);
    expect(pilot._mcp.altitude === initialAltitudeMock).toBe(true);
});

test('.descendViaStar() returns early when no bottom altitude param provided and FMS bottom altitude is invalid', () => {
    const aircraftModel = new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK);
    const pilot = createPilotFixture();
    const failureResponseMock = [false, 'unable, no altitude assigned'];

    pilot._mcp.setAltitudeFieldValue(initialAltitudeMock);
    pilot._mcp.setAltitudeHold();

    // replace route with one that will have NO altitude restrictions whatsoever
    pilot.replaceFlightPlanWithNewRoute('DAG..MISEN..CLARR..SKEBR..KEPEC..IPUMY..NIPZO..SUNST');

    pilot._fms.waypoints[2].altitudeMaximum = invalidAltitudeMock;

    const response = pilot.descendViaStar(aircraftModel);

    expect(response).toEqual(failureResponseMock);
    expect(pilot._mcp.altitude === initialAltitudeMock).toBe(true);
});

test('.descendViaStar() returns early when the bottom altitude is above the aircraft\'s current altitude', () => {
    const aircraftModel = new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK);
    const pilot = createPilotFixture();
    aircraftModel.altitude = 5000;
    const expectedResponse = [
        false,
        {
            log: 'unable, we\'re already at 5000',
            say: 'unable, we\'re already at five thousand'
        }
    ];

    const response = pilot.descendViaStar(aircraftModel, 17000);
    expect(response).toEqual(expectedResponse);
});

test('.descendViaStar() correctly configures MCP when no bottom altitude parameter provided but FMS has valid bottom altitude', () => {
    const aircraftModel = new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK);
    const pilot = createPilotFixture();
    const expectedResponse = [
        true,
        {
            log: 'descend via STAR and maintain 8000',
            say: 'descend via STAR and maintain eight thousand'
        }
    ];

    pilot._mcp.setAltitudeFieldValue(initialAltitudeMock);
    pilot._mcp.setAltitudeHold();

    const response = pilot.descendViaStar(aircraftModel);

    expect(response).toEqual(expectedResponse);
    expect(pilot._mcp.altitudeMode === 'VNAV').toBe(true);
    expect(pilot._mcp.speedMode === 'VNAV').toBe(true);
    expect(pilot._mcp.altitude === 8000).toBe(true);
});

test('.descendViaStar() correctly configures MCP when provided valid bottom altitude parameter', () => {
    const aircraftModel = new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK);
    const pilot = createPilotFixture();
    const expectedResponse = [
        true,
        {
            log: 'descend via STAR and maintain 5000',
            say: 'descend via STAR and maintain five thousand'
        }
    ];

    pilot._mcp.setAltitudeFieldValue(initialAltitudeMock);
    pilot._mcp.setAltitudeHold();

    const response = pilot.descendViaStar(aircraftModel, nextAltitudeMock);

    expect(response).toEqual(expectedResponse);
    expect(pilot._mcp.altitudeMode === 'VNAV').toBe(true);
    expect(pilot._mcp.altitude === nextAltitudeMock).toBe(true);
});

test('.goAround() sets the correct Mcp modes and values', () => {
    const pilot = createPilotFixture();

    pilot.goAround(headingMock, speedMock, airportElevationMock);

    expect(pilot._mcp.altitudeMode === 'HOLD').toBe(true);
    expect(pilot._mcp.altitude === 1100).toBe(true);
    expect(pilot._mcp.headingMode === 'HOLD').toBe(true);
    expect(pilot._mcp.heading === headingMock).toBe(true);
    expect(pilot._mcp.speedMode === 'HOLD').toBe(true);
    expect(pilot._mcp.speed === 190).toBe(true);
});

test('.goAround() returns a success message', () => {
    const expectedResult = [
        true,
        {
            log: 'go around, fly present heading, maintain 1100',
            say: 'go around, fly present heading, maintain one thousand one hundred'
        }
    ];
    const pilot = createPilotFixture();
    const result = pilot.goAround(headingMock, speedMock, airportElevationMock);

    expect(result).toEqual(expectedResult);
});

test('.initiateHoldingPattern() returns error response when specified fix is not in the route', () => {
    const pilot = createPilotFixture();
    const expectedResult = [false, {
        log: 'unable to hold at COWBY; it is not on our route!',
        say: 'unable to hold at cowby; it is not on our route!'
    }];
    const result = pilot.initiateHoldingPattern('COWBY', holdParametersMock);

    expect(result).toEqual(expectedResult);
});

test('.initiateHoldingPattern() returns correct readback when hold implemented successfully', () => {
    const pilot = createPilotFixture();
    const expectedResult = [true, {
        log: 'hold east of KEPEC on the 087 radial, right turns, 1min legs',
        say: 'hold east of kepec on the zero eight seven radial, right turns, 1min legs'
    }];
    const result = pilot.initiateHoldingPattern('KEPEC', holdParametersMock);

    expect(result).toEqual(expectedResult);
});

test('.maintainAltitude() returns early responding that they are unable to maintain the requested altitude', () => {
    const aircraftModel = new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK);
    const nextAltitudeMock = 90000;
    const shouldExpediteMock = false;
    const shouldUseSoftCeilingMock = true;
    const { mcp } = aircraftModel;
    const expectedAltitude = mcp.altitude;
    const expectedResult = [
        false,
        {
            log: 'unable to maintain 90000 due to performance',
            say: 'unable to maintain flight level niner zero zero due to performance'
        }
    ];

    const result = aircraftModel.pilot.maintainAltitude(
        nextAltitudeMock,
        shouldExpediteMock,
        shouldUseSoftCeilingMock,
        airportModelFixture,
        aircraftModel
    );

    expect(mcp.altitudeMode === 'VNAV').toBe(true);
    expect(mcp.altitude === expectedAltitude).toBe(true);
    expect(result).toEqual(expectedResult);
});

test('.maintainAltitude() adds 1 additional foot to assigned altitude when assigned top altitude and "shouldUseSoftCeiling" is true', () => {
    const aircraftModel = new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK);
    const nextAltitudeMock = 19000;
    const shouldExpediteMock = false;
    const shouldUseSoftCeilingMock = true;

    aircraftModel.pilot.maintainAltitude(
        nextAltitudeMock,
        shouldExpediteMock,
        shouldUseSoftCeilingMock,
        airportModelFixture,
        aircraftModel
    );

    expect(aircraftModel.mcp.altitudeMode === 'HOLD').toBe(true);
    expect(aircraftModel.mcp.altitude === 19001).toBe(true);
});

test('.maintainAltitude() sets mcp.altitudeMode to `HOLD` and set mcp.altitude to the correct value', () => {
    const aircraftModel = new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK);
    const nextAltitudeMock = 13000;
    const shouldExpediteMock = false;
    const shouldUseSoftCeilingMock = false;

    aircraftModel.pilot.maintainAltitude(
        nextAltitudeMock,
        shouldExpediteMock,
        shouldUseSoftCeilingMock,
        airportModelFixture,
        aircraftModel
    );

    expect(aircraftModel.mcp.altitudeMode === 'HOLD').toBe(true);
    expect(aircraftModel.mcp.altitude === 13000).toBe(true);
});

test('.maintainAltitude() calls .shouldExpediteAltitudeChange() when shouldExpedite is true', () => {
    const aircraftModel = new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK);
    const nextAltitudeMock = 13000;
    const shouldExpediteMock = true;
    const shouldUseSoftCeilingMock = false;
    const shouldExpediteAltitudeChangeSpy = sinon.spy(aircraftModel.pilot, 'shouldExpediteAltitudeChange');

    aircraftModel.pilot.maintainAltitude(
        nextAltitudeMock,
        shouldExpediteMock,
        shouldUseSoftCeilingMock,
        airportModelFixture,
        aircraftModel
    );

    expect(shouldExpediteAltitudeChangeSpy.calledOnce).toBe(true);
});

test('.maintainAltitude() returns the correct response strings when shouldExpedite is false', () => {
    const aircraftModel = new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK);
    const nextAltitudeMock = 13000;
    const shouldExpediteMock = false;
    const shouldUseSoftCeilingMock = false;

    const result = aircraftModel.pilot.maintainAltitude(
        nextAltitudeMock,
        shouldExpediteMock,
        shouldUseSoftCeilingMock,
        airportModelFixture,
        aircraftModel
    );

    expect(_isArray(result)).toBe(true);
    expect(result[0] === true).toBe(true);
    expect(_isObject(result[1])).toBe(true);
    expect(result[1].log === 'descend and maintain 13000').toBe(true);
    expect(result[1].say === 'descend and maintain one three thousand').toBe(true);
});

test('.maintainAltitude() returns the correct response strings when shouldExpedite is true', () => {
    const aircraftModel = new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK);
    const nextAltitudeMock = 19000;
    const shouldExpediteMock = true;
    const shouldUseSoftCeilingMock = false;

    const result = aircraftModel.pilot.maintainAltitude(
        nextAltitudeMock,
        shouldExpediteMock,
        shouldUseSoftCeilingMock,
        airportModelFixture,
        aircraftModel
    );

    expect(result[1].log === 'descend and maintain 19000 and expedite').toBe(true);
    expect(result[1].say === 'descend and maintain flight level one niner zero and expedite').toBe(true);
});

test('.maintainAltitude() calls .cancelApproachClearance()', () => {
    const aircraftModel = new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK);
    const approachTypeMock = 'ils';
    const runwayModelMock = airportModelFixture.getRunway('19L');
    const nextAltitudeMock = 13000;
    const shouldExpediteMock = false;
    const shouldUseSoftCeilingMock = false;
    const cancelApproachClearanceSpy = sinon.spy(aircraftModel.pilot, 'cancelApproachClearance');

    aircraftModel.pilot.conductInstrumentApproach(aircraftModel, approachTypeMock, runwayModelMock);

    expect(aircraftModel.pilot.hasApproachClearance).toBe(true);

    aircraftModel.pilot.maintainAltitude(
        nextAltitudeMock,
        shouldExpediteMock,
        shouldUseSoftCeilingMock,
        airportModelFixture,
        aircraftModel
    );

    expect(cancelApproachClearanceSpy.called).toBe(true);
});

test('.maintainHeading() sets the #mcp with the correct modes and values', () => {
    const aircraftModel = new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK);

    aircraftModel.pilot.maintainHeading(aircraftModel, nextHeadingDegreesMock, null, false);

    expect(aircraftModel.pilot._mcp.headingMode === 'HOLD').toBe(true);
    expect(aircraftModel.pilot._mcp.heading === 3.141592653589793).toBe(true);
});

test('.maintainHeading() calls .cancelHoldingPattern()', () => {
    const aircraftModel = new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK);
    const cancelHoldingPatternSpy = sinon.spy(aircraftModel.pilot, 'cancelHoldingPattern');

    aircraftModel.pilot._fms.setFlightPhase('HOLD');
    aircraftModel.pilot.maintainHeading(aircraftModel, nextHeadingDegreesMock, null, false);

    expect(cancelHoldingPatternSpy.calledWithExactly()).toBe(true);
});

test('.maintainHeading() returns a success message when incremental is true and direction is left', () => {
    const directionMock = 'left';
    const expectedResult = [
        true,
        {
            log: 'turn 42 degrees left',
            say: 'turn 42 degrees left'
        }
    ];
    const aircraftModel = new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK);
    const result = aircraftModel.pilot.maintainHeading(aircraftModel, 42, directionMock, true);

    expect(result).toEqual(expectedResult);
});

test('.maintainHeading() returns a success message when incremental is true, direction is right, and a 2-digit numeral is used for the increment', () => {
    const directionMock = 'right';
    const expectedResult = [
        true,
        {
            log: 'turn 42 degrees right',
            say: 'turn 42 degrees right'
        }
    ];
    const aircraftModel = new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK);
    const result = aircraftModel.pilot.maintainHeading(aircraftModel, 42, directionMock, true);

    expect(result).toEqual(expectedResult);
});

test('.maintainHeading() returns a success message when incremental is true and direction is right, and a 1-digit numeral is used for the increment', () => {
    const directionMock = 'right';
    const expectedResult = [
        true,
        {
            log: 'turn 5 degrees right',
            say: 'turn 5 degrees right'
        }
    ];
    const aircraftModel = new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK);
    const result = aircraftModel.pilot.maintainHeading(aircraftModel, 5, directionMock, true);

    expect(result).toEqual(expectedResult);
});

test('.maintainHeading() returns a success message when incremental is false and direction is provided', () => {
    const directionMock = 'right';
    const isIncremental = false;
    const expectedResult = [
        true,
        {
            log: 'turn right heading 042',
            say: 'turn right heading zero four two'
        }
    ];
    const aircraftModel = new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK);
    const result = aircraftModel.pilot.maintainHeading(aircraftModel, 42, directionMock, isIncremental);

    expect(result).toEqual(expectedResult);
});

test('.maintainHeading() returns a success message when incremental is false and no direction is provided', () => {
    const directionMock = '';
    const isIncremental = false;
    const expectedResult = [
        true,
        {
            log: 'fly heading 042',
            say: 'fly heading zero four two'
        }
    ];
    const aircraftModel = new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK);
    const result = aircraftModel.pilot.maintainHeading(aircraftModel, 42, directionMock, isIncremental);

    expect(result).toEqual(expectedResult);
});

test('.maintainHeading() calls .cancelApproachClearance()', () => {
    const approachTypeMock = 'ils';
    const runwayModelMock = airportModelFixture.getRunway('19L');
    const aircraftModel = new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK);
    const cancelApproachClearanceSpy = sinon.spy(aircraftModel.pilot, 'cancelApproachClearance');

    aircraftModel.pilot.conductInstrumentApproach(aircraftModel, approachTypeMock, runwayModelMock);

    expect(aircraftModel.pilot.hasApproachClearance).toBe(true);

    aircraftModel.pilot.maintainHeading(aircraftModel, nextHeadingDegreesMock);

    expect(cancelApproachClearanceSpy.called).toBe(true);
});

test('.maintainPresentHeading() sets the #mcp with the correct modes and values', () => {
    const aircraftModel = new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK);

    aircraftModel.pilot.maintainPresentHeading(aircraftModel);

    expect(aircraftModel.pilot._mcp.headingMode === 'HOLD').toBe(true);
    expect(aircraftModel.pilot._mcp.heading === aircraftModel.heading).toBe(true);
});

test('.maintainPresentHeading() returns a success message when finished', () => {
    const expectedResult = [
        true,
        {
            log: 'fly present heading',
            say: 'fly present heading'
        }
    ];
    const aircraftModel = new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK);
    const result = aircraftModel.pilot.maintainPresentHeading(aircraftModel);

    expect(result).toEqual(expectedResult);
});

test('.maintainPresentHeading() calls .cancelApproachClearance()', () => {
    const approachTypeMock = 'ils';
    const runwayModelMock = airportModelFixture.getRunway('19L');
    const aircraftModel = new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK);
    const cancelApproachClearanceSpy = sinon.spy(aircraftModel.pilot, 'cancelApproachClearance');

    aircraftModel.pilot.conductInstrumentApproach(aircraftModel, approachTypeMock, runwayModelMock);

    expect(aircraftModel.pilot.hasApproachClearance).toBe(true);

    aircraftModel.pilot.maintainPresentHeading(aircraftModel);

    expect(cancelApproachClearanceSpy.called).toBe(true);
});

test('.maintainSpeed() sets the correct Mcp mode and value', () => {
    const aircraftModel = new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK);
    const pilot = createPilotFixture();
    const expectedResult = [
        true,
        {
            log: 'increase speed to 460',
            say: 'increase speed to four six zero'
        }
    ];
    const result = pilot.maintainSpeed(cruiseSpeedMock, aircraftModel);

    expect(pilot._mcp.speedMode === 'HOLD').toBe(true);
    expect(pilot._mcp.speed === 460).toBe(true);
    expect(result).toEqual(expectedResult);
});

test('.maintainSpeed() returns early with a warning when assigned an unreachable speed', () => {
    const aircraftModel = new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK);
    const pilot = createPilotFixture();
    const expectedResult = [
        false,
        {
            log: 'unable to maintain 530 knots due to performance',
            say: 'unable to maintain five three zero knots due to performance'
        }
    ];
    const result = pilot.maintainSpeed(unattainableSpeedMock, aircraftModel);

    expect(result).toEqual(expectedResult);
});

test('.proceedDirect() returns an error if the waypointName provided is not in the current flightPlan', () => {
    const expectedResult = [false, {
        log: 'cannot proceed direct to ABC, it does not exist in our flight plan',
        say: 'cannot proceed direct to abc, it does not exist in our flight plan'
    }];
    const pilot = createPilotFixture();
    const result = pilot.proceedDirect('ABC');

    expect(result).toEqual(expectedResult);
});

test('.proceedDirect() calls ._fms.skipToWaypointName() with the correct arguments', () => {
    const pilot = createPilotFixture();
    const skipToWaypointNameSpy = sinon.spy(pilot._fms, 'skipToWaypointName');

    pilot.proceedDirect(waypointNameMock);

    expect(skipToWaypointNameSpy.calledWithExactly(waypointNameMock)).toBe(true);
});

test('.proceedDirect() sets the correct #_mcp mode', () => {
    const pilot = createPilotFixture();

    pilot.proceedDirect(waypointNameMock);

    expect(pilot._mcp.headingMode === 'LNAV').toBe(true);
});

test('.proceedDirect() calls .cancelHoldingPattern()', () => {
    const pilot = createPilotFixture();
    const cancelHoldingPatternSpy = sinon.spy(pilot, 'cancelHoldingPattern');

    pilot._fms.setFlightPhase('HOLD');
    pilot.proceedDirect(waypointNameMock);

    expect(cancelHoldingPatternSpy.calledWithExactly()).toBe(true);
});

test('.proceedDirect() returns success message when finished', () => {
    const expectedResult = [true, {
        log: 'proceed direct SUNST',
        say: 'proceed direct sunst'
    }];
    const pilot = createPilotFixture();
    const result = pilot.proceedDirect(waypointNameMock);

    expect(result).toEqual(expectedResult);
});

test('.sayTargetHeading() returns a message when #headingMode is HOLD', () => {
    const modeController = new ModeController();
    const pilot = new Pilot(createFmsArrivalFixture(), modeController);
    const expectedResult = [
        true,
        {
            log: 'we\'re assigned heading 180',
            say: 'we\'re assigned heading one eight zero'
        }
    ];
    pilot._mcp.headingMode = 'HOLD';
    pilot._mcp.heading = 3.141592653589793;

    const result = pilot.sayTargetHeading();

    expect(result).toEqual(expectedResult);
});

test('.sayTargetHeading() returns a message when #headingMode is VOR/LOC', () => {
    const modeController = new ModeController();
    const pilot = new Pilot(createFmsArrivalFixture(), modeController);
    const expectedResult = [
        true,
        {
            log: 'we\'re joining a course of 180',
            say: 'we\'re joining a course of one eight zero'
        }
    ];
    pilot._mcp.headingMode = 'VOR_LOC';
    pilot._mcp.course = 180;

    const result = pilot.sayTargetHeading();

    expect(result).toEqual(expectedResult);
});

test.todo('.sayTargetHeading() returns a message when #headingMode is LNAV');

test('.sayTargetHeading() returns a message when #headingMode is OFF', () => {
    const modeController = new ModeController();
    const pilot = new Pilot(createFmsArrivalFixture(), modeController);
    const expectedResult = [
        true,
        {
            log: 'we haven\'t been assigned a heading',
            say: 'we haven\'t been assigned a heading'
        }
    ];
    const result = pilot.sayTargetHeading();

    expect(result).toEqual(expectedResult);
});
