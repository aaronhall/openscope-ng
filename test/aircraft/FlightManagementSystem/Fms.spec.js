import { test, expect, vi } from 'vitest';
import sinon from 'sinon';
import _every from 'lodash/every';
import _isArray from 'lodash/isArray';
import Fms from '../../../src/assets/scripts/client/aircraft/FlightManagementSystem/Fms';
import WaypointModel from '../../../src/assets/scripts/client/aircraft/FlightManagementSystem/WaypointModel';
// import StaticPositionModel from '../../../src/assets/scripts/client/base/StaticPositionModel';
import { airportModelFixture } from '../../fixtures/airportFixtures';
import {
    createNavigationLibraryFixture,
    resetNavigationLibraryFixture
} from '../../fixtures/navigationLibraryFixtures';
import {
    ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK,
    // ARRIVAL_AIRCRAFT_INIT_PROPS_WITH_DIRECT_ROUTE_STRING_MOCK,
    DEPARTURE_AIRCRAFT_INIT_PROPS_MOCK
    // DEPARTURE_AIRCRAFT_INIT_PROPS_WITH_DIRECT_ROUTE_STRING_MOCK,
    // AIRCRAFT_DEFINITION_MOCK
} from '../_mocks/aircraftMocks';
import {
    FLIGHT_CATEGORY,
    FLIGHT_PHASE
} from '../../../src/assets/scripts/client/constants/aircraftConstants';
// import { SNORA_STATIC_POSITION_MODEL } from '../../base/_mocks/positionMocks';
import {
    INVALID_NUMBER
} from '../../../src/assets/scripts/client/constants/globalConstants';
// import { PROCEDURE_TYPE } from '../../../src/assets/scripts/client/constants/routeConstants';

// const invalidDirectRouteStringMock = 'COWBY.BIKKR';
// const complexRouteString = 'COWBY..BIKKR..DAG.KEPEC3.KLAS';
// const complexRouteStringWithHold = 'COWBY..@BIKKR..DAG.KEPEC3.KLAS';
// const complexRouteStringWithVector = 'COWBY..#180..BIKKR..DAG.KEPEC3.KLAS';
// const invalidProcedureRouteStringMock = 'MLF..GRNPA1.KLAS';
// const simpleRouteString = ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK.route;
const starRouteStringMock = 'MLF.GRNPA1.KLAS07R';
const sidRouteStringMock = 'KLAS07R.COWBY6.DRK';
const fullRouteStringMock = 'KLAS07R.COWBY6.DRK..OAL..MLF..TNP.KEPEC3.KLAS07R';
const directOnlyRouteStringMock = 'TNP..BIKKR..OAL..MLF..PGS..DRK';
// const isComplexRoute = true;

// helper functions
function buildFmsForAircraftInApronPhaseWithRouteString(routeString) {
    const aircraftPropsMock = Object.assign({}, DEPARTURE_AIRCRAFT_INIT_PROPS_MOCK, { routeString });

    return new Fms(aircraftPropsMock);
}
function buildFmsForAircraftInCruisePhaseWithRouteString(routeString) {
    const aircraftPropsMock = Object.assign({}, ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK, { routeString });

    return new Fms(aircraftPropsMock);
}

beforeEach(() => {
    createNavigationLibraryFixture();
});

afterEach(() => {
    resetNavigationLibraryFixture();
});

test('throws when called without proper parameters', () => {
    const expectedMessage = /Invalid aircraftInitProps passed to Fms constructor\. Expected a non-empty object, but received .*/;

    expect(() => new Fms(), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => new Fms(null), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => new Fms({}), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => new Fms([]), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => new Fms(42), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => new Fms('threeve'), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => new Fms(false), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
});

test('throws when instantiated with a route string containing less than two waypoints', () => {
    expect(() => buildFmsForAircraftInCruisePhaseWithRouteString('')).toThrow();
    expect(() => buildFmsForAircraftInCruisePhaseWithRouteString('COWBY')).toThrow();
    expect(() => buildFmsForAircraftInApronPhaseWithRouteString('')).toThrow();
    expect(() => buildFmsForAircraftInApronPhaseWithRouteString('COWBY')).toThrow();
});

test('does not throw when called with valid parameters', () => {
    expect(() => buildFmsForAircraftInCruisePhaseWithRouteString(sidRouteStringMock)).not.toThrow();
    expect(() => buildFmsForAircraftInCruisePhaseWithRouteString(starRouteStringMock)).not.toThrow();
    expect(() => buildFmsForAircraftInCruisePhaseWithRouteString(fullRouteStringMock)).not.toThrow();
    expect(() => buildFmsForAircraftInCruisePhaseWithRouteString(directOnlyRouteStringMock)).not.toThrow();
    expect(() => buildFmsForAircraftInApronPhaseWithRouteString(sidRouteStringMock)).not.toThrow();
    expect(() => buildFmsForAircraftInApronPhaseWithRouteString(starRouteStringMock)).not.toThrow();
    expect(() => buildFmsForAircraftInApronPhaseWithRouteString(fullRouteStringMock)).not.toThrow();
    expect(() => buildFmsForAircraftInApronPhaseWithRouteString(directOnlyRouteStringMock)).not.toThrow();
});

test('#currentLeg returns #_routeModel.currentLeg', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(fullRouteStringMock);

    expect(fms.currentLeg).toEqual(fms._routeModel.currentLeg);
});

test('#currentWaypoint returns the first waypoint of the #_routeModel', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(fullRouteStringMock);

    expect(fms.currentWaypoint).toEqual(fms._routeModel.waypoints[0]);
});

test('#nextAltitudeRestrictedWaypoint returns undefined when there are no altitude restricted waypoints remaining', () => {
    const fms = buildFmsForAircraftInCruisePhaseWithRouteString(directOnlyRouteStringMock);
    const result = fms.nextAltitudeRestrictedWaypoint;

    expect(typeof result === 'undefined').toBe(true);
});

test('#nextAltitudeRestrictedWaypoint returns the next waypoint with an altitude restriction', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(sidRouteStringMock);
    const result = fms.nextAltitudeRestrictedWaypoint;

    expect(result.name === 'BAKRR').toBe(true);
});

test('#nextHardAltitudeRestrictedWaypoint returns undefined when there are no hard-altitude restricted waypoints remaining', () => {
    const fms = buildFmsForAircraftInCruisePhaseWithRouteString('KLAS01L.TRALR6.MLF');
    const result = fms.nextHardAltitudeRestrictedWaypoint;

    expect(typeof result === 'undefined').toBe(true);
});

test('#nextHardAltitudeRestrictedWaypoint returns the next waypoint with a hard-altitude restriction', () => {
    const fms = buildFmsForAircraftInCruisePhaseWithRouteString('TNP.KEPEC3.KLAS07R');
    const result = fms.nextHardAltitudeRestrictedWaypoint;

    expect(result.name === 'CLARR').toBe(true);
});

test('#nextHardSpeedRestrictedWaypoint returns undefined when there are no hard-speed restricted waypoints remaining', () => {
    const fms = buildFmsForAircraftInCruisePhaseWithRouteString('KLAS01L.TRALR6.MLF');
    const result = fms.nextHardSpeedRestrictedWaypoint;

    expect(typeof result === 'undefined').toBe(true);
});

test('#nextHardSpeedRestrictedWaypoint returns the next waypoint with a hard-speed restriction', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString('BCE.GRNPA1.KLAS07R');
    const result = fms.nextHardSpeedRestrictedWaypoint;

    expect(result.name === 'LUXOR').toBe(true);
});

test('#nextRestrictedWaypoint returns undefined when there are no restricted waypoints remaining', () => {
    const fms = buildFmsForAircraftInCruisePhaseWithRouteString(directOnlyRouteStringMock);
    const result = fms.nextRestrictedWaypoint;

    expect(typeof result === 'undefined').toBe(true);
});

test('#nextRestrictedWaypoint returns the next waypoint with any altitude/speed restriction', () => {
    const fmsWithSoftAltitude = buildFmsForAircraftInApronPhaseWithRouteString('KLAS01R.TRALR6.MLF');
    const fmsWithSoftSpeed = buildFmsForAircraftInApronPhaseWithRouteString('KLAS01L.TRALR6.MLF');

    expect(fmsWithSoftAltitude.nextRestrictedWaypoint.name === 'RIOOS').toBe(true);
    expect(fmsWithSoftSpeed.nextRestrictedWaypoint.name === 'NAPSE').toBe(true);
});

test('#nextSpeedRestrictedWaypoint returns undefined when there are no speed restricted waypoints remaining', () => {
    const fms = buildFmsForAircraftInCruisePhaseWithRouteString('DRK.ZIMBO1.KLAS07R');
    const result = fms.nextSpeedRestrictedWaypoint;

    expect(typeof result === 'undefined').toBe(true);
});

test('#nextSpeedRestrictedWaypoint returns the next waypoint with any speed restriction', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString('DRK.TYSSN4.KLAS07R');
    const result = fms.nextSpeedRestrictedWaypoint;

    expect(result.name === 'KADDY').toBe(true);
});

test('#nextWaypoint returns #_routeModel.nextWaypoint', () => {
    const fms = buildFmsForAircraftInCruisePhaseWithRouteString(fullRouteStringMock);

    fms.moveToNextWaypoint();

    expect(fms.nextWaypoint).toEqual(fms._routeModel.nextWaypoint);
});

test('#waypoints returns an array containing all the WaypointModels in the route', () => {
    const fms = buildFmsForAircraftInCruisePhaseWithRouteString(fullRouteStringMock);
    const result = fms.waypoints;

    expect(result.length === 20).toBe(true);
    expect(_every(result, (waypoint) => waypoint instanceof WaypointModel)).toBe(true);
});

test('.reset() resets all instance properties to appropriate default values', () => {
    const fms = buildFmsForAircraftInCruisePhaseWithRouteString(fullRouteStringMock);

    fms.reset();

    expect(!fms.arrivalAirportModel).toBe(true);
    expect(!fms.arrivalRunwayModel).toBe(true);
    expect(fms.currentPhase === '').toBe(true);
    expect(!fms.departureAirportModel).toBe(true);
    expect(!fms.departureRunwayModel).toBe(true);
    expect(fms.flightPlanAltitude === INVALID_NUMBER).toBe(true);
    expect(!fms._routeModel).toBe(true);
});

test('._initializeAirportsAndRunways() does not make calls to initialize departure airport+runway when origin ICAO is an empty string', () => {
    const fms = buildFmsForAircraftInCruisePhaseWithRouteString(starRouteStringMock);
    const _initializeDepartureAirportSpy = sinon.spy(fms, '_initializeDepartureAirport');
    const _initializeDepartureRunwaySpy = sinon.spy(fms, '_initializeDepartureRunway');
    const result = fms._initializeAirportsAndRunways('', 'klas');

    expect(typeof result === 'undefined').toBe(true);
    expect(_initializeDepartureAirportSpy.notCalled).toBe(true);
    expect(_initializeDepartureRunwaySpy.notCalled).toBe(true);
});

test('._initializeAirportsAndRunways() does not make calls to initialize arrival airport+runway when destination ICAO is an empty string', () => {
    const fms = buildFmsForAircraftInCruisePhaseWithRouteString(sidRouteStringMock);
    const _initializeArrivalAirportSpy = sinon.spy(fms, '_initializeArrivalAirport');
    const _initializeArrivalRunwaySpy = sinon.spy(fms, '_initializeArrivalRunway');
    const result = fms._initializeAirportsAndRunways('klas', '');

    expect(typeof result === 'undefined').toBe(true);
    expect(_initializeArrivalAirportSpy.notCalled).toBe(true);
    expect(_initializeArrivalRunwaySpy.notCalled).toBe(true);
});

test('._initializeArrivalAirport() sets #arrivalAirportModel to the specified destination airport', () => {
    const fms = buildFmsForAircraftInCruisePhaseWithRouteString(fullRouteStringMock);
    const result = fms.reset()._initializeArrivalAirport('klas');

    expect(typeof result === 'undefined').toBe(true);
    expect(fms.arrivalAirportModel.icao === 'klas').toBe(true);
});

test('._initializeArrivalRunway() returns early when #arrivalAirportModel is null', () => {
    const fms = buildFmsForAircraftInCruisePhaseWithRouteString(fullRouteStringMock);
    const setArrivalRunwaySpy = sinon.spy(fms, 'setArrivalRunway');
    const result = fms.reset()._initializeArrivalRunway();

    expect(typeof result === 'undefined').toBe(true);
    expect(setArrivalRunwaySpy.notCalled).toBe(true);
});

test('._initializeArrivalRunway() sets #arrivalRunwayModel to arrival airport\'s standard arrival runway when unable to deduce arrival runway from route', () => {
    const fms = buildFmsForAircraftInCruisePhaseWithRouteString(directOnlyRouteStringMock);
    const result = fms._initializeArrivalRunway();

    expect(typeof result === 'undefined').toBe(true);
    expect(fms.arrivalRunwayModel).toEqual(fms.arrivalAirportModel.arrivalRunwayModel);
});

test('._initializeArrivalRunway() sets #arrivalRunwayModel IAW the route model', () => {
    const fms = buildFmsForAircraftInCruisePhaseWithRouteString('KLAS07L.COWBY6.DRK..OAL..MLF..TNP.KEPEC3.KLAS07R');
    const result = fms._initializeArrivalRunway();

    expect(typeof result === 'undefined').toBe(true);
    expect(fms.arrivalRunwayModel.name === '07R').toBe(true);
});

test('._initializeDepartureAirport() sets #departureAirportModel to the specified origin airport', () => {
    const fms = buildFmsForAircraftInCruisePhaseWithRouteString(fullRouteStringMock);
    const result = fms.reset()._initializeDepartureAirport('klas');

    expect(typeof result === 'undefined').toBe(true);
    expect(fms.departureAirportModel.icao === 'klas').toBe(true);
});

test('._initializeDepartureRunway() returns early when #departureAirportModel is null', () => {
    const fms = buildFmsForAircraftInCruisePhaseWithRouteString(fullRouteStringMock);
    const setDepartureRunwaySpy = sinon.spy(fms, 'setDepartureRunway');
    const result = fms.reset()._initializeDepartureRunway();

    expect(typeof result === 'undefined').toBe(true);
    expect(setDepartureRunwaySpy.notCalled).toBe(true);
});

test('._initializeDepartureRunway() sets #departureRunwayModel to departure airport\'s standard departure runway when unable to deduce departure runway from route', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(starRouteStringMock);
    const result = fms._initializeDepartureRunway();

    expect(typeof result === 'undefined').toBe(true);
    expect(fms.departureRunwayModel).toEqual(fms.departureAirportModel.departureRunwayModel);
});

test('._initializeDepartureRunway() sets #departureRunwayModel IAW the route model', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString('KLAS07L.COWBY6.DRK..OAL..MLF..TNP.KEPEC3.KLAS07R');
    const result = fms._initializeDepartureRunway();

    expect(typeof result === 'undefined').toBe(true);
    expect(fms.departureRunwayModel.name === '07L').toBe(true);
});

test('._initializeFlightPhaseForCategory() throws when category is neither arrival nor departure', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(fullRouteStringMock);

    expect(() => fms._initializeFlightPhaseForCategory('invalidSpawnPatternCategory')).toThrow();
});

test('._initializeFlightPhaseForCategory() calls .setFlightPhase() with cruise phase for arrival category', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(fullRouteStringMock);
    const setFlightPhaseSpy = sinon.spy(fms, 'setFlightPhase');

    fms._initializeFlightPhaseForCategory(FLIGHT_CATEGORY.ARRIVAL);

    expect(setFlightPhaseSpy.calledWithExactly(FLIGHT_PHASE.CRUISE)).toBe(true);
});

test('._initializeFlightPhaseForCategory() calls .setFlightPhase() with apron phase for departure category', () => {
    const fms = buildFmsForAircraftInCruisePhaseWithRouteString(fullRouteStringMock);
    const setFlightPhaseSpy = sinon.spy(fms, 'setFlightPhase');

    fms._initializeFlightPhaseForCategory(FLIGHT_CATEGORY.DEPARTURE);

    expect(setFlightPhaseSpy.calledWithExactly(FLIGHT_PHASE.APRON)).toBe(true);
});

test('._initializeFlightPlanAltitude() sets #flightPlanAltitude for arrival a/c to specified value', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(sidRouteStringMock);
    const altitudeMock = 12345;
    const ceilingMock = 38000;

    fms.reset()._initializeFlightPlanAltitude(altitudeMock, FLIGHT_CATEGORY.ARRIVAL, { ceiling: ceilingMock });

    expect(fms.flightPlanAltitude === altitudeMock).toBe(true);
});

test('._initializeFlightPlanAltitude() sets #flightPlanAltitude for departure a/c to service ceiling when none is specified', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(sidRouteStringMock);
    const altitudeMock = '';
    const ceilingMock = 38000;

    fms.reset()._initializeFlightPlanAltitude(altitudeMock, FLIGHT_CATEGORY.DEPARTURE, { ceiling: ceilingMock });

    expect(fms.flightPlanAltitude === ceilingMock).toBe(true);
});

test('._initializeFlightPlanAltitude() sets #flightPlanAltitude for departure a/c to correct altitude when one is specified', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(sidRouteStringMock);
    const altitudeMock = 12345;
    const ceilingMock = 38000;

    fms.reset()._initializeFlightPlanAltitude(altitudeMock, FLIGHT_CATEGORY.DEPARTURE, { ceiling: ceilingMock });

    expect(fms.flightPlanAltitude === altitudeMock).toBe(true);
});

test('._initializePositionInRouteToBeginAtFixName() returns early when flight is a departure', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(sidRouteStringMock);
    const skipToWaypointNameSpy = sinon.spy(fms, 'skipToWaypointName');

    fms._initializePositionInRouteToBeginAtFixName('COMPS', FLIGHT_CATEGORY.DEPARTURE);

    expect(skipToWaypointNameSpy.notCalled).toBe(true);
});

test('._initializePositionInRouteToBeginAtFixName() calls .moveToNextWaypoint() and returns early when no fix specified', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(sidRouteStringMock);
    const moveToNextWaypointSpy = sinon.spy(fms, 'moveToNextWaypoint');
    const skipToWaypointNameSpy = sinon.spy(fms, 'skipToWaypointName');

    fms._initializePositionInRouteToBeginAtFixName(null, FLIGHT_CATEGORY.ARRIVAL);

    expect(moveToNextWaypointSpy.calledWithExactly()).toBe(true);
    expect(skipToWaypointNameSpy.notCalled).toBe(true);
});

test('._initializePositionInRouteToBeginAtFixName() throws when specified waypoint does not exist in the route', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(sidRouteStringMock);

    expect(() => fms._initializePositionInRouteToBeginAtFixName('ABCDE', FLIGHT_CATEGORY.ARRIVAL)).toThrow();
});

test('._initializePositionInRouteToBeginAtFixName() calls .skipToWaypointName() when fix is valid and flight is an arrival', () => {
    const fms = buildFmsForAircraftInCruisePhaseWithRouteString(starRouteStringMock);
    const skipToWaypointNameSpy = sinon.spy(fms, 'skipToWaypointName');
    const fixNameMock = 'GRNPA';

    fms._initializePositionInRouteToBeginAtFixName(fixNameMock, FLIGHT_CATEGORY.ARRIVAL);

    expect(skipToWaypointNameSpy.calledWithExactly(fixNameMock)).toBe(true);
});

test('.activateHoldForWaypointName() returns failure message when the route does not contain the specified waypoint', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(fullRouteStringMock);
    const routeModelActivateHoldForWaypointNameSpy = sinon.spy(fms._routeModel, 'activateHoldForWaypointName');
    const unknownWaypointName = 'DINGBAT';
    const holdParametersMock = { turnDirection: 'left' };
    const expectedResult = [false, {
        log: `unable to hold at ${unknownWaypointName}; it is not on our route!`,
        say: `unable to hold at ${unknownWaypointName.toLowerCase()}; it is not on our route!`
    }];
    const result = fms.activateHoldForWaypointName(unknownWaypointName, holdParametersMock);

    expect(routeModelActivateHoldForWaypointNameSpy.notCalled).toBe(true);
    expect(result).toEqual(expectedResult);
});

test('.activateHoldForWaypointName() calls #_routeModel.activateHoldForWaypointName() with appropriate parameters', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(fullRouteStringMock);
    const routeModelActivateHoldForWaypointNameSpy = sinon.spy(fms._routeModel, 'activateHoldForWaypointName');
    const holdWaypointName = 'OAL';
    const holdParametersMock = { turnDirection: 'left' };
    const fallbackInboundHeading = 1.2;
    const result = fms.activateHoldForWaypointName(holdWaypointName, holdParametersMock, fallbackInboundHeading);

    expect(typeof result).not.toBe('undefined');
    expect(routeModelActivateHoldForWaypointNameSpy.calledWithExactly(holdWaypointName, holdParametersMock, fallbackInboundHeading)).toBe(true);
});

test('.applyPartialRouteAmendment() returns error message without throwing when provided routestring is improperly formatted', () => {
    const fms = buildFmsForAircraftInCruisePhaseWithRouteString('TNP..BIKKR..OAL..MLF..PGS..DRK');
    const routeStringToApply = 'BIKKR.PGS';
    const absorbRouteModelSpy = sinon.spy(fms._routeModel, 'absorbRouteModel');
    const expectedResult = [false, 'requested route of "BIKKR.PGS" is invalid'];
    const result = fms.applyPartialRouteAmendment(routeStringToApply);

    expect(result).toEqual(expectedResult);
    expect(absorbRouteModelSpy.notCalled).toBe(true);
});

test('.applyPartialRouteAmendment() calls #_routeModel.absorbRouteModel() when provided routestring is properly formatted', () => {
    const fms = buildFmsForAircraftInCruisePhaseWithRouteString('TNP..BIKKR..OAL..MLF..PGS..DRK');
    const routeStringToApply = 'BIKKR..PGS';
    const absorbRouteModelSpy = sinon.spy(fms._routeModel, 'absorbRouteModel');
    const expectedResult = [true, { log: 'rerouting to: BIKKR PGS DRK', say: 'rerouting as requested' }];
    const result = fms.applyPartialRouteAmendment(routeStringToApply);

    expect(result).toEqual(expectedResult);
    expect(absorbRouteModelSpy.args[0].length === 1).toBe(true);
    expect(absorbRouteModelSpy.args[0][0].getRouteString() === routeStringToApply).toBe(true);
});

test('.getAltitudeRestrictedWaypoints() returns #_routeModel.getAltitudeRestrictedWaypoints()', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(sidRouteStringMock);

    expect(fms.getAltitudeRestrictedWaypoints()).toEqual(fms._routeModel.getAltitudeRestrictedWaypoints());
});

test('.getBottomAltitude() returns #_routeModel.getBottomAltitude()', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(sidRouteStringMock);

    expect(fms.getBottomAltitude()).toEqual(fms._routeModel.getBottomAltitude());
});

test('.getFullRouteStringWithoutAirportsWithSpaces calls #_routeModel.getFullRouteStringWithoutAirportsWithSpaces()', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString('KLAS07R.COWBY6.DRK');
    const routeModelSpy = sinon.spy(fms._routeModel, 'getFullRouteStringWithoutAirportsWithSpaces');
    const expectedResult = 'COWBY6 DRK';
    const result = fms.getFullRouteStringWithoutAirportsWithSpaces();

    expect(result === expectedResult).toBe(true);
    expect(routeModelSpy.calledWithExactly()).toBe(true);
});

test('.getNextWaypointPositionModel() returns #nextWaypoint.positionModel', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(sidRouteStringMock);

    expect(fms.getNextWaypointPositionModel()).toEqual(fms.nextWaypoint.positionModel);
});

test('.getRestrictedWaypoints() returns all waypoints in route that return true for WaypointModel.hasRestriction', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString('KLAS01L.COWBY6.GUP');
    const result = fms.getRestrictedWaypoints();
    const expectedWaypointNames = ['RIOOS', 'MOSBI'];
    const waypointNames = result.map((waypointModel) => waypointModel.name);

    expect(_isArray(result)).toBe(true);
    expect(waypointNames).toEqual(expectedWaypointNames);
});

test('.getRouteString() returns #_routeModel.getRouteString()', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(sidRouteStringMock);

    expect(fms.getRouteString()).toEqual(fms._routeModel.getRouteString());
});

test('.getRouteStringWithSpaces() returns #_routeModel.getRouteStringWithSpaces()', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(sidRouteStringMock);

    expect(fms.getRouteStringWithSpaces()).toEqual(fms._routeModel.getRouteStringWithSpaces());
});

test('.getSidIcao() returns #_routeModel.getSidIcao()', () => {
    const fms = buildFmsForAircraftInCruisePhaseWithRouteString('DVC.GRNPA1.KLAS07R');
    const expectedResult = fms._routeModel.getSidIcao();
    const result = fms.getSidIcao();

    expect(result === expectedResult).toBe(true);
});

test('.getSidName() returns #_routeModel.getSidName()', () => {
    const fms = buildFmsForAircraftInCruisePhaseWithRouteString('DVC.GRNPA1.KLAS07R');
    const expectedResult = fms._routeModel.getSidName();
    const result = fms.getSidName();

    expect(result === expectedResult).toBe(true);
});

test('.getInitialClimbClearance() returns the airport initial climb altitude when the SID\'s altitude is undefined', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(fullRouteStringMock);

    expect(fms.getInitialClimbClearance() === 19000).toBe(true);
});

test('.getInitialClimbClearance() returns the SID\'s altitude when defined', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString('KLAS07R.BOACH6.HEC');

    expect(fms.getInitialClimbClearance() === 7000).toBe(true);
});

test('.getSpeedRestrictedWaypoints() returns array of all speed restricted waypoints in route', () => {
    const fms = buildFmsForAircraftInCruisePhaseWithRouteString('DVC.GRNPA1.KLAS07R');
    const result = fms.getSpeedRestrictedWaypoints();
    const expectedWaypointNames = ['LUXOR', 'FRAWG'];
    const waypointNames = result.map((waypointModel) => waypointModel.name);

    expect(_isArray(result)).toBe(true);
    expect(waypointNames).toEqual(expectedWaypointNames);
});

test('.getTopAltitude() returns #_routeModel.getTopAltitude()', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(sidRouteStringMock);
    const routeModelGetTopAltitudeSpy = sinon.spy(fms._routeModel, 'getTopAltitude');
    const result = fms.getTopAltitude();

    expect(routeModelGetTopAltitudeSpy.calledWithExactly()).toBe(true);
    expect(result === fms._routeModel.getTopAltitude()).toBe(true);
});

test('.hasNextWaypoint() returns #_routeModel.hasNextWaypoint()', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(sidRouteStringMock);
    const routeModelHasNextWaypointSpy = sinon.spy(fms._routeModel, 'hasNextWaypoint');
    const result = fms.hasNextWaypoint();

    expect(routeModelHasNextWaypointSpy.calledWithExactly()).toBe(true);
    expect(result === fms._routeModel.hasNextWaypoint()).toBe(true);
});

test('.hasWaypointName() returns #_routeModel.hasWaypointName()', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(sidRouteStringMock);
    const waypointNameMock = 'DRK';
    const routeModelHasWaypointNameSpy = sinon.spy(fms._routeModel, 'hasWaypointName');
    const result = fms.hasWaypointName(waypointNameMock);

    expect(routeModelHasWaypointNameSpy.calledWithExactly(waypointNameMock)).toBe(true);
    expect(result === fms._routeModel.hasWaypointName(waypointNameMock)).toBe(true);
});

test('.isArrival() returns true for any arrival flight', () => {
    const fms = buildFmsForAircraftInCruisePhaseWithRouteString(fullRouteStringMock);
    expect(fms.isArrival()).toBe(true);
});

test('.isArrival() returns false for departing flights', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(fullRouteStringMock);
    expect(fms.isArrival()).toBe(false);
});

test('.isDeparture() returns true for any departure flight', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(fullRouteStringMock);
    expect(fms.isDeparture()).toBe(true);
});

test('.isDeparture() returns false for any arriving flight', () => {
    const fms = buildFmsForAircraftInCruisePhaseWithRouteString(fullRouteStringMock);
    expect(fms.isDeparture()).toBe(false);
});

test('.moveToNextWaypoint() calls #_routeModel.moveToNextWaypoint()', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(fullRouteStringMock);
    const routeModelMoveToNextWaypointSpy = sinon.spy(fms._routeModel, 'moveToNextWaypoint');
    const result = fms.moveToNextWaypoint();

    expect(routeModelMoveToNextWaypointSpy.calledWithExactly()).toBe(true);
    expect(result).toEqual(fms._routeModel.moveToNextWaypoint());
});

test('.replaceArrivalProcedure() returns early when passed a wrong-length route string', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(fullRouteStringMock);
    const expectedResponse = [false, 'arrival procedure format not understood'];
    const responseForSingleElement = fms.replaceArrivalProcedure('KEPEC3');
    const responseForDoubleElement = fms.replaceArrivalProcedure('KEPEC3.KLAS07R');

    expect(responseForSingleElement).toEqual(expectedResponse);
    expect(responseForDoubleElement).toEqual(expectedResponse);
});

test('.replaceArrivalProcedure() returns early when the specified procedure does not exist', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(fullRouteStringMock);
    const routeModelReplaceArrivalProcedureSpy = sinon.spy(fms._routeModel, 'replaceArrivalProcedure');
    const expectedResponse = [false, 'unknown procedure "KEPEC0"'];
    const responseForInvalidProcedure = fms.replaceArrivalProcedure('DAG.KEPEC0.KLAS07R');

    expect(routeModelReplaceArrivalProcedureSpy.notCalled).toBe(true);
    expect(responseForInvalidProcedure).toEqual(expectedResponse);
});

test('.replaceArrivalProcedure() does not call ._updateArrivalRunwayFromRoute() when the arrival procedure is not applied successfully', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(fullRouteStringMock);
    const routeModelReplaceArrivalProcedureStub = sinon.stub(fms._routeModel, 'replaceArrivalProcedure').returns(false);
    const updateArrivalRunwayFromRouteSpy = sinon.spy(fms, '_updateArrivalRunwayFromRoute');
    const expectedResponse = [false, 'route of "DAG.KEPEC3.KLAS07R" is not valid'];
    const responseForInvalidProcedure = fms.replaceArrivalProcedure('DAG.KEPEC3.KLAS07R');

    routeModelReplaceArrivalProcedureStub.restore();

    expect(updateArrivalRunwayFromRouteSpy.notCalled).toBe(true);
    expect(responseForInvalidProcedure).toEqual(expectedResponse);
});

test('.replaceArrivalProcedure() calls ._updateArrivalRunwayFromRoute() when the arrival procedure is applied successfully', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(fullRouteStringMock);
    const updateArrivalRunwayFromRouteSpy = sinon.spy(fms, '_updateArrivalRunwayFromRoute');
    const expectedResponse = [true, ''];
    const response = fms.replaceArrivalProcedure('DAG.KEPEC3.KLAS07R');

    expect(updateArrivalRunwayFromRouteSpy.calledWithExactly()).toBe(true);
    expect(response).toEqual(expectedResponse);
});

test('.replaceDepartureProcedure() returns early when passed a wrong-length route string', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(fullRouteStringMock);
    const expectedResponse = [false, 'departure procedure format not understood'];
    const response = fms.replaceDepartureProcedure('KLAS07R.BOACH6.BOACH6.BOACH6');

    expect(response).toEqual(expectedResponse);
});

test('.replaceDepartureProcedure() returns early when the specified procedure does not exist', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(fullRouteStringMock);
    const routeModelReplaceDepartureProcedureSpy = sinon.spy(fms._routeModel, 'replaceDepartureProcedure');
    const expectedResponse = [false, 'unknown procedure "BOACH0"'];
    const responseForInvalidProcedure = fms.replaceDepartureProcedure('KLAS07R.BOACH0.TNP');

    expect(routeModelReplaceDepartureProcedureSpy.notCalled).toBe(true);
    expect(responseForInvalidProcedure).toEqual(expectedResponse);
});

test('.replaceDepartureProcedure() does not call ._updateDepartureRunwayFromRoute() when the departure procedure is not applied successfully', () => {
    const expectedResponse = [false, 'route of "KLAS07R.BOACH6.TNP" is not valid'];
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(fullRouteStringMock);
    const routeModelReplaceDepartureProcedureStub = sinon.stub(fms._routeModel, 'replaceDepartureProcedure').returns(expectedResponse);
    const updateDepartureRunwayFromRouteSpy = sinon.spy(fms, '_updateDepartureRunwayFromRoute');
    const responseForInvalidProcedure = fms.replaceDepartureProcedure('KLAS07R.BOACH6.TNP');

    routeModelReplaceDepartureProcedureStub.restore();

    expect(updateDepartureRunwayFromRouteSpy.notCalled).toBe(true);
    expect(responseForInvalidProcedure).toEqual(expectedResponse);
});

test('.replaceDepartureProcedure() calls ._updateDepartureRunwayFromRoute() and updates route when the departure procedure is applied successfully', () => {
    const expectedRouteString = 'KLAS07R.BOACH6.TNP.KEPEC3.KLAS07R';
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(fullRouteStringMock);
    const updateDepartureRunwayFromRouteSpy = sinon.spy(fms, '_updateDepartureRunwayFromRoute');
    const expectedResponse = [true, { log: 'rerouting to: KLAS07R BOACH6 TNP KEPEC3 KLAS07R', say: 'rerouting as requested' }];
    const response = fms.replaceDepartureProcedure('KLAS07R.BOACH6.TNP');

    expect(updateDepartureRunwayFromRouteSpy.calledWithExactly()).toBe(true);
    expect(response).toEqual(expectedResponse);
    expect(expectedRouteString === fms.getRouteString()).toBe(true);
});

test('.replaceFlightPlanWithNewRoute() returns failure response and does not modify route when proposed route is not valid', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(sidRouteStringMock);
    const invalidProposedRoute = 'KLAS07R.BOACH6.BOP';
    const originalRouteModel = fms._routeModel;
    const skipToWaypointNameSpy = sinon.spy(fms, 'skipToWaypointName');
    const expectedResult = [false, { log: 'requested route of "KLAS07R.BOACH6.BOP" is invalid', say: 'that route is invalid' }];
    const result = fms.replaceFlightPlanWithNewRoute(invalidProposedRoute);

    expect(result).toEqual(expectedResult);
    expect(skipToWaypointNameSpy.notCalled).toBe(true);
    expect(originalRouteModel).toEqual(fms._routeModel);
});

test('.replaceFlightPlanWithNewRoute() returns correct response and replaces old route with new route when proposed route is valid', () => {
    const fms = buildFmsForAircraftInCruisePhaseWithRouteString('TNP..BIKKR..HEC');
    const proposedRoute = 'JESJI..BAKRR..MINEY..HITME';
    const skipToWaypointNameSpy = sinon.spy(fms, 'skipToWaypointName');
    const expectedResult = [true, { log: 'rerouting to: JESJI BAKRR MINEY HITME', say: 'rerouting as requested' }];
    const result = fms.replaceFlightPlanWithNewRoute(proposedRoute);

    expect(result).toEqual(expectedResult);
    expect(skipToWaypointNameSpy.calledWithExactly('BIKKR')).toBe(true);
    expect(fms._routeModel.getRouteString() === proposedRoute).toBe(true);
});

test('.setArrivalRunway() throws when passed something other than a RunwayModel instance', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(fullRouteStringMock);

    expect(() => fms.setArrivalRunway()).toThrow();
    expect(() => fms.setArrivalRunway({})).toThrow();
    expect(() => fms.setArrivalRunway([])).toThrow();
    expect(() => fms.setArrivalRunway('')).toThrow();
    expect(() => fms.setArrivalRunway(15)).toThrow();
    expect(() => fms.setArrivalRunway('hello')).toThrow();
});

test('.setDepartureRunway() throws when passed something other than a RunwayModel instance', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(fullRouteStringMock);

    expect(() => fms.setDepartureRunway()).toThrow();
    expect(() => fms.setDepartureRunway({})).toThrow();
    expect(() => fms.setDepartureRunway([])).toThrow();
    expect(() => fms.setDepartureRunway('')).toThrow();
    expect(() => fms.setDepartureRunway(15)).toThrow();
    expect(() => fms.setDepartureRunway('hello')).toThrow();
});

test('.setDepartureRunway() returns early when the specified runway is already the #departureRunwayModel', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(fullRouteStringMock);
    const originalRunwayModel = fms.departureRunwayModel;
    const routeModelUpdateSidLegForDepartureRunwayModelSpy = sinon.spy(fms._routeModel, 'updateSidLegForDepartureRunwayModel');

    fms.setDepartureRunway(originalRunwayModel);

    expect(routeModelUpdateSidLegForDepartureRunwayModelSpy.notCalled).toBe(true);
    expect(fms.departureRunwayModel).toEqual(originalRunwayModel);
});

test('.setDepartureRunway() sets #departureRunwayModel to the specified RunwayModel', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(fullRouteStringMock);
    const nextRunwayModel = airportModelFixture.getRunway('25R');
    const routeModelUpdateSidLegForDepartureRunwayModelSpy = sinon.spy(fms._routeModel, 'updateSidLegForDepartureRunwayModel');

    fms.setDepartureRunway(nextRunwayModel);

    expect(routeModelUpdateSidLegForDepartureRunwayModelSpy.calledWithExactly(nextRunwayModel)).toBe(true);
    expect(fms.departureRunwayModel).toEqual(nextRunwayModel);
});

test('.setFlightPhase() throws if specified phase is not a member of the `FLIGHT_PHASE` enum', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(fullRouteStringMock);

    expect(() => fms.setFlightPhase()).toThrow();
    expect(() => fms.setFlightPhase({})).toThrow();
    expect(() => fms.setFlightPhase([])).toThrow();
    expect(() => fms.setFlightPhase(80)).toThrow();
    expect(() => fms.setFlightPhase('')).toThrow();
    expect(() => fms.setFlightPhase('dEsCeNt')).toThrow();
});

test('.setFlightPhase() sets #currentPhase to the specified flight phase', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(fullRouteStringMock);

    expect(fms.currentPhase === FLIGHT_PHASE.APRON).toBe(true);

    fms.setFlightPhase(FLIGHT_PHASE.CRUISE);

    expect(fms.currentPhase === FLIGHT_PHASE.CRUISE).toBe(true);
});

test('.skipToWaypointName() returns #_routeModel.skipToWaypointName()', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(fullRouteStringMock);
    const routeModelSkipTowWaypointNameSpy = sinon.spy(fms._routeModel, 'skipToWaypointName');
    const nextWaypointNameMock = 'MLF';
    const result = fms.skipToWaypointName(nextWaypointNameMock);

    expect(result).toBe(true);
    expect(routeModelSkipTowWaypointNameSpy.calledWithExactly(nextWaypointNameMock)).toBe(true);
});

test('.updateStarLegForArrivalRunway() throws when passed something other than a RunwayModel instance', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(fullRouteStringMock);

    expect(() => fms.updateStarLegForArrivalRunway()).toThrow();
    expect(() => fms.updateStarLegForArrivalRunway({})).toThrow();
    expect(() => fms.updateStarLegForArrivalRunway([])).toThrow();
    expect(() => fms.updateStarLegForArrivalRunway('')).toThrow();
    expect(() => fms.updateStarLegForArrivalRunway(15)).toThrow();
    expect(() => fms.updateStarLegForArrivalRunway('hello')).toThrow();
});

test('.updateStarLegForArrivalRunway() returns early when the specified runway is already the #arrivalRunwayModel', () => {
    const fms = buildFmsForAircraftInCruisePhaseWithRouteString(fullRouteStringMock);
    const originalRunwayModel = fms.arrivalRunwayModel;
    const routeModelUpdateStarLegForArrivalRunwayModelSpy = sinon.spy(fms._routeModel, 'updateStarLegForArrivalRunwayModel');

    const expectedResult = [true, { log: `expect Runway ${originalRunwayModel.name}`, say: `expect Runway ${originalRunwayModel.getRadioName()}` }];
    const result = fms.updateStarLegForArrivalRunway(originalRunwayModel);

    expect(result).toEqual(expectedResult);
    expect(routeModelUpdateStarLegForArrivalRunwayModelSpy.notCalled).toBe(true);
    expect(fms.arrivalRunwayModel).toEqual(originalRunwayModel);
});

test('.updateStarLegForArrivalRunway() returns early when the specified runway is not valid for the currently assigned STAR', () => {
    const fms = buildFmsForAircraftInCruisePhaseWithRouteString(fullRouteStringMock);
    const originalRunwayModel = fms.arrivalRunwayModel;
    const nextRunwayModel = airportModelFixture.getRunway('01R');
    const routeModelUpdateStarLegForArrivalRunwayModelSpy = sinon.spy(fms._routeModel, 'updateStarLegForArrivalRunwayModel');
    const expectedResult = [false, {
        log: 'unable, according to our charts, Runway 01R is not valid for the KEPEC3 arrival, expecting Runway 07R instead',
        say: 'unable, according to our charts, Runway zero one right is not valid for the Kepec Three arrival, expecting Runway zero seven right instead'
    }];
    const result = fms.updateStarLegForArrivalRunway(nextRunwayModel);

    expect(result).toEqual(expectedResult);
    expect(routeModelUpdateStarLegForArrivalRunwayModelSpy.notCalled).toBe(true);
    expect(fms.arrivalRunwayModel).toEqual(originalRunwayModel);
});

test('.updateStarLegForArrivalRunway() sets #arrivalRunwayModel to the specified RunwayModel', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(fullRouteStringMock);
    const nextRunwayModel = airportModelFixture.getRunway('25R');
    const routeModelUpdateStarLegForArrivalRunwayModelSpy = sinon.spy(fms._routeModel, 'updateStarLegForArrivalRunwayModel');

    const expectedResult = [true, { log: `expecting Runway ${nextRunwayModel.name}`, say: `expecting Runway ${nextRunwayModel.getRadioName()}` }];
    const result = fms.updateStarLegForArrivalRunway(nextRunwayModel);

    expect(result).toEqual(expectedResult);
    expect(routeModelUpdateStarLegForArrivalRunwayModelSpy.calledWithExactly(nextRunwayModel)).toBe(true);
    expect(fms.arrivalRunwayModel).toEqual(nextRunwayModel);
});

test('._updateArrivalRunwayFromRoute() returns early when arrival runway cannot be deduced from route', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(sidRouteStringMock);
    const setArrivalRunwaySpy = sinon.spy(fms, 'setArrivalRunway');
    const result = fms._updateArrivalRunwayFromRoute();

    expect(typeof result === 'undefined').toBe(true);
    expect(setArrivalRunwaySpy.notCalled).toBe(true);
});

test('._updateArrivalRunwayFromRoute() calls .setArrivalRunway() IAW the route\'s arrival runway', () => {
    const fms = buildFmsForAircraftInCruisePhaseWithRouteString('MLF.GRNPA1.KLAS07R');
    const setArrivalRunwaySpy = sinon.spy(fms, 'setArrivalRunway');
    const expectedRunwayModel = fms.arrivalAirportModel.getRunway('07R');
    const result = fms._updateArrivalRunwayFromRoute();

    expect(typeof result === 'undefined').toBe(true);
    expect(setArrivalRunwaySpy.calledWithExactly(expectedRunwayModel)).toBe(true);
});

test('._updateDepartureRunwayFromRoute() returns early when departure runway cannot be deduced from route', () => {
    const fms = buildFmsForAircraftInCruisePhaseWithRouteString(starRouteStringMock);
    const setDepartureRunwaySpy = sinon.spy(fms, 'setDepartureRunway');
    const result = fms._updateDepartureRunwayFromRoute();

    expect(typeof result === 'undefined').toBe(true);
    expect(setDepartureRunwaySpy.notCalled).toBe(true);
});

test('._updateDepartureRunwayFromRoute() calls .setDepartureRunway() IAW the route\'s departure runway', () => {
    const fms = buildFmsForAircraftInCruisePhaseWithRouteString('KLAS07R.COWBY6.DRK');
    const setDepartureRunwaySpy = sinon.spy(fms, 'setDepartureRunway');
    const expectedRunwayModel = fms.arrivalAirportModel.getRunway('07R');
    const result = fms._updateDepartureRunwayFromRoute();

    expect(typeof result === 'undefined').toBe(true);
    expect(setDepartureRunwaySpy.calledWithExactly(expectedRunwayModel)).toBe(true);
});

test('._verifyRouteContainsMultipleWaypoints() throws when route has zero waypoints', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(fullRouteStringMock);

    fms._routeModel.reset();

    expect(fms.waypoints.length === 0).toBe(true);
    expect(() => fms._verifyRouteContainsMultipleWaypoints()).toThrow();
});

test('._verifyRouteContainsMultipleWaypoints() throws when route has one waypoint', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(fullRouteStringMock);

    fms.replaceFlightPlanWithNewRoute('DRK');

    expect(fms.waypoints.length === 1).toBe(true);
    expect(() => fms._verifyRouteContainsMultipleWaypoints()).toThrow();
});

test('._verifyRouteContainsMultipleWaypoints() does not throw when route has more than one waypoint', () => {
    const fms = buildFmsForAircraftInApronPhaseWithRouteString(fullRouteStringMock);

    fms.replaceFlightPlanWithNewRoute('DRK..MLF');

    expect(fms.waypoints.length === 2).toBe(true);
    expect(() => fms._verifyRouteContainsMultipleWaypoints()).not.toThrow();
});
