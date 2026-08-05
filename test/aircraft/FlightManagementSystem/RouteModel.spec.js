import { test, expect, vi } from 'vitest';
import sinon from 'sinon';
import _every from 'lodash/every';
import _isArray from 'lodash/isArray';
import _isEmpty from 'lodash/isEmpty';
import _map from 'lodash/map';
import LegModel from '../../../src/assets/scripts/client/aircraft/FlightManagementSystem/LegModel';
import RouteModel from '../../../src/assets/scripts/client/aircraft/FlightManagementSystem/RouteModel';
import WaypointModel from '../../../src/assets/scripts/client/aircraft/FlightManagementSystem/WaypointModel';
import AirportModel from '../../../src/assets/scripts/client/airport/AirportModel';
import {
    createNavigationLibraryFixture,
    resetNavigationLibraryFixture,
} from '../../fixtures/navigationLibraryFixtures';
import { createAirportModelFixture } from '../../fixtures/airportFixtures';
import {
    CUSTOM_HOLD_PARAMETERS_EXECPTED,
    CUSTOM_HOLD_PARAMETERS_MOCK,
    EMPTY_HOLD_PARAMETERS_MOCK,
    GRNPA8_HOLD_PARAMETERS_EXPECTED,
} from './mocks/holdMocks';

const complexRouteStringMock = 'KLAS07R.BOACH6.TNP..OAL..MLF..PGS.TYSSN4.KLAS07R';
const singleFixRouteStringMock = 'DVC';
const singleDirectSegmentRouteStringMock = 'OAL..MLF';
const multiDirectSegmentRouteStringMock = 'OAL..MLF..PGS';
const singleSidProcedureSegmentRouteStringMock = 'KLAS07R.BOACH6.TNP';
const singleStarProcedureSegmentRouteStringMock = 'TNP.KEPEC3.KLAS07R';
const multiProcedureSegmentRouteStringMock = 'KLAS07R.BOACH6.TNP.KEPEC3.KLAS07R';
const nightmareRouteStringMock =
    'TNP.KEPEC3.KLAS07R.BOACH6.TNP..OAL..PGS.TYSSN4.KLAS07R.BOACH6.TNP..GUP..IGM';

beforeEach(() => {
    createNavigationLibraryFixture();
});

afterEach(() => {
    resetNavigationLibraryFixture();
});

test('throws when instantiated without valid parameters', () => {
    expect(() => new RouteModel()).toThrow();
    expect(() => new RouteModel(false)).toThrow();
});

test('throws when instantiated with route string containing spaces', () => {
    expect(() => new RouteModel('KLAS07R BOACH6 TNP')).toThrow();
});

test('does not throw when instantiated with valid parameters', () => {
    expect(() => new RouteModel(complexRouteStringMock)).not.toThrow();
});

test('instantiates correctly when provided valid single-fix route string', () => {
    const model = new RouteModel(singleFixRouteStringMock);

    expect(_isArray(model._legCollection)).toBe(true);
    expect(model._legCollection.length === 1).toBe(true);
});

test('instantiates correctly when provided valid single-segment direct route string', () => {
    const model = new RouteModel(singleDirectSegmentRouteStringMock);

    expect(_isArray(model._legCollection)).toBe(true);
    expect(model._legCollection.length === 2).toBe(true);
});

test('instantiates correctly when provided valid single-segment procedural route string', () => {
    const model = new RouteModel(singleSidProcedureSegmentRouteStringMock);

    expect(_isArray(model._legCollection)).toBe(true);
    expect(model._legCollection.length === 1).toBe(true);
    expect(model._legCollection[0]._waypointCollection.length === 8).toBe(true);
});

test('instantiates correctly when provided valid multi-segment direct route string', () => {
    const model = new RouteModel(multiDirectSegmentRouteStringMock);

    expect(_isArray(model._legCollection)).toBe(true);
    expect(model._legCollection.length === 3).toBe(true);
});

test('instantiates correctly when provided valid multi-segment procedural route string', () => {
    const model = new RouteModel(multiProcedureSegmentRouteStringMock);

    expect(_isArray(model._legCollection)).toBe(true);
    expect(model._legCollection.length === 2).toBe(true);
    expect(model._legCollection[0]._waypointCollection.length === 8).toBe(true);
    expect(model._legCollection[1]._waypointCollection.length === 13).toBe(true);
});

test('instantiates correctly when provided valid multi-segment mixed route string', () => {
    const model = new RouteModel(complexRouteStringMock);

    expect(_isArray(model._legCollection)).toBe(true);
    expect(model._legCollection.length === 4).toBe(true);
    expect(model._legCollection[0]._waypointCollection.length === 8).toBe(true);
    expect(model._legCollection[1]._waypointCollection.length === 1).toBe(true);
    expect(model._legCollection[2]._waypointCollection.length === 1).toBe(true);
    expect(model._legCollection[3]._waypointCollection.length === 6).toBe(true);
});

test('#currentLeg throws when #_legCollection does not contain at least one leg', () => {
    const model = new RouteModel(singleFixRouteStringMock);

    model._legCollection = [];

    expect(() => model.currentLeg).toThrow();
});

test('#currentLeg returns the first element of the #_legCollection', () => {
    const model = new RouteModel(singleFixRouteStringMock);
    const result = model.currentLeg;

    expect(result instanceof LegModel).toBe(true);
    expect(result.routeString === singleFixRouteStringMock).toBe(true);
});

test('#legCollection returns the entire #_legCollection', () => {
    const model = new RouteModel(singleFixRouteStringMock);
    const expectedResult = model._legCollection;
    const result = model.legCollection;

    expect(result).toEqual(expectedResult);
});

test('#currentWaypoint returns the #currentWaypoint on the #currentLeg', () => {
    const model = new RouteModel(singleFixRouteStringMock);
    const expectedResult = model.currentLeg.currentWaypoint;
    const result = model.currentWaypoint;

    expect(result).toEqual(expectedResult);
});

test('#nextLeg returns null when there are no more legs after the current leg', () => {
    const model = new RouteModel(singleFixRouteStringMock);
    const result = model.nextLeg;

    expect(!result).toBe(true);
});

test('#nextLeg returns the second element of the #_legCollection when it exists', () => {
    const model = new RouteModel(singleDirectSegmentRouteStringMock);
    const result = model.nextLeg;

    expect(result instanceof LegModel).toBe(true);
    expect(result.routeString === 'MLF').toBe(true);
});

test('#nextWaypoint returns null when there are no more waypoints after the current waypoint', () => {
    const model = new RouteModel(singleFixRouteStringMock);
    const result = model.nextWaypoint;

    expect(!result).toBe(true);
});

test('#nextWaypoint returns next waypoint of the current leg when the current leg has another waypoint', () => {
    const model = new RouteModel(nightmareRouteStringMock);
    const result = model.nextWaypoint;

    expect(result instanceof WaypointModel).toBe(true);
    expect(result.name === 'JOTNU').toBe(true);
});

test('#nextWaypoint returns the first waypoint of the next leg when a nextLeg exists and the current leg does not contain more waypoints', () => {
    const model = new RouteModel(nightmareRouteStringMock);

    model.skipToWaypointName('PRINO');

    const result = model.nextWaypoint;

    expect(result instanceof WaypointModel).toBe(true);
    expect(result.name === 'JESJI').toBe(true);
});

test('#waypoints returns an array containing the `WaypointModel`s of all legs', () => {
    const model = new RouteModel(complexRouteStringMock);
    const result = model.waypoints;
    const expectedWaypointNames = [
        'JESJI',
        'BAKRR',
        'MINEY',
        'HITME',
        'BOACH',
        'ZELMA',
        'JOTNU',
        'TNP',
        'OAL',
        'MLF',
        'PGS',
        'CEJAY',
        'KADDY',
        'TYSSN',
        'SUZSI',
        'PRINO',
    ];
    const waypointNames = _map(result, (waypointModel) => waypointModel.name);

    expect(_isArray(result)).toBe(true);
    expect(waypointNames).toEqual(expectedWaypointNames);
});

test('.absorbRouteModel() returns no-continuity message when routes have no common fixes', () => {
    const primaryModel = new RouteModel('CLARR..SKEBR..MDDOG..IPUMY');
    const otherModel = new RouteModel('BOACH..CRESO..BLD');
    const expectedResult = [false, 'routes do not have continuity!'];
    const result = primaryModel.absorbRouteModel(otherModel);

    expect(result).toEqual(expectedResult);
});

test('.absorbRouteModel() calls ._overwriteRouteBetweenWaypointNames() when provided route has two points of continuity with this route', () => {
    const primaryModel = new RouteModel('CLARR..SKEBR..MDDOG..IPUMY..TOMIS..LEMNZ..LOOSN');
    const otherModel = new RouteModel('MDDOG..JEBBB..BESSY..LEMNZ');
    const primaryModelOverwriteRouteBetweenWaypointNamesSpy = sinon.spy(
        primaryModel,
        '_overwriteRouteBetweenWaypointNames'
    );
    const expectedResult = [
        true,
        {
            log: 'rerouting to: CLARR SKEBR MDDOG JEBBB BESSY LEMNZ LOOSN',
            say: 'rerouting as requested',
        },
    ];
    const result = primaryModel.absorbRouteModel(otherModel);

    expect(result).toEqual(expectedResult);
    expect(
        primaryModelOverwriteRouteBetweenWaypointNamesSpy.calledWithExactly(
            'MDDOG',
            'LEMNZ',
            otherModel
        )
    ).toBe(true);
});

test('.absorbRouteModel() calls ._prependRouteModelEndingAtWaypointName() when provided route ends on a waypoint on this route', () => {
    const primaryModel = new RouteModel('CHRLT.V394.LAS');
    const otherModel = new RouteModel('GFS..WHIGG..CLARR');
    const primaryModelPrependRouteModelEndingAtWaypointNameSpy = sinon.spy(
        primaryModel,
        '_prependRouteModelEndingAtWaypointName'
    );
    const expectedResult = [
        true,
        { log: 'rerouting to: GFS WHIGG CLARR V394 LAS', say: 'rerouting as requested' },
    ];
    const result = primaryModel.absorbRouteModel(otherModel);

    expect(result).toEqual(expectedResult);
    expect(
        primaryModelPrependRouteModelEndingAtWaypointNameSpy.calledWithExactly('CLARR', otherModel)
    ).toBe(true);
});

test('.absorbRouteModel() calls ._appendRouteModelBeginningAtWaypointName() when provided route that begins on a waypoint on this route', () => {
    const primaryModel = new RouteModel('DAG.V394.LAS');
    const otherModel = new RouteModel('CLARR..TRREY..SOSOY');
    const primaryModelAppendRouteModelBeginningAtWaypointNameSpy = sinon.spy(
        primaryModel,
        '_appendRouteModelBeginningAtWaypointName'
    );
    const expectedResult = [
        true,
        { log: 'rerouting to: DAG V394 CLARR TRREY SOSOY', say: 'rerouting as requested' },
    ];
    const result = primaryModel.absorbRouteModel(otherModel);

    expect(result).toEqual(expectedResult);
    expect(
        primaryModelAppendRouteModelBeginningAtWaypointNameSpy.calledWithExactly(
            'CLARR',
            otherModel
        )
    ).toBe(true);
});

test('.activateHoldForWaypointName() returns early when the specified waypoint does not exist in the route', () => {
    const model = new RouteModel('DAG..KEPEC');
    const legModel1 = model._legCollection[0];
    const legModel2 = model._legCollection[1];
    const activateHoldForWaypointNameSpy1 = sinon.spy(legModel1, 'activateHoldForWaypointName');
    const activateHoldForWaypointNameSpy2 = sinon.spy(legModel2, 'activateHoldForWaypointName');
    const holdParametersMock = { turnDirection: 'left' };
    const result = model.activateHoldForWaypointName('PRINO', holdParametersMock);

    expect(typeof result === 'undefined').toBe(true);
    expect(activateHoldForWaypointNameSpy1.notCalled).toBe(true);
    expect(activateHoldForWaypointNameSpy2.notCalled).toBe(true);
});

test('.activateHoldForWaypointName() calls LegModel.activateHoldForWaypointName() with the appropriate arguments on the appropriate leg', () => {
    const model = new RouteModel('DAG..KEPEC');
    const legModel1 = model._legCollection[0];
    const legModel2 = model._legCollection[1];
    const activateHoldForWaypointNameSpy1 = sinon.spy(legModel1, 'activateHoldForWaypointName');
    const activateHoldForWaypointNameSpy2 = sinon.spy(legModel2, 'activateHoldForWaypointName');
    const holdParametersMock = { turnDirection: 'left' };
    const result = model.activateHoldForWaypointName('KEPEC', holdParametersMock);

    expect(typeof result).not.toBe('undefined');
    expect(activateHoldForWaypointNameSpy1.notCalled).toBe(true);
    expect(activateHoldForWaypointNameSpy2.calledWith('KEPEC', holdParametersMock)).toBe(true);
});

test('.activateHoldForWaypointName() uses fallbackHeading as inboundHeading when the specified waypoint is first in the route', () => {
    const model = new RouteModel('DAG..KEPEC');
    const fallbackInboundHeading = 1.2;
    const result = model.activateHoldForWaypointName(
        'DAG',
        EMPTY_HOLD_PARAMETERS_MOCK,
        fallbackInboundHeading
    );

    expect(result.inboundHeading).toBe(fallbackInboundHeading);
});

test('.activateHoldForWaypointName() uses leg course as inboundHeading when the specified waypoint is not first in the route', () => {
    const model = new RouteModel('DAG..KEPEC..IPUMY');
    const fallbackInboundHeading = 1.2;
    const expectedInboundHeading = 0.99;
    const result = model.activateHoldForWaypointName(
        'IPUMY',
        EMPTY_HOLD_PARAMETERS_MOCK,
        fallbackInboundHeading
    );
    const roundedHeading = Math.round(result.inboundHeading * 100) / 100;

    expect(roundedHeading).toBe(expectedInboundHeading);
    expect(result.inboundHeading).not.toBe(fallbackInboundHeading);
});

test('.activateHoldForWaypointName() returns the correct hold parameters for a procedural hold', () => {
    const model = new RouteModel('DAG.GRNPA8.KLAS07R');
    const fallbackInboundHeading = 1.2;
    const result = model.activateHoldForWaypointName(
        'IPUMY',
        EMPTY_HOLD_PARAMETERS_MOCK,
        fallbackInboundHeading
    );

    expect(result).toEqual(GRNPA8_HOLD_PARAMETERS_EXPECTED);
});

test('.activateHoldForWaypointName() returns the correct hold parameters for a procedural hold with custom holdParameters', () => {
    const model = new RouteModel('DAG.GRNPA8.KLAS07R');
    const fallbackInboundHeading = 1.2;
    const result = model.activateHoldForWaypointName(
        'IPUMY',
        CUSTOM_HOLD_PARAMETERS_MOCK,
        fallbackInboundHeading
    );

    expect(result).toEqual(CUSTOM_HOLD_PARAMETERS_EXECPTED);
});

test('.activateHoldForWaypointName() returns the correct hold parameters for a procedural hold when custom holdParameters had previously been set', () => {
    const model = new RouteModel('DAG.GRNPA8.KLAS07R');
    const fallbackInboundHeading = 1.2;
    const customResult = model.activateHoldForWaypointName(
        'IPUMY',
        CUSTOM_HOLD_PARAMETERS_MOCK,
        fallbackInboundHeading
    );
    const result = model.activateHoldForWaypointName(
        'IPUMY',
        EMPTY_HOLD_PARAMETERS_MOCK,
        fallbackInboundHeading
    );

    expect(customResult).toEqual(CUSTOM_HOLD_PARAMETERS_EXECPTED);
    expect(result).toEqual(GRNPA8_HOLD_PARAMETERS_EXPECTED);
});

test('._createLegModelsFromWaypointModels() returns an array of LegModels matching the specified array of WaypointModels', () => {
    const model = new RouteModel('TNP.KEPEC3.KLAS07R');

    model.skipToWaypointName('KIMME');

    const result = model._createLegModelsFromWaypointModels(model.currentLeg._waypointCollection);
    const expectedWaypointNames = ['KIMME', 'CHIPZ', 'POKRR', 'PRINO'];
    const waypointNames = result.map((legModel) => legModel.routeString);

    expect(_isArray(result)).toBe(true);
    expect(_every(result, (legModel) => legModel instanceof LegModel)).toBe(true);
    expect(waypointNames).toEqual(expectedWaypointNames);
});

test('.getAltitudeRestrictedWaypoints() returns an array of WaypointModels that have altitude restrictions', () => {
    const model = new RouteModel(singleSidProcedureSegmentRouteStringMock);
    const result = model.getAltitudeRestrictedWaypoints();
    const expectedWaypointNames = ['BAKRR', 'MINEY', 'BOACH'];
    const waypointNames = result.map((waypoint) => waypoint.name);
    const allWaypointsHaveRestrictions = _every(
        result,
        (waypoint) => waypoint.hasAltitudeRestriction
    );

    expect(waypointNames).toEqual(expectedWaypointNames);
    expect(allWaypointsHaveRestrictions).toBe(true);
});

test('.getArrivalRunwayAirportIcao() returns null if there is no STAR leg', () => {
    const model = new RouteModel(singleSidProcedureSegmentRouteStringMock);
    const expectedResult = null;
    const result = model.getArrivalRunwayAirportIcao();

    expect(result === expectedResult).toBe(true);
});

test(".getArrivalRunwayAirportIcao() returns the appropriate runway's airport's ICAO identifier", () => {
    const model = new RouteModel('TNP.KEPEC3.KLAS07R');
    const expectedResult = 'klas';
    const result = model.getArrivalRunwayAirportIcao();

    expect(result === expectedResult).toBe(true);
});

test('.getArrivalRunwayAirportModel() returns null when there is no STAR leg', () => {
    const model = new RouteModel(singleSidProcedureSegmentRouteStringMock);
    const expectedResult = null;
    const result = model.getArrivalRunwayAirportModel();

    expect(result === expectedResult).toBe(true);
});

test(".getArrivalRunwayAirportModel() returns the appropriate runway's AirportModel", () => {
    const model = new RouteModel('TNP.KEPEC3.KLAS07R');
    const expectedAirportIcao = 'klas';
    const result = model.getArrivalRunwayAirportModel();

    expect(result instanceof AirportModel).toBe(true);
    expect(result.icao === expectedAirportIcao).toBe(true);
});

test('.getArrivalRunwayName() returns null when there is no STAR leg', () => {
    const model = new RouteModel(singleSidProcedureSegmentRouteStringMock);
    const expectedResult = null;
    const result = model.getArrivalRunwayName();

    expect(result === expectedResult).toBe(true);
});

test('.getArrivalRunwayName() returns the appropriate runway name', () => {
    const model = new RouteModel('TNP.KEPEC3.KLAS07R');
    const expectedResult = '07R';
    const result = model.getArrivalRunwayName();

    expect(result === expectedResult).toBe(true);
});

test('.getArrivalRunwayModel() returns null when there is no STAR leg', () => {
    const model = new RouteModel(singleSidProcedureSegmentRouteStringMock);
    const expectedResult = null;
    const result = model.getArrivalRunwayModel();

    expect(result === expectedResult).toBe(true);
});

test('.getArrivalRunwayModel() returns the appropriate RunwayModel', () => {
    const model = new RouteModel('TNP.KEPEC3.KLAS07R');
    const expectedRunwayName = '07R';
    const result = model.getArrivalRunwayModel();

    expect(result.name === expectedRunwayName).toBe(true);
});

test('.getBottomAltitude() returns -1 when there is no bottom altitude in the route', () => {
    const model = new RouteModel(singleDirectSegmentRouteStringMock);
    const expectedResult = -1;
    const result = model.getBottomAltitude();

    expect(result === expectedResult).toBe(true);
});

test('.getBottomAltitude() returns the lowest #altitudeMinimum of any LegModel in the #_legCollection', () => {
    const model = new RouteModel('TNP.KEPEC3.KLAS07R..DRK.ZIMBO1.KLAS07R');
    const expectedResult = 6000;
    const result = model.getBottomAltitude();

    expect(result === expectedResult).toBe(true);
});

test('.getDepartureRunwayAirportIcao() returns null if there is no SID leg', () => {
    const model = new RouteModel(singleStarProcedureSegmentRouteStringMock);
    const expectedResult = null;
    const result = model.getDepartureRunwayAirportIcao();

    expect(result === expectedResult).toBe(true);
});

test(".getDepartureRunwayAirportIcao() returns the appropriate runway's airport's ICAO identifier", () => {
    const model = new RouteModel('KLAS07R.BOACH6.TNP');
    const expectedResult = 'klas';
    const result = model.getDepartureRunwayAirportIcao();

    expect(result === expectedResult).toBe(true);
});

test('.getDepartureRunwayAirportModel() returns null when there is no SID leg', () => {
    const model = new RouteModel(singleStarProcedureSegmentRouteStringMock);
    const expectedResult = null;
    const result = model.getDepartureRunwayAirportModel();

    expect(result === expectedResult).toBe(true);
});

test(".getDepartureRunwayAirportModel() returns the appropriate runway's AirportModel", () => {
    const model = new RouteModel('KLAS07R.BOACH6.TNP');
    const expectedAirportIcao = 'klas';
    const result = model.getDepartureRunwayAirportModel();

    expect(result instanceof AirportModel).toBe(true);
    expect(result.icao === expectedAirportIcao).toBe(true);
});

test('.getDepartureRunwayName() returns null when there is no SID leg', () => {
    const model = new RouteModel(singleStarProcedureSegmentRouteStringMock);
    const expectedResult = null;
    const result = model.getDepartureRunwayName();

    expect(result === expectedResult).toBe(true);
});

test('.getDepartureRunwayName() returns the appropriate runway name', () => {
    const model = new RouteModel('KLAS07R.BOACH6.TNP');
    const expectedResult = '07R';
    const result = model.getDepartureRunwayName();

    expect(result === expectedResult).toBe(true);
});

test('.getDepartureRunwayModel() returns null when there is no SID leg', () => {
    const model = new RouteModel(singleStarProcedureSegmentRouteStringMock);
    const expectedResult = null;
    const result = model.getDepartureRunwayModel();

    expect(result === expectedResult).toBe(true);
});

test('.getDepartureRunwayModel() returns the appropriate RunwayModel', () => {
    const model = new RouteModel('KLAS07R.BOACH6.TNP');
    const expectedRunwayName = '07R';
    const result = model.getDepartureRunwayModel();

    expect(result.name === expectedRunwayName).toBe(true);
});

test('.getFullRouteString() returns a route string for the entire route, including past legs, in dot notation', () => {
    const model = new RouteModel(nightmareRouteStringMock);

    model.skipToWaypointName('GUP');

    const result = model.getFullRouteString();

    expect(result === nightmareRouteStringMock).toBe(true);
});

test('.getFullRouteStringWithoutAirportsWithSpaces() returns the full route string, with airports removed, with spaces', () => {
    const model = new RouteModel(nightmareRouteStringMock);

    model.skipToWaypointName('GUP');

    const expectedResult = 'TNP KEPEC3 BOACH6 TNP OAL PGS TYSSN4 BOACH6 TNP GUP IGM';
    const result = model.getFullRouteStringWithoutAirportsWithSpaces();

    expect(result === expectedResult).toBe(true);
});

test('.getFullRouteStringWithSpaces() returns a route string for the entire route, including past legs, separated by spaces', () => {
    const model = new RouteModel(nightmareRouteStringMock);

    model.skipToWaypointName('GUP');

    const expectedResult =
        'TNP KEPEC3 KLAS07R BOACH6 TNP OAL PGS TYSSN4 KLAS07R BOACH6 TNP GUP IGM';
    const result = model.getFullRouteStringWithSpaces();

    expect(result === expectedResult).toBe(true);
});

test('.getRouteString() returns a route string for the remaining legs only, in dot notation', () => {
    const model = new RouteModel(nightmareRouteStringMock);

    model.skipToWaypointName('GUP');

    const result = model.getRouteString();

    expect(result === 'GUP..IGM').toBe(true);
});

test('.getRouteStringWithSpaces() returns a route string for the remaining legs only, separated by spaces', () => {
    const model = new RouteModel(nightmareRouteStringMock);

    model.skipToWaypointName('GUP');

    const result = model.getRouteStringWithSpaces();

    expect(result === 'GUP IGM').toBe(true);
});

test('.getFlightPlanEntry() returns the exit fixname of a SID procedure', () => {
    const procedureRouteModel = new RouteModel(singleSidProcedureSegmentRouteStringMock);
    const expectedResult = 'TNP';
    const result = procedureRouteModel.getFlightPlanEntry();

    expect(result === expectedResult).toBe(true);
});

test('.getFlightPlanEntry() returns the exit fixname of the SID leg when part of a complex route', () => {
    const routeString = 'KLAS07R.BOACH6.TNP..OAL..COWBY';
    const fixRouteModel = new RouteModel(routeString);
    const expectedResult = 'TNP';
    const result = fixRouteModel.getFlightPlanEntry();

    expect(result === expectedResult).toBe(true);
});

test('.getFlightPlanEntry() returns first fix in route when no procedure is defined', () => {
    const fixRouteModel = new RouteModel(multiDirectSegmentRouteStringMock);
    const expectedResult = 'OAL';
    const result = fixRouteModel.getFlightPlanEntry();

    expect(result === expectedResult).toBe(true);
});

test('.getSidIcao() returns undefined when there is no SID leg in the route', () => {
    const model = new RouteModel(singleStarProcedureSegmentRouteStringMock);
    const result = model.getSidIcao();

    expect(typeof result === 'undefined').toBe(true);
});

test('.getSidIcao() returns the ICAO identifier for the SID procedure in the route', () => {
    const model = new RouteModel(complexRouteStringMock);
    const result = model.getSidIcao();

    expect(result === 'BOACH6').toBe(true);
});

test('.getSidName() returns undefined when there is no SID leg in the route', () => {
    const model = new RouteModel(singleStarProcedureSegmentRouteStringMock);
    const result = model.getSidName();

    expect(typeof result === 'undefined').toBe(true);
});

test('.getSidName() returns the spoken name of the SID procedure in the route', () => {
    const model = new RouteModel(complexRouteStringMock);
    const result = model.getSidName();

    expect(result === 'Boach Six').toBe(true);
});

test('.getStarIcao() returns undefined when there is no STAR leg in the route', () => {
    const model = new RouteModel(singleSidProcedureSegmentRouteStringMock);
    const result = model.getStarIcao();

    expect(typeof result === 'undefined').toBe(true);
});

test('.getStarIcao() returns the ICAO identifier for the STAR procedure in the route', () => {
    const model = new RouteModel(complexRouteStringMock);
    const result = model.getStarIcao();

    expect(result === 'TYSSN4').toBe(true);
});

test('.getStarName() returns undefined when there is no STAR leg in the route', () => {
    const model = new RouteModel(singleSidProcedureSegmentRouteStringMock);
    const result = model.getStarName();

    expect(typeof result === 'undefined').toBe(true);
});

test('.getStarName() returns the spoken name of the STAR procedure in the route', () => {
    const model = new RouteModel(complexRouteStringMock);
    const result = model.getStarName();

    expect(result === 'Tyson Four').toBe(true);
});

test('.getTopAltitude() returns -1 when there is no top altitude in the route', () => {
    const model = new RouteModel(singleDirectSegmentRouteStringMock);
    const expectedResult = -1;
    const result = model.getTopAltitude();

    expect(result === expectedResult).toBe(true);
});

test('.getTopAltitude() returns the highest #altitudeMaximum of any LegModel in the #_legCollection', () => {
    const model = new RouteModel('KLAS25R.BOACH6.HEC..KLAS25R.SHEAD9.KENNO');
    const expectedResult = 11000;
    const result = model.getTopAltitude();

    expect(result === expectedResult).toBe(true);
});

test('.hasNextLeg() returns false when the current leg is the last in the #_legCollection', () => {
    const model = new RouteModel(singleSidProcedureSegmentRouteStringMock);
    const result = model.hasNextLeg();

    expect(result).toBe(false);
});

test('.hasNextLeg() returns true when there is a leg in the #_legCollection after the current leg', () => {
    const model = new RouteModel(nightmareRouteStringMock);
    const result = model.hasNextLeg();

    expect(result).toBe(true);
});

test('.hasNextWaypoint() returns false when we are at the last waypoint of the last leg', () => {
    const model = new RouteModel(singleFixRouteStringMock);
    const result = model.hasNextWaypoint();

    expect(result).toBe(false);
});

test('.hasNextWaypoint() returns true when the current leg contains more waypoints', () => {
    const model = new RouteModel(singleSidProcedureSegmentRouteStringMock);
    const result = model.hasNextWaypoint();

    expect(result).toBe(true);
});

test('.hasNextWaypoint() returns true when we are at the last waypoint of a leg that is not the last leg', () => {
    const model = new RouteModel(multiDirectSegmentRouteStringMock);
    const result = model.hasNextWaypoint();

    expect(result).toBe(true);
});

test('.hasWaypointName() returns false when the specified waypoint is not in the route', () => {
    const model = new RouteModel('DVC');
    const result = model.hasWaypointName('MLF');

    expect(result).toBe(false);
});

test('.hasWaypointName() returns true when the specified waypoint is in the route', () => {
    const model = new RouteModel(singleSidProcedureSegmentRouteStringMock);
    const result = model.hasWaypointName('ZELMA');

    expect(result).toBe(true);
});

test('.isRunwayModelValidForSid() returns false if passed runway is not an instance of RunwayModel', () => {
    const model = new RouteModel(complexRouteStringMock);
    const airportModel = createAirportModelFixture();
    const runwayModel = airportModel.getRunway('00');
    const result = model.isRunwayModelValidForSid(runwayModel);

    expect(result).toBe(false);
});

test('.isRunwayModelValidForSid() returns true if the flight plan does not contain a SID', () => {
    const model = new RouteModel(multiDirectSegmentRouteStringMock);
    const airportModel = createAirportModelFixture();
    const runwayModel = airportModel.getRunway('01R');
    const result = model.isRunwayModelValidForSid(runwayModel);

    expect(result).toBe(true);
});

test('.isRunwayModelValidForSid() returns false if the specified runway exists and is not valid for the assigned SID', () => {
    const model = new RouteModel(complexRouteStringMock);
    const airportModel = createAirportModelFixture();
    const runwayModel = airportModel.getRunway('01R');
    const result = model.isRunwayModelValidForSid(runwayModel);

    expect(result).toBe(false);
});

test('.isRunwayModelValidForSid() returns true if the specified runway exists and is valid for the assigned SID', () => {
    const model = new RouteModel(complexRouteStringMock);
    const airportModel = createAirportModelFixture();
    const runwayModel = airportModel.getRunway('25R');
    const result = model.isRunwayModelValidForSid(runwayModel);

    expect(result).toBe(true);
});

test('.isRunwayModelValidForStar() returns false if passed runway is not an instance of RunwayModel', () => {
    const model = new RouteModel(complexRouteStringMock);
    const airportModel = createAirportModelFixture();
    const runwayModel = airportModel.getRunway('00');
    const result = model.isRunwayModelValidForStar(runwayModel);

    expect(result).toBe(false);
});

test('.isRunwayModelValidForStar() returns true if the flight plan does not contain a STAR', () => {
    const model = new RouteModel(multiDirectSegmentRouteStringMock);
    const airportModel = createAirportModelFixture();
    const runwayModel = airportModel.getRunway('01R');
    const result = model.isRunwayModelValidForStar(runwayModel);

    expect(result).toBe(true);
});

test('.isRunwayModelValidForStar() returns false if the specified runway exists and is not valid for the assigned STAR', () => {
    const model = new RouteModel(complexRouteStringMock);
    const airportModel = createAirportModelFixture();
    const runwayModel = airportModel.getRunway('01R');
    const result = model.isRunwayModelValidForStar(runwayModel);

    expect(result).toBe(false);
});

test('.isRunwayModelValidForStar() returns true if the specified runway exists and is valid for the assigned STAR', () => {
    const model = new RouteModel(complexRouteStringMock);
    const airportModel = createAirportModelFixture();
    const runwayModel = airportModel.getRunway('25R');
    const result = model.isRunwayModelValidForStar(runwayModel);

    expect(result).toBe(true);
});

test('.moveToNextWaypoint() calls #currentLeg.moveToNextWaypoint() when the current leg contains more waypoints', () => {
    const model = new RouteModel(singleSidProcedureSegmentRouteStringMock);
    const currentLegMoveToNextWaypointSpy = sinon.spy(model.currentLeg, 'moveToNextWaypoint');

    model.moveToNextWaypoint();

    expect(currentLegMoveToNextWaypointSpy.calledWithExactly()).toBe(true);
});

test('.moveToNextWaypoint() calls .moveToNextLeg() when the current leg is at its last waypoint', () => {
    const model = new RouteModel(multiDirectSegmentRouteStringMock);
    const moveToNextLegSpy = sinon.spy(model, 'moveToNextLeg');

    model.moveToNextWaypoint();

    expect(moveToNextLegSpy.calledWithExactly()).toBe(true);
});

test('.replaceArrivalProcedure() returns false when route string does not yield a valid leg', () => {
    const model = new RouteModel(singleFixRouteStringMock);
    const result = model.replaceArrivalProcedure('gobbledeegook');

    expect(result).toBe(false);
    expect(model.waypoints.length === 1).toBe(true);
});

test('.replaceArrivalProcedure() appends specified STAR leg as the new last leg when no STAR leg previously existed', () => {
    const model = new RouteModel(singleFixRouteStringMock);
    const result = model.replaceArrivalProcedure(singleStarProcedureSegmentRouteStringMock);

    expect(result).toBe(true);
    expect(
        model.getRouteString() ===
            `${singleFixRouteStringMock}..${singleStarProcedureSegmentRouteStringMock}`
    ).toBe(true);
});

test('.replaceArrivalProcedure() replaces STAR leg with a new one when the route already has a STAR leg', () => {
    const model = new RouteModel(singleStarProcedureSegmentRouteStringMock);
    const differentStarRouteStringMock = 'TNP.KEPEC3.KLAS25L';
    const result = model.replaceArrivalProcedure(differentStarRouteStringMock);

    expect(result).toBe(true);
    expect(model.getRouteString() === differentStarRouteStringMock).toBe(true);
});

test('.replaceDepartureProcedure() returns false when route string does not yield a valid leg', () => {
    const expectedResponse = [false, 'requested route of "GOBBLEDEEGOOK" is invalid'];
    const model = new RouteModel(singleFixRouteStringMock);
    const response = model.replaceDepartureProcedure('gobbledeegook');

    expect(response).toEqual(expectedResponse);
    expect(model.waypoints.length === 1).toBe(true);
});

test('.replaceDepartureProcedure() appends specified SID leg as the new first leg when no SID leg previously existed', () => {
    const expectedResponse = [
        true,
        { log: 'rerouting to: KLAS19L TRALR6 DVC', say: 'rerouting as requested' },
    ];
    const model = new RouteModel(singleFixRouteStringMock);
    const response = model.replaceDepartureProcedure('KLAS19L.TRALR6.DVC');

    expect(response).toEqual(expectedResponse);
    expect(model.getRouteString() === 'KLAS19L.TRALR6.DVC').toBe(true);
});

test('.replaceDepartureProcedure() replaces SID leg with a new one when the route already has a SID leg', () => {
    const expectedResponse = [
        true,
        { log: 'rerouting to: KLAS25L BOACH6 TNP', say: 'rerouting as requested' },
    ];
    const model = new RouteModel(singleSidProcedureSegmentRouteStringMock);
    const differentSidRouteStringMock = 'KLAS25L.BOACH6.TNP';
    const response = model.replaceDepartureProcedure(differentSidRouteStringMock);

    expect(response).toEqual(expectedResponse);
    expect(model.getRouteString() === differentSidRouteStringMock).toBe(true);
});

test('.moveToNextLeg() returns early when we are at the last leg in the route', () => {
    const model = new RouteModel(singleSidProcedureSegmentRouteStringMock);

    model.moveToNextLeg();

    expect(_isEmpty(model._previousLegCollection)).toBe(true);
    expect(model._legCollection.length === 1).toBe(true);
});

test('.moveToNextLeg() moves the #currentLeg from the #_legCollection to the #_previousLegCollection', () => {
    const model = new RouteModel('OAL..TNP.KEPEC3.KLAS07R');

    expect(model._previousLegCollection.length === 0).toBe(true);
    expect(model._legCollection.length === 2).toBe(true);

    model.moveToNextLeg();

    expect(model._previousLegCollection.length === 1).toBe(true);
    expect(model._previousLegCollection[0].routeString === 'OAL').toBe(true);
    expect(model._legCollection.length === 1).toBe(true);
    expect(model._legCollection[0].routeString === 'TNP.KEPEC3.KLAS07R').toBe(true);
});

test('.skipToWaypointName() returns false when the specified waypoint is not in the route', () => {
    const model = new RouteModel(singleStarProcedureSegmentRouteStringMock);
    const result = model.skipToWaypointName('gobbledeegook');

    expect(result).toBe(false);
    expect(model._legCollection.length === 1).toBe(true);
});

test('.skipToWaypointName() calls #currentLeg.skipToWaypointName() when current leg contains the specified waypoint', () => {
    const model = new RouteModel(singleStarProcedureSegmentRouteStringMock);
    const currentLegSkipToWaypointNameSpy = sinon.spy(model.currentLeg, 'skipToWaypointName');
    const waypointNameToSkipTo = 'KEPEC';

    model.skipToWaypointName(waypointNameToSkipTo);

    expect(currentLegSkipToWaypointNameSpy.calledWithExactly(waypointNameToSkipTo)).toBe(true);
});

test('.skipToWaypointName() moves appropriate legs/waypoints to previous collections when specified waypoint exists in a future leg', () => {
    const model = new RouteModel('OAL..TNP.KEPEC3.KLAS07R');

    model.skipToWaypointName('KEPEC');

    expect(model._previousLegCollection.length === 1).toBe(true);
    expect(model._previousLegCollection[0].routeString === 'OAL').toBe(true);
    expect(model._legCollection.length === 1).toBe(true);
    expect(model._legCollection[0].routeString === 'TNP.KEPEC3.KLAS07R').toBe(true);
    expect(model._legCollection[0]._waypointCollection.length === 8).toBe(true);
    expect(model._legCollection[0]._previousWaypointCollection.length === 5).toBe(true);
});

test('.updateSidLegForDepartureRunwayModel() returns early when the route contains no SID leg to update', () => {
    const routeModel = new RouteModel('OAL..TNP');
    const airportModel = createAirportModelFixture();
    const nextRunwayName = '25L';
    const nextRunwayModel = airportModel.getRunway(nextRunwayName);
    const sidLegUpdateSidRunwaySpy = sinon.spy(
        routeModel._legCollection[0],
        'updateSidLegForDepartureRunwayModel'
    );

    routeModel.updateSidLegForDepartureRunwayModel(nextRunwayModel);

    expect(sidLegUpdateSidRunwaySpy.notCalled).toBe(true);
});

test('.updateSidLegForDepartureRunwayModel() calls LegModel.updateStarLegForArrivalRunwayModel() on the SID leg', () => {
    const routeModel = new RouteModel('KLAS07R.BOACH6.TNP');
    const airportModel = createAirportModelFixture();
    const nextRunwayName = '25L';
    const nextRunwayModel = airportModel.getRunway(nextRunwayName);
    const sidLegUpdateSidRunwaySpy = sinon.spy(
        routeModel._legCollection[0],
        'updateSidLegForDepartureRunwayModel'
    );

    routeModel.updateSidLegForDepartureRunwayModel(nextRunwayModel);

    expect(sidLegUpdateSidRunwaySpy.calledWithExactly(nextRunwayModel)).toBe(true);
});

test('.updateStarLegForArrivalRunwayModel() returns early when the route contains no STAR leg to update', () => {
    const routeModel = new RouteModel('OAL..TNP');
    const airportModel = createAirportModelFixture();
    const nextRunwayName = '25L';
    const nextRunwayModel = airportModel.getRunway(nextRunwayName);
    const createAmendedStarLegSpy = sinon.spy(
        routeModel,
        '_createAmendedStarLegUsingDifferentExitName'
    );

    const result = routeModel.updateStarLegForArrivalRunwayModel(nextRunwayModel);

    expect(createAmendedStarLegSpy.notCalled).toBe(true);
    expect(typeof result === 'undefined').toBe(true);
});

test('.updateStarLegForArrivalRunwayModel() returns early when the runway is not valid for the current STAR', () => {
    const routeModel = new RouteModel('DRK.ZIMBO1.KLAS07R');
    const airportModel = createAirportModelFixture();
    const nextRunwayName = '25L';
    const nextRunwayModel = airportModel.getRunway(nextRunwayName);
    const createAmendedStarLegSpy = sinon.spy(
        routeModel,
        '_createAmendedStarLegUsingDifferentExitName'
    );
    const result = routeModel.updateStarLegForArrivalRunwayModel(nextRunwayModel);

    expect(createAmendedStarLegSpy.notCalled).toBe(true);
    expect(typeof result === 'undefined').toBe(true);
});

test('.updateStarLegForArrivalRunwayModel() replaces the STAR leg with a newly created one using the correct parameters', () => {
    const routeModel = new RouteModel('TNP.KEPEC3.KLAS07R');
    const airportModel = createAirportModelFixture();
    const nextRunwayName = '25L';
    const nextRunwayModel = airportModel.getRunway(nextRunwayName);
    const createAmendedStarLegSpy = sinon.spy(
        routeModel,
        '_createAmendedStarLegUsingDifferentExitName'
    );
    const result = routeModel.updateStarLegForArrivalRunwayModel(nextRunwayModel);

    expect(createAmendedStarLegSpy.calledWithExactly('KLAS25L', 0)).toBe(true);
    expect(typeof result === 'undefined').toBe(true);
});

test('.reset() clears #_legCollection', () => {
    const model = new RouteModel(complexRouteStringMock);

    model.reset();

    expect(_isArray(model._legCollection)).toBe(true);
    expect(model._legCollection.length === 0).toBe(true);
});

test('._appendRouteModelBeginningAtWaypointName() throws when leg type is not airway/direct/SID/STAR', () => {
    const primaryModel = new RouteModel('CLARR..SKEBR..MDDOG..IPUMY');
    const otherModel = new RouteModel('SKEBR..CRESO..BLD');

    primaryModel._legCollection[1]._legType = 'nonsensical';

    expect(() =>
        primaryModel._appendRouteModelBeginningAtWaypointName('SKEBR', otherModel)
    ).toThrow();
});

test('._appendRouteModelBeginningAtWaypointName() calls ._appendRouteModelOutOfAirwayLeg() when divergent leg is airway leg', () => {
    const primaryModel = new RouteModel('DAG.V394.LAS');
    const otherModel = new RouteModel('CLARR..TRREY..SOSOY');
    const primaryModelAppendRouteModelOutOfAirwayLegSpy = sinon.spy(
        primaryModel,
        '_appendRouteModelOutOfAirwayLeg'
    );
    const expectedResult = [
        true,
        { log: 'rerouting to: DAG V394 CLARR TRREY SOSOY', say: 'rerouting as requested' },
    ];
    const result = primaryModel._appendRouteModelBeginningAtWaypointName('CLARR', otherModel);

    expect(result).toEqual(expectedResult);
    expect(
        primaryModelAppendRouteModelOutOfAirwayLegSpy.calledWithExactly('CLARR', otherModel)
    ).toBe(true);
});

test('._appendRouteModelBeginningAtWaypointName() calls ._appendRouteModelOutOfDirectLeg() when divergent leg is direct leg', () => {
    const primaryModel = new RouteModel('CLARR..SKEBR..MDDOG..IPUMY');
    const otherModel = new RouteModel('SKEBR..CRESO..BLD');
    const primaryModelAppendRouteModelOutOfDirectLegSpy = sinon.spy(
        primaryModel,
        '_appendRouteModelOutOfDirectLeg'
    );
    const expectedResult = [
        true,
        { log: 'rerouting to: CLARR SKEBR CRESO BLD', say: 'rerouting as requested' },
    ];
    const result = primaryModel._appendRouteModelBeginningAtWaypointName('SKEBR', otherModel);

    expect(result).toEqual(expectedResult);
    expect(
        primaryModelAppendRouteModelOutOfDirectLegSpy.calledWithExactly('SKEBR', otherModel)
    ).toBe(true);
});

test('._appendRouteModelBeginningAtWaypointName() calls ._appendRouteModelOutOfSidLeg() when divergent leg is SID leg', () => {
    const primaryModel = new RouteModel('KLAS07R.BOACH6.HEC');
    const otherModel = new RouteModel('BOACH..SKEBR..TARRK');
    const primaryModelAppendRouteModelOutOfSidLegSpy = sinon.spy(
        primaryModel,
        '_appendRouteModelOutOfSidLeg'
    );
    const expectedResult = [
        true,
        {
            log: 'rerouting to: JESJI BAKRR MINEY HITME BOACH SKEBR TARRK',
            say: 'rerouting as requested',
        },
    ];
    const result = primaryModel._appendRouteModelBeginningAtWaypointName('BOACH', otherModel);

    expect(result).toEqual(expectedResult);
    expect(primaryModelAppendRouteModelOutOfSidLegSpy.calledWithExactly('BOACH', otherModel)).toBe(
        true
    );
});

test('._appendRouteModelBeginningAtWaypointName() calls ._appendRouteModelOutOfStarLeg() when divergent leg is STAR leg', () => {
    const primaryModel = new RouteModel('DVC.GRNPA1.KLAS07R');
    const otherModel = new RouteModel('LUXOR..WINDS..CRESO');
    const primaryModelAppendRouteModelOutOfStarLegSpy = sinon.spy(
        primaryModel,
        '_appendRouteModelOutOfStarLeg'
    );
    const expectedResult = [
        true,
        {
            log: 'rerouting to: DVC BETHL HOLDM KSINO LUXOR WINDS CRESO',
            say: 'rerouting as requested',
        },
    ];
    const result = primaryModel._appendRouteModelBeginningAtWaypointName('LUXOR', otherModel);

    expect(result).toEqual(expectedResult);
    expect(primaryModelAppendRouteModelOutOfStarLegSpy.calledWithExactly('LUXOR', otherModel)).toBe(
        true
    );
});

test('._appendRouteModelOutOfAirwayLeg() correctly places RouteModel and adjusts airway exit', () => {
    const primaryModel = new RouteModel('DAG.V394.LAS');
    const otherModel = new RouteModel('CLARR..TRREY..SOSOY');
    const expectedResult = [
        true,
        { log: 'rerouting to: DAG V394 CLARR TRREY SOSOY', say: 'rerouting as requested' },
    ];
    const result = primaryModel._appendRouteModelOutOfAirwayLeg('CLARR', otherModel);

    expect(result).toEqual(expectedResult);
    expect(primaryModel._legCollection.length === 4).toBe(true);
    expect(primaryModel._legCollection[0].routeString === 'DAG.V394.CLARR').toBe(true);
    expect(primaryModel._legCollection[1].routeString === 'CLARR').toBe(true);
    expect(primaryModel._legCollection[2].routeString === 'TRREY').toBe(true);
    expect(primaryModel._legCollection[3].routeString === 'SOSOY').toBe(true);
});

test('._appendRouteModelOutOfDirectLeg() correctly places RouteModel', () => {
    const primaryModel = new RouteModel('CLARR..SKEBR..MDDOG..IPUMY');
    const otherModel = new RouteModel('SKEBR..CRESO..BLD');
    const expectedResult = [
        true,
        { log: 'rerouting to: CLARR SKEBR CRESO BLD', say: 'rerouting as requested' },
    ];
    const result = primaryModel._appendRouteModelOutOfDirectLeg('SKEBR', otherModel);

    expect(result).toEqual(expectedResult);
    expect(primaryModel._legCollection.length === 4).toBe(true);
    expect(primaryModel._legCollection[0].routeString === 'CLARR').toBe(true);
    expect(primaryModel._legCollection[1].routeString === 'SKEBR').toBe(true);
    expect(primaryModel._legCollection[2].routeString === 'CRESO').toBe(true);
    expect(primaryModel._legCollection[3].routeString === 'BLD').toBe(true);
});

test('._appendRouteModelOutOfSidLeg() correctly places RouteModel and explodes remaining SID waypoints into legs', () => {
    const primaryModel = new RouteModel('KLAS07R.BOACH6.HEC');
    const otherModel = new RouteModel('BOACH..SKEBR..TARRK');
    const expectedResult = [
        true,
        {
            log: 'rerouting to: JESJI BAKRR MINEY HITME BOACH SKEBR TARRK',
            say: 'rerouting as requested',
        },
    ];
    const result = primaryModel._appendRouteModelOutOfSidLeg('BOACH', otherModel);

    expect(result).toEqual(expectedResult);
    expect(primaryModel._legCollection.length === 7).toBe(true);
    expect(primaryModel._legCollection[0].routeString === 'JESJI').toBe(true);
    expect(primaryModel._legCollection[1].routeString === 'BAKRR').toBe(true);
    expect(primaryModel._legCollection[2].routeString === 'MINEY').toBe(true);
    expect(primaryModel._legCollection[3].routeString === 'HITME').toBe(true);
    expect(primaryModel._legCollection[4].routeString === 'BOACH').toBe(true);
    expect(primaryModel._legCollection[5].routeString === 'SKEBR').toBe(true);
    expect(primaryModel._legCollection[6].routeString === 'TARRK').toBe(true);
});

test('._appendRouteModelOutOfStarLeg() correctly places RouteModel and changes STAR exit when divergent fix is a valid exit', () => {
    const primaryModel = new RouteModel('BCE.GRNPA1.KLAS07R');
    const otherModel = new RouteModel('DUBLX..PRINO..RELIN');
    const expectedResult = [
        true,
        { log: 'rerouting to: BCE GRNPA1 DUBLX PRINO RELIN', say: 'rerouting as requested' },
    ];
    const result = primaryModel._appendRouteModelOutOfStarLeg('DUBLX', otherModel);

    expect(result).toEqual(expectedResult);
    expect(primaryModel._legCollection.length === 4).toBe(true);
    expect(primaryModel._legCollection[0].routeString === 'BCE.GRNPA1.DUBLX').toBe(true);
    expect(primaryModel._legCollection[1].routeString === 'DUBLX').toBe(true);
    expect(primaryModel._legCollection[2].routeString === 'PRINO').toBe(true);
    expect(primaryModel._legCollection[3].routeString === 'RELIN').toBe(true);
});

test('._appendRouteModelOutOfStarLeg() correctly places RouteModel and explodes remaining STAR waypoints into legs', () => {
    const primaryModel = new RouteModel('DVC.GRNPA1.KLAS07R');
    const otherModel = new RouteModel('LUXOR..WINDS..CRESO');
    const expectedResult = [
        true,
        {
            log: 'rerouting to: DVC BETHL HOLDM KSINO LUXOR WINDS CRESO',
            say: 'rerouting as requested',
        },
    ];
    const result = primaryModel._appendRouteModelOutOfStarLeg('LUXOR', otherModel);

    expect(result).toEqual(expectedResult);
    expect(primaryModel._legCollection.length === 7).toBe(true);
    expect(primaryModel._legCollection[0].routeString === 'DVC').toBe(true);
    expect(primaryModel._legCollection[1].routeString === 'BETHL').toBe(true);
    expect(primaryModel._legCollection[2].routeString === 'HOLDM').toBe(true);
    expect(primaryModel._legCollection[3].routeString === 'KSINO').toBe(true);
    expect(primaryModel._legCollection[4].routeString === 'LUXOR').toBe(true);
    expect(primaryModel._legCollection[5].routeString === 'WINDS').toBe(true);
    expect(primaryModel._legCollection[6].routeString === 'CRESO').toBe(true);
});

test.todo('._combineRouteStrings()');

test('._createAmendedAirwayLegUsingDifferentEntryName() returns a new LegModel with the same airway and exit, with new specified entry', () => {
    const model = new RouteModel('CHRLT.V394.LAS');
    const nextEntryFixName = 'CLARR';
    const legIndex = 0;
    const result = model._createAmendedAirwayLegUsingDifferentEntryName(nextEntryFixName, legIndex);

    expect(result instanceof LegModel).toBe(true);
    expect(result.routeString === 'CLARR.V394.LAS').toBe(true);
});

test('._createAmendedAirwayLegUsingDifferentExitName() returns a new LegModel with same airway and entry, with new specified exit', () => {
    const model = new RouteModel('DAG.V394.LAS');
    const nextExitFixName = 'CLARR';
    const legIndex = 0;
    const result = model._createAmendedAirwayLegUsingDifferentExitName(nextExitFixName, legIndex);

    expect(result instanceof LegModel).toBe(true);
    expect(result.routeString === 'DAG.V394.CLARR').toBe(true);
});

test('._createAmendedConvergentLeg() throws when leg is not an airway/direct/SID/STAR leg', () => {
    const model = new RouteModel('DAG.V394.LAS');
    const waypointName = 'CLARR';
    const legIndex = 0;

    model._legCollection[legIndex]._legType = 'nonsensical';

    expect(() => model._createAmendedConvergentLeg(legIndex, waypointName)).toThrow();
});

test('._createAmendedConvergentLeg() calls ._createAmendedAirwayLegUsingDifferentEntryName() when leg is an airway leg', () => {
    const model = new RouteModel('CHRLT.V394.LAS');
    const waypointName = 'CLARR';
    const legIndex = 0;
    const expectedResult = [
        model._createAmendedAirwayLegUsingDifferentEntryName(waypointName, legIndex),
    ];
    const createAmendedAirwayLegUsingDifferentEntryNameSpy = sinon.spy(
        model,
        '_createAmendedAirwayLegUsingDifferentEntryName'
    );
    const result = model._createAmendedConvergentLeg(legIndex, waypointName);

    expect(
        createAmendedAirwayLegUsingDifferentEntryNameSpy.calledWithExactly(waypointName, legIndex)
    ).toBe(true);
    expect(result).toEqual(expectedResult);
});

test('._createAmendedConvergentLeg() returns an empty array when leg is a direct leg', () => {
    const model = new RouteModel('CLARR');
    const waypointName = 'CLARR';
    const legIndex = 0;
    const result = model._createAmendedConvergentLeg(legIndex, waypointName);

    expect(result).toEqual([]);
});

test("._createAmendedConvergentLeg() returns the leg unmodified when convergent waypoint is the SID leg's first fix", () => {
    const model = new RouteModel('KLAS07R.BOACH6.HEC');
    const waypointName = 'JESJI';
    const legIndex = 0;
    const result = model._createAmendedConvergentLeg(legIndex, waypointName);
    const expectedWaypointNames = ['JESJI', 'BAKRR', 'MINEY', 'HITME', 'BOACH', 'HEC'];
    const waypointNames = _map(result[0].waypoints, (waypointModel) => waypointModel.name);

    expect(waypointNames).toEqual(expectedWaypointNames);
});

test('._createAmendedConvergentLeg() calls ._createLegsFromSidWaypointsAfterWaypointName() when leg is a SID leg', () => {
    const model = new RouteModel('KLAS07R.BOACH6.HEC');
    const waypointName = 'HITME';
    const legIndex = 0;
    const createLegsFromSidWaypointsAfterWaypointNameSpy = sinon.spy(
        model,
        '_createLegsFromSidWaypointsAfterWaypointName'
    );
    const result = model._createAmendedConvergentLeg(legIndex, waypointName);
    const waypointNames = result.reduce((names, legModel) => {
        return [...names, ...legModel.waypoints.map((waypointModel) => waypointModel.name)];
    }, []);
    const expectedWaypointNames = ['BOACH', 'HEC'];

    expect(
        createLegsFromSidWaypointsAfterWaypointNameSpy.calledWithExactly(waypointName, legIndex)
    ).toBe(true);
    expect(waypointNames).toEqual(expectedWaypointNames);
});

test("._createAmendedConvergentLeg() returns the leg unmodified when convergent waypoint is the STAR leg's first fix", () => {
    const model = new RouteModel('DVC.GRNPA1.KLAS07R');
    const waypointName = 'DVC';
    const legIndex = 0;
    const expectedWaypointNames = [
        'DVC',
        'BETHL',
        'HOLDM',
        'KSINO',
        'LUXOR',
        'GRNPA',
        'DUBLX',
        'FRAWG',
        'TRROP',
        'LEMNZ',
    ];
    const result = model._createAmendedConvergentLeg(legIndex, waypointName);
    const waypointNames = result.reduce((names, legModel) => {
        return [...names, ...legModel.waypoints.map((waypointModel) => waypointModel.name)];
    }, []);

    expect(waypointNames).toEqual(expectedWaypointNames);
});

test('._createAmendedConvergentLeg() calls ._createAmendedStarLegUsingDifferentEntryName() when leg is a STAR leg and convergent waypoint is a valid STAR entry', () => {
    const model = new RouteModel('DVC.GRNPA1.KLAS07R');
    const waypointName = 'BETHL';
    const legIndex = 0;
    const createAmendedStarLegUsingDifferentEntryNameSpy = sinon.spy(
        model,
        '_createAmendedStarLegUsingDifferentEntryName'
    );
    const expectedWaypointNames = [
        'BETHL',
        'HOLDM',
        'KSINO',
        'LUXOR',
        'GRNPA',
        'DUBLX',
        'FRAWG',
        'TRROP',
        'LEMNZ',
    ];
    const result = model._createAmendedConvergentLeg(legIndex, waypointName);
    const waypointNames = result.reduce((names, legModel) => {
        return [...names, ...legModel.waypoints.map((waypointModel) => waypointModel.name)];
    }, []);

    expect(
        createAmendedStarLegUsingDifferentEntryNameSpy.calledWithExactly(waypointName, legIndex)
    ).toBe(true);
    expect(waypointNames).toEqual(expectedWaypointNames);
});

test('._createAmendedConvergentLeg() calls ._createLegsFromStarWaypointsAfterWaypointName() when leg is a STAR leg and convergent waypoint is a valid STAR entry', () => {
    const model = new RouteModel('DVC.GRNPA1.KLAS07R');
    const waypointName = 'FRAWG';
    const legIndex = 0;
    // const expectedResult = model._createLegsFromStarWaypointsAfterWaypointName(waypointName, legIndex);
    const createLegsFromStarWaypointsAfterWaypointNameSpy = sinon.spy(
        model,
        '_createLegsFromStarWaypointsAfterWaypointName'
    );
    const expectedWaypointNames = ['TRROP', 'LEMNZ'];
    const result = model._createAmendedConvergentLeg(legIndex, waypointName);
    const waypointNames = result.reduce((names, legModel) => {
        return [...names, ...legModel.waypoints.map((waypointModel) => waypointModel.name)];
    }, []);

    expect(
        createLegsFromStarWaypointsAfterWaypointNameSpy.calledWithExactly(waypointName, legIndex)
    ).toBe(true);
    expect(waypointNames).toEqual(expectedWaypointNames);
});

test('._createAmendedDivergentLeg() throws when leg is not an airway/direct/SID/STAR leg', () => {
    const model = new RouteModel('DAG.V394.LAS');
    const waypointName = 'CLARR';
    const legIndex = 0;

    model._legCollection[legIndex]._legType = 'nonsensical';

    expect(() => model._createAmendedDivergentLeg(legIndex, waypointName)).toThrow();
});

test('._createAmendedDivergentLeg() calls ._createAmendedAirwayLegUsingDifferentExitName() when leg is an airway leg', () => {
    const model = new RouteModel('DAG.V394.LAS');
    const waypointName = 'CLARR';
    const legIndex = 0;
    const createAmendedAirwayLegUsingDifferentExitNameSpy = sinon.spy(
        model,
        '_createAmendedAirwayLegUsingDifferentExitName'
    );
    const expectedWaypointNames = ['DAG', 'DISBE', 'CHRLT', 'CLARR'];
    const result = model._createAmendedDivergentLeg(legIndex, waypointName);
    const waypointNames = result.reduce((names, legModel) => {
        return [...names, ...legModel.waypoints.map((waypointModel) => waypointModel.name)];
    }, []);

    expect(
        createAmendedAirwayLegUsingDifferentExitNameSpy.calledWithExactly(waypointName, legIndex)
    ).toBe(true);
    expect(waypointNames).toEqual(expectedWaypointNames);
});

test('._createAmendedDivergentLeg() returns an empty array when leg is a direct leg', () => {
    const model = new RouteModel('CLARR');
    const waypointName = 'CLARR';
    const legIndex = 0;
    const result = model._createAmendedDivergentLeg(legIndex, waypointName);

    expect(result).toEqual([]);
});

test("._createAmendedDivergentLeg() returns the leg unmodified when divergent waypoint is the SID leg's last fix", () => {
    const model = new RouteModel('KLAS07R.BOACH6.HEC');
    const waypointName = 'HEC';
    const legIndex = 0;
    const expectedWaypointNames = ['JESJI', 'BAKRR', 'MINEY', 'HITME', 'BOACH', 'HEC'];
    const result = model._createAmendedDivergentLeg(legIndex, waypointName);
    const waypointNames = result.reduce((names, legModel) => {
        return [...names, ...legModel.waypoints.map((waypointModel) => waypointModel.name)];
    }, []);

    expect(waypointNames).toEqual(expectedWaypointNames);
});

test('._createAmendedDivergentLeg() calls ._createLegsFromSidWaypointsBeforeWaypointName() when leg is a SID leg', () => {
    const model = new RouteModel('KLAS07R.BOACH6.HEC');
    const waypointName = 'BOACH';
    const legIndex = 0;
    // const expectedResult = model._createLegsFromSidWaypointsBeforeWaypointName(waypointName, legIndex);
    const createLegsFromSidWaypointsBeforeWaypointNameSpy = sinon.spy(
        model,
        '_createLegsFromSidWaypointsBeforeWaypointName'
    );
    const expectedWaypointNames = ['JESJI', 'BAKRR', 'MINEY', 'HITME'];
    const result = model._createAmendedDivergentLeg(legIndex, waypointName);
    const waypointNames = result.reduce((names, legModel) => {
        return [...names, ...legModel.waypoints.map((waypointModel) => waypointModel.name)];
    }, []);

    expect(
        createLegsFromSidWaypointsBeforeWaypointNameSpy.calledWithExactly(waypointName, legIndex)
    ).toBe(true);
    expect(waypointNames).toEqual(expectedWaypointNames);
});

test("._createAmendedDivergentLeg() returns the leg unmodified when divergent waypoint is the STAR leg's last fix", () => {
    const model = new RouteModel('BCE.GRNPA1.KLAS07R');
    const waypointName = 'LEMNZ';
    const legIndex = 0;
    // const expectedResult = [model._legCollection[legIndex]];
    const expectedWaypointNames = [
        'BCE',
        'KSINO',
        'LUXOR',
        'GRNPA',
        'DUBLX',
        'FRAWG',
        'TRROP',
        'LEMNZ',
    ];
    const result = model._createAmendedDivergentLeg(legIndex, waypointName);
    const waypointNames = result.reduce((names, legModel) => {
        return [...names, ...legModel.waypoints.map((waypointModel) => waypointModel.name)];
    }, []);

    expect(waypointNames).toEqual(expectedWaypointNames);
});

test('._createAmendedDivergentLeg() calls ._createAmendedStarLegUsingDifferentExitName() when leg is a STAR leg and convergent waypoint is a valid STAR entry', () => {
    const model = new RouteModel('BCE.GRNPA1.KLAS07R');
    const waypointName = 'DUBLX';
    const legIndex = 0;
    // const expectedResult = [model._createAmendedStarLegUsingDifferentExitName(waypointName, legIndex)];
    const createAmendedStarLegUsingDifferentExitNameSpy = sinon.spy(
        model,
        '_createAmendedStarLegUsingDifferentExitName'
    );
    const expectedWaypointNames = ['BCE', 'KSINO', 'LUXOR', 'GRNPA', 'DUBLX'];
    const result = model._createAmendedDivergentLeg(legIndex, waypointName);
    const waypointNames = result.reduce((names, legModel) => {
        return [...names, ...legModel.waypoints.map((waypointModel) => waypointModel.name)];
    }, []);

    expect(
        createAmendedStarLegUsingDifferentExitNameSpy.calledWithExactly(waypointName, legIndex)
    ).toBe(true);
    expect(waypointNames).toEqual(expectedWaypointNames);
});

test('._createAmendedDivergentLeg() calls ._createLegsFromStarWaypointsBeforeWaypointName() when leg is a STAR leg and convergent waypoint is a valid STAR entry', () => {
    const model = new RouteModel('DVC.GRNPA1.KLAS07R');
    const waypointName = 'LUXOR';
    const legIndex = 0;
    // const expectedResult = model._createLegsFromStarWaypointsBeforeWaypointName(waypointName, legIndex);
    const createLegsFromStarWaypointsBeforeWaypointNameSpy = sinon.spy(
        model,
        '_createLegsFromStarWaypointsBeforeWaypointName'
    );
    const expectedWaypointNames = ['DVC', 'BETHL', 'HOLDM', 'KSINO'];
    const result = model._createAmendedDivergentLeg(legIndex, waypointName);
    const waypointNames = result.reduce((names, legModel) => {
        return [...names, ...legModel.waypoints.map((waypointModel) => waypointModel.name)];
    }, []);

    expect(
        createLegsFromStarWaypointsBeforeWaypointNameSpy.calledWithExactly(waypointName, legIndex)
    ).toBe(true);
    expect(waypointNames).toEqual(expectedWaypointNames);
});

test('._createLegsFromSidWaypointsAfterWaypointName() returns an array of LegModels, one for each WaypointModel in the SID, after the specified one', () => {
    const model = new RouteModel('KLAS07R.BOACH6.HEC');
    const nextEntryFixName = 'HITME';
    const legIndex = 0;
    const result = model._createLegsFromSidWaypointsAfterWaypointName(nextEntryFixName, legIndex);
    const expectedWaypointNames = ['BOACH', 'HEC'];
    const waypointNames = _map(result, (legModel) => legModel.routeString);

    expect(result.every((legModel) => legModel instanceof LegModel)).toBe(true);
    expect(waypointNames).toEqual(expectedWaypointNames);
});

test('._createLegsFromSidWaypointsBeforeWaypointName() returns an array of LegModels, one for each WaypointModel in the SID, before the specified one', () => {
    const model = new RouteModel('KLAS07R.BOACH6.HEC');
    const nextExitFixName = 'BOACH';
    const legIndex = 0;
    const result = model._createLegsFromSidWaypointsBeforeWaypointName(nextExitFixName, legIndex);
    const expectedWaypointNames = ['JESJI', 'BAKRR', 'MINEY', 'HITME'];
    const waypointNames = _map(result, (legModel) => legModel.routeString);

    expect(result.every((legModel) => legModel instanceof LegModel)).toBe(true);
    expect(waypointNames).toEqual(expectedWaypointNames);
});

test('._createLegsFromStarWaypointsAfterWaypointName() returns an array of LegModels, one for each WaypointModel in the STAR, after the specified one', () => {
    const model = new RouteModel('DVC.GRNPA1.KLAS07R');
    const nextEntryFixName = 'FRAWG';
    const legIndex = 0;
    const result = model._createLegsFromStarWaypointsAfterWaypointName(nextEntryFixName, legIndex);
    const expectedWaypointNames = ['TRROP', 'LEMNZ'];
    const waypointNames = _map(result, (legModel) => legModel.routeString);

    expect(result.every((legModel) => legModel instanceof LegModel)).toBe(true);
    expect(waypointNames).toEqual(expectedWaypointNames);
});

test('._createLegsFromStarWaypointsBeforeWaypointName() returns an array of LegModels, one for each WaypointModel in the STAR, before the specified one', () => {
    const model = new RouteModel('DVC.GRNPA1.KLAS07R');
    const nextExitFixName = 'LUXOR';
    const legIndex = 0;
    const result = model._createLegsFromStarWaypointsBeforeWaypointName(nextExitFixName, legIndex);
    const expectedWaypointNames = ['DVC', 'BETHL', 'HOLDM', 'KSINO'];
    const waypointNames = _map(result, (legModel) => legModel.routeString);

    expect(result.every((legModel) => legModel instanceof LegModel)).toBe(true);
    expect(waypointNames).toEqual(expectedWaypointNames);
});

test('._createAmendedStarLegUsingDifferentEntryName() returns a new LegModel with the same STAR and exit, with new specified entry', () => {
    const model = new RouteModel('DVC.GRNPA1.KLAS07R');
    const nextEntryFixName = 'BETHL';
    const legIndex = 0;
    const result = model._createAmendedStarLegUsingDifferentEntryName(nextEntryFixName, legIndex);

    expect(result instanceof LegModel).toBe(true);
    expect(result.routeString === 'BETHL.GRNPA1.KLAS07R').toBe(true);
});

test('._createAmendedStarLegUsingDifferentExitName returns a new LegModel with the same STAR and entry, with new specified exit', () => {
    const model = new RouteModel('BCE.GRNPA1.KLAS07R');
    const nextExitFixName = 'DUBLX';
    const legIndex = 0;
    const result = model._createAmendedStarLegUsingDifferentExitName(nextExitFixName, legIndex);

    expect(result instanceof LegModel).toBe(true);
    expect(result.routeString === 'BCE.GRNPA1.DUBLX').toBe(true);
});

test.todo('._createLegModelsFromWaypointModels()');

test.todo('._divideRouteStringIntoSegments()');

test.todo('._findConvergentWaypointNameWithRouteModel()');

test.todo('._findIndexOfLegContainingWaypointName()');

test.todo('._findSidLegIndex()');
test.todo('._findSidLeg()');

test.todo('._findStarLegIndex()');

test.todo('._generateLegsFromRouteString()');

test('._getPastAndPresentLegModels() returns #_previousLegCollection concatenated with #_legCollection', () => {
    const model = new RouteModel(nightmareRouteStringMock);

    model.skipToWaypointName('GUP');

    const expectedResult = [...model._previousLegCollection, ...model._legCollection];
    const result = model._getPastAndPresentLegModels();

    expect(result).toEqual(expectedResult);
});

test('._overwriteRouteBetweenWaypointNames() adjusts divergent/convergent legs and replaces middle content correctly', () => {
    const primaryModel = new RouteModel('KLAS07R.TRALR6.BCE.J11.DRK');
    const otherModel = new RouteModel('BCE..NAVHO');
    const expectedResult = [
        true,
        { log: 'rerouting to: KLAS07R TRALR6 BCE NAVHO J11 DRK', say: 'rerouting as requested' },
    ];
    const result = primaryModel._overwriteRouteBetweenWaypointNames('BCE', 'NAVHO', otherModel);

    expect(result).toEqual(expectedResult);
    expect(primaryModel._legCollection.length === 4).toBe(true);
    expect(primaryModel._legCollection[0].routeString === 'KLAS07R.TRALR6.BCE').toBe(true);
    expect(primaryModel._legCollection[1].routeString === 'BCE').toBe(true);
    expect(primaryModel._legCollection[2].routeString === 'NAVHO').toBe(true);
    expect(primaryModel._legCollection[3].routeString === 'NAVHO.J11.DRK').toBe(true);
});

test('._prependRouteModelEndingAtWaypointName() throws when leg type is not airway/direct/SID/STAR', () => {
    const primaryModel = new RouteModel('CLARR..SKEBR..MDDOG..IPUMY');
    const otherModel = new RouteModel('BOACH..MDDOG');

    primaryModel._legCollection[2]._legType = 'nonsensical';

    expect(() =>
        primaryModel._prependRouteModelEndingAtWaypointName('MDDOG', otherModel)
    ).toThrow();
});

test('._prependRouteModelEndingAtWaypointName() calls ._prependRouteModelIntoAirwayLeg() when convergent leg is airway leg', () => {
    const primaryModel = new RouteModel('CHRLT.V394.LAS');
    const otherModel = new RouteModel('GFS..WHIGG..CLARR');
    const primaryModelPrependRouteModelIntoAirwayLegSpy = sinon.spy(
        primaryModel,
        '_prependRouteModelIntoAirwayLeg'
    );
    const expectedResult = [
        true,
        { log: 'rerouting to: GFS WHIGG CLARR V394 LAS', say: 'rerouting as requested' },
    ];
    const result = primaryModel._prependRouteModelEndingAtWaypointName('CLARR', otherModel);

    expect(result).toEqual(expectedResult);
    expect(
        primaryModelPrependRouteModelIntoAirwayLegSpy.calledWithExactly('CLARR', otherModel)
    ).toBe(true);
});

test('._prependRouteModelEndingAtWaypointName() calls ._prependRouteModelIntoDirectLeg() when convergent leg is direct leg', () => {
    const primaryModel = new RouteModel('CLARR..SKEBR..MDDOG..IPUMY');
    const otherModel = new RouteModel('BOACH..MDDOG');
    const primaryModelPrependRouteModelIntoDirectLegSpy = sinon.spy(
        primaryModel,
        '_prependRouteModelIntoDirectLeg'
    );
    const expectedResult = [
        true,
        { log: 'rerouting to: BOACH MDDOG IPUMY', say: 'rerouting as requested' },
    ];
    const result = primaryModel._prependRouteModelEndingAtWaypointName('MDDOG', otherModel);

    expect(result).toEqual(expectedResult);
    expect(
        primaryModelPrependRouteModelIntoDirectLegSpy.calledWithExactly('MDDOG', otherModel)
    ).toBe(true);
});

test('._prependRouteModelEndingAtWaypointName() calls ._prependRouteModelIntoSidLeg() when convergent leg is SID leg', () => {
    const primaryModel = new RouteModel('KLAS07R.BOACH6.HEC');
    const otherModel = new RouteModel('IPUMY..HITME');
    const primaryModelPrependRouteModelIntoSidLegSpy = sinon.spy(
        primaryModel,
        '_prependRouteModelIntoSidLeg'
    );
    const expectedResult = [
        true,
        { log: 'rerouting to: IPUMY HITME BOACH HEC', say: 'rerouting as requested' },
    ];
    const result = primaryModel._prependRouteModelEndingAtWaypointName('HITME', otherModel);

    expect(result).toEqual(expectedResult);
    expect(primaryModelPrependRouteModelIntoSidLegSpy.calledWithExactly('HITME', otherModel)).toBe(
        true
    );
});

test('._prependRouteModelEndingAtWaypointName() calls ._prependRouteModelIntoStarLeg() when convergent leg is STAR leg', () => {
    const primaryModel = new RouteModel('DVC.GRNPA1.KLAS07R');
    const otherModel = new RouteModel('GUP..PGA..BETHL');
    const primaryModelPrependRouteModelIntoStarLegSpy = sinon.spy(
        primaryModel,
        '_prependRouteModelIntoStarLeg'
    );
    const expectedResult = [
        true,
        { log: 'rerouting to: GUP PGA BETHL GRNPA1 KLAS07R', say: 'rerouting as requested' },
    ];
    const result = primaryModel._prependRouteModelEndingAtWaypointName('BETHL', otherModel);

    expect(result).toEqual(expectedResult);
    expect(primaryModelPrependRouteModelIntoStarLegSpy.calledWithExactly('BETHL', otherModel)).toBe(
        true
    );
});

test('._prependRouteModelIntoAirwayLeg() correctly places RouteModel and adjusts airway entry', () => {
    const primaryModel = new RouteModel('CHRLT.V394.LAS');
    const otherModel = new RouteModel('GFS..WHIGG..CLARR');
    const expectedResult = [
        true,
        { log: 'rerouting to: GFS WHIGG CLARR V394 LAS', say: 'rerouting as requested' },
    ];
    const result = primaryModel._prependRouteModelIntoAirwayLeg('CLARR', otherModel);

    expect(result).toEqual(expectedResult);
    expect(primaryModel._legCollection.length === 4).toBe(true);
    expect(primaryModel._legCollection[0].routeString === 'GFS').toBe(true);
    expect(primaryModel._legCollection[1].routeString === 'WHIGG').toBe(true);
    expect(primaryModel._legCollection[2].routeString === 'CLARR').toBe(true);
    expect(primaryModel._legCollection[3].routeString === 'CLARR.V394.LAS').toBe(true);
});

test('._prependRouteModelIntoDirectLeg() correctly places RouteModel', () => {
    const primaryModel = new RouteModel('CLARR..SKEBR..MDDOG..IPUMY');
    const otherModel = new RouteModel('BOACH..MDDOG');
    const expectedResult = [
        true,
        { log: 'rerouting to: BOACH MDDOG IPUMY', say: 'rerouting as requested' },
    ];
    const result = primaryModel._prependRouteModelIntoDirectLeg('MDDOG', otherModel);

    expect(result).toEqual(expectedResult);
    expect(primaryModel._legCollection.length === 3).toBe(true);
    expect(primaryModel._legCollection[0].routeString === 'BOACH').toBe(true);
    expect(primaryModel._legCollection[1].routeString === 'MDDOG').toBe(true);
    expect(primaryModel._legCollection[2].routeString === 'IPUMY').toBe(true);
});

test('._prependRouteModelIntoSidLeg() correctly places RouteModel and explodes remaining SID waypoints into legs', () => {
    const primaryModel = new RouteModel('KLAS07R.BOACH6.HEC');
    const otherModel = new RouteModel('IPUMY..HITME');
    const expectedResult = [
        true,
        { log: 'rerouting to: IPUMY HITME BOACH HEC', say: 'rerouting as requested' },
    ];
    const result = primaryModel._prependRouteModelIntoSidLeg('HITME', otherModel);

    expect(result).toEqual(expectedResult);
    expect(primaryModel._legCollection.length === 4).toBe(true);
    expect(primaryModel._legCollection[0].routeString === 'IPUMY').toBe(true);
    expect(primaryModel._legCollection[1].routeString === 'HITME').toBe(true);
    expect(primaryModel._legCollection[2].routeString === 'BOACH').toBe(true);
    expect(primaryModel._legCollection[3].routeString === 'HEC').toBe(true);
});

test('._prependRouteModelIntoStarLeg() correctly places RouteModel and changes STAR entry when route ends at an entry', () => {
    const primaryModel = new RouteModel('DVC.GRNPA1.KLAS07R');
    const otherModel = new RouteModel('GUP..PGA..BETHL');
    const expectedResult = [
        true,
        { log: 'rerouting to: GUP PGA BETHL GRNPA1 KLAS07R', say: 'rerouting as requested' },
    ];
    const result = primaryModel._prependRouteModelIntoStarLeg('BETHL', otherModel);

    expect(result).toEqual(expectedResult);
    expect(primaryModel._legCollection.length === 4).toBe(true);
    expect(primaryModel._legCollection[0].routeString === 'GUP').toBe(true);
    expect(primaryModel._legCollection[1].routeString === 'PGA').toBe(true);
    expect(primaryModel._legCollection[2].routeString === 'BETHL').toBe(true);
    expect(primaryModel._legCollection[3].routeString === 'BETHL.GRNPA1.KLAS07R').toBe(true);
});

test('._prependRouteModelIntoStarLeg() correctly places RouteModel and explodes remaining STAR waypoints into legs', () => {
    const primaryModel = new RouteModel('DVC.GRNPA1.KLAS07R');
    const otherModel = new RouteModel('PGA..FRAWG');
    const expectedResult = [
        true,
        { log: 'rerouting to: PGA FRAWG TRROP LEMNZ', say: 'rerouting as requested' },
    ];
    const result = primaryModel._prependRouteModelIntoStarLeg('FRAWG', otherModel);

    expect(result).toEqual(expectedResult);
    expect(primaryModel._legCollection.length === 4).toBe(true);
    expect(primaryModel._legCollection[0].routeString === 'PGA').toBe(true);
    expect(primaryModel._legCollection[1].routeString === 'FRAWG').toBe(true);
    expect(primaryModel._legCollection[2].routeString === 'TRROP').toBe(true);
    expect(primaryModel._legCollection[3].routeString === 'LEMNZ').toBe(true);
});
