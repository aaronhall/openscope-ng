import { test, expect, vi } from 'vitest';
import sinon from 'sinon';
import _isArray from 'lodash/isArray';
import _map from 'lodash/map';
import AirportModel from '../../../src/assets/scripts/client/airport/AirportModel';
import AirwayModel from '../../../src/assets/scripts/client/navigationLibrary/AirwayModel';
import LegModel from '../../../src/assets/scripts/client/aircraft/FlightManagementSystem/LegModel';
import ProcedureModel from '../../../src/assets/scripts/client/navigationLibrary/ProcedureModel';
// import NavigationLibrary from '../../../src/assets/scripts/client/navigationLibrary/NavigationLibrary';
import { AIRPORT_JSON_KLAS_MOCK } from '../../airport/_mocks/airportJsonMock';
import {
    createNavigationLibraryFixture,
    resetNavigationLibraryFixture
} from '../../fixtures/navigationLibraryFixtures';
import {
    LEG_TYPE,
    PROCEDURE_TYPE
} from '../../../src/assets/scripts/client/constants/routeConstants';

// const holdRouteStringMock = '@COWBY';
// const directRouteStringMockMock = 'COWBY';
// const cowbyFixFixture = navigationLibraryFixture.findFixByName('COWBY');
// const arrivalProcedureRouteStringMock = 'DAG.KEPEC3.KLAS25R';
// const departureProcedureRouteStringMock = 'KLAS25R.COWBY6.DRK';
// const runwayMock = '25R';
// const arrivalFlightPhaseMock = 'CRUISE';
// const departureFlightPhaseMock = 'APRON';

const airwayRouteStringMock = 'CHRLT.V394.LAS';
const directRouteStringMock = 'PGS';
const sidRouteStringMock = 'KLAS25R.BOACH6.TNP';
const shortSidRouteStringMock = 'KLAS07R.TRALR6.MLF';
const starRouteStringMock = 'DAG.KEPEC3.KLAS19R';

beforeEach(() => {
    createNavigationLibraryFixture();
});

afterEach(() => {
    resetNavigationLibraryFixture();
});

test('throws when instantiated with invalid parameters', () => {
    expect(() => new LegModel()).toThrow();
});

test('throws when instantiated with route string that should be two separate legs', () => {
    const procedureThenDirectRouteString = 'KLAS25R.COWBY6.DRK..PXR';
    const doubleDirectRouteString = 'PGS..DRK';
    const doubleProcedureRouteString = 'KLAS25R.COWBY6.DRK.TYSSN4.KLAS25R';
    const directThenProcedureRouteString = 'PXR..DAG.KEPEC1.KLAS';

    expect(() => new LegModel(procedureThenDirectRouteString)).toThrow();
    expect(() => new LegModel(doubleDirectRouteString)).toThrow();
    expect(() => new LegModel(doubleProcedureRouteString)).toThrow();
    expect(() => new LegModel(directThenProcedureRouteString)).toThrow();
});

test('throws when instantiated with airway route string with airway not defined in navigation library', () => {
    const routeStringWithInvalidProcedure = 'KLAS25R.BOACH0.TNP';

    expect(() => new LegModel(routeStringWithInvalidProcedure)).toThrow();
});

test('throws when instantiated with procedure route string with procedure not defined in navigation library', () => {
    const routeStringWithInvalidProcedure = 'KLAS25R.BOACH0.TNP';

    expect(() => new LegModel(routeStringWithInvalidProcedure)).toThrow();
});

test('instantiates correctly when given a single airway leg\'s route string', () => {
    const model = new LegModel(airwayRouteStringMock);

    expect(model._airwayModel instanceof AirwayModel).toBe(true);
    expect(model._legType === LEG_TYPE.AIRWAY).toBe(true);
    expect(!model._procedureModel).toBe(true);
    expect(model._routeString === airwayRouteStringMock).toBe(true);
    expect(model._waypointCollection.length === 4).toBe(true);
});

test('instantiates correctly when given a single direct leg\'s route string', () => {
    const model = new LegModel(directRouteStringMock);

    expect(!model._airwayModel).toBe(true);
    expect(model._legType === LEG_TYPE.DIRECT).toBe(true);
    expect(!model._procedureModel).toBe(true);
    expect(model._routeString === directRouteStringMock).toBe(true);
    expect(model._waypointCollection.length === 1).toBe(true);
});

test('instantiates correctly when given a single SID leg\'s route string', () => {
    const model = new LegModel(sidRouteStringMock);

    expect(!model._airwayModel).toBe(true);
    expect(model._legType === LEG_TYPE.PROCEDURE).toBe(true);
    expect(model._procedureModel instanceof ProcedureModel).toBe(true);
    expect(model._procedureModel.procedureType === PROCEDURE_TYPE.SID).toBe(true);
    expect(model._routeString === sidRouteStringMock).toBe(true);
    expect(model._waypointCollection.length === 7).toBe(true);
});

test('instantiates correctly when given a single STAR leg\'s route string', () => {
    const model = new LegModel(starRouteStringMock);

    expect(!model._airwayModel).toBe(true);
    expect(model._legType === LEG_TYPE.PROCEDURE).toBe(true);
    expect(model._procedureModel instanceof ProcedureModel).toBe(true);
    expect(model._procedureModel.procedureType === PROCEDURE_TYPE.STAR).toBe(true);
    expect(model._routeString === starRouteStringMock).toBe(true);
    expect(model._waypointCollection.length === 13).toBe(true);
});

test('#currentWaypoint throws when #_waypointCollection is empty', () => {
    const model = new LegModel(sidRouteStringMock);

    model.skipAllWaypointsInLeg();

    expect(() => model.currentWaypoint).toThrow();
});

test('#currentWaypoint returns the first item in #waypointCollection', () => {
    const model = new LegModel(sidRouteStringMock);
    const expectedResult = model._waypointCollection[0];
    const result = model.currentWaypoint;

    expect(result).toEqual(expectedResult);
});

test('#isAirwayLeg returns false when this is not an airway leg', () => {
    const model = new LegModel(sidRouteStringMock);

    expect(model.isAirwayLeg).toBe(false);
});

test('#isAirwayLeg returns true when this is an airway leg', () => {
    const model = new LegModel(airwayRouteStringMock);

    expect(model.isAirwayLeg).toBe(true);
});

test('#isDirectLeg returns false when this is not a direct leg', () => {
    const model = new LegModel(sidRouteStringMock);

    expect(model.isDirectLeg).toBe(false);
});

test('#isDirectLeg returns true when this is a direct leg', () => {
    const model = new LegModel(directRouteStringMock);

    expect(model.isDirectLeg).toBe(true);
});

test('#isProcedureLeg returns false when this is not a procedure leg', () => {
    const model = new LegModel(directRouteStringMock);

    expect(model.isProcedureLeg).toBe(false);
});

test('#isProcedureLeg returns true when this is a procedure leg', () => {
    const model = new LegModel(sidRouteStringMock);

    expect(model.isProcedureLeg).toBe(true);
});

test('#isSidLeg returns false when this is not a SID procedure leg', () => {
    const model = new LegModel(starRouteStringMock);

    expect(model.isSidLeg).toBe(false);
});

test('#isSidLeg returns true when this is a SID procedure leg', () => {
    const model = new LegModel(sidRouteStringMock);

    expect(model.isSidLeg).toBe(true);
});

test('#isStarLeg returns false when this is not a SID procedure leg', () => {
    const model = new LegModel(sidRouteStringMock);

    expect(model.isStarLeg).toBe(false);
});

test('#isStarLeg returns true when this is a SID procedure leg', () => {
    const model = new LegModel(starRouteStringMock);

    expect(model.isStarLeg).toBe(true);
});

test('#legType returns value of #_legType', () => {
    const model = new LegModel(sidRouteStringMock);
    const legTypeMock = 'type-o-da-leg';

    model._legType = legTypeMock;

    expect(model.legType === legTypeMock).toBe(true);
});

test('#nextWaypoint returns the second element of #_waypointCollection', () => {
    const model = new LegModel(sidRouteStringMock);
    const nextWaypointModel = model._waypointCollection[1];
    const result = model.nextWaypoint;

    expect(result).toEqual(nextWaypointModel);
});

test('#routeString returns the value of #_routeString', () => {
    const model = new LegModel(sidRouteStringMock);
    const result = model.routeString;

    expect(result).toEqual(sidRouteStringMock);
});

test('#waypoints returns an array containing all `WaypointModel`s', () => {
    const model = new LegModel(sidRouteStringMock);
    const result = model.waypoints;
    const expectedWaypointNames = ['RBELL', 'ROPPR', 'RODDD', 'BOACH', 'ZELMA', 'JOTNU', 'TNP'];
    const waypointNames = _map(result, (waypointModel) => waypointModel.name);

    expect(_isArray(result)).toBe(true);
    expect(waypointNames).toEqual(expectedWaypointNames);
});

test('.activateHoldForWaypointName() returns early when the specified waypoint does not exist in the route', () => {
    const model = new LegModel('KEPEC');
    const waypointModel = model._waypointCollection[0];
    const setHoldParametersAndActivateHoldSpy = sinon.spy(waypointModel, 'setHoldParametersAndActivateHold');
    const holdParametersMock = { turnDirection: 'left' };
    const result = model.activateHoldForWaypointName('PRINO', holdParametersMock);

    expect(typeof result === 'undefined').toBe(true);
    expect(setHoldParametersAndActivateHoldSpy.notCalled).toBe(true);
});

test('.activateHoldForWaypointName() calls .setHoldParametersAndActivateHold() with the appropriate arguments', () => {
    const model = new LegModel('KEPEC');
    const waypointModel = model._waypointCollection[0];
    const setHoldParametersAndActivateHoldSpy = sinon.spy(waypointModel, 'setHoldParametersAndActivateHold');
    const holdParametersMock = { turnDirection: 'left' };
    const result = model.activateHoldForWaypointName('KEPEC', holdParametersMock);

    expect(typeof result).not.toBe('undefined');
    expect(setHoldParametersAndActivateHoldSpy.calledWith(holdParametersMock)).toBe(true);
});

test('.getAllWaypointModelsAfterWaypointName() returns an array of all waypoint models after and excluding the specified one', () => {
    const model = new LegModel(sidRouteStringMock);
    const lastExcludedWaypoint = 'BOACH';
    const result = model.getAllWaypointModelsAfterWaypointName(lastExcludedWaypoint);
    const expectedRemainingFixNames = ['ZELMA', 'JOTNU', 'TNP'];
    const remainingFixNames = result.map((wp) => wp.name);

    expect(remainingFixNames).toEqual(expectedRemainingFixNames);
});

test('.getAllWaypointModelsBeforeWaypointName() returns an array of all waypoint models before and excluding the specified one', () => {
    const model = new LegModel(sidRouteStringMock);
    const lastExcludedWaypoint = 'BOACH';
    const result = model.getAllWaypointModelsBeforeWaypointName(lastExcludedWaypoint);
    const expectedRemainingFixNames = ['RBELL', 'ROPPR', 'RODDD'];
    const remainingFixNames = result.map((wp) => wp.name);

    expect(remainingFixNames).toEqual(expectedRemainingFixNames);
});

test('.getArrivalRunwayAirportIcao() returns null when this is not a STAR leg', () => {
    const model = new LegModel(sidRouteStringMock);
    const result = model.getArrivalRunwayAirportIcao();

    expect(!result).toBe(true);
});

test('.getArrivalRunwayAirportIcao() returns the first four characters of the STAR exit name', () => {
    const model = new LegModel('DAG.KEPEC3.KLAS19R');
    const result = model.getArrivalRunwayAirportIcao();

    expect(result === 'klas').toBe(true);
});

test('.getArrivalRunwayName() returns null when this is not a STAR leg', () => {
    const model = new LegModel(sidRouteStringMock);
    const result = model.getArrivalRunwayName();

    expect(!result).toBe(true);
});

test('.getArrivalRunwayName() returns the all but first four characters of the STAR exit name', () => {
    const model = new LegModel('DAG.KEPEC3.KLAS19R');
    const result = model.getArrivalRunwayName();

    expect(result === '19R').toBe(true);
});

test('.getBottomAltitude() returns -1 when leg is not a procedure leg', () => {
    const model = new LegModel(directRouteStringMock);
    const expectedResult = -1;
    const result = model.getBottomAltitude();

    expect(result === expectedResult).toBe(true);
});

test('.getBottomAltitude() returns -1 when procedure leg does not have a bottom altitude', () => {
    const model = new LegModel('KLAS19L.COWBY6.DRK');
    const expectedResult = -1;
    const result = model.getBottomAltitude();

    expect(result === expectedResult).toBe(true);
});

test('.getBottomAltitude() returns the correct bottom altitude when leg is a procedure leg', () => {
    const model = new LegModel(starRouteStringMock);
    const expectedResult = 8000;
    const result = model.getBottomAltitude();

    expect(result === expectedResult).toBe(true);
});

test('.getDepartureRunwayAirportIcao() returns null when this is not a SID leg', () => {
    const model = new LegModel(starRouteStringMock);
    const result = model.getDepartureRunwayAirportIcao();

    expect(!result).toBe(true);
});

test('.getDepartureRunwayAirportIcao() returns the first four characters of the SID entry name', () => {
    const model = new LegModel('KLAS25R.BOACH6.TNP');
    const result = model.getDepartureRunwayAirportIcao();

    expect(result === 'klas').toBe(true);
});

test('.getDepartureRunwayName() returns null when this is not a SID leg', () => {
    const model = new LegModel(starRouteStringMock);
    const result = model.getDepartureRunwayName();

    expect(!result).toBe(true);
});

test('.getDepartureRunwayName() returns the all but first four characters of the SID entry name', () => {
    const model = new LegModel('KLAS25R.BOACH6.TNP');
    const result = model.getDepartureRunwayName();

    expect(result === '25R').toBe(true);
});

test('.getEntryFixName() returns the name of the fix when this leg is a direct leg', () => {
    const model = new LegModel('TNP');
    const expectedResult = 'TNP';
    const result = model.getEntryFixName();

    expect(result === expectedResult).toBe(true);
});

test('.getEntryFixName() returns route string before the first \'.\' when this leg is a SID leg', () => {
    const model = new LegModel('KLAS25R.BOACH6.TNP');
    const expectedResult = 'KLAS25R';
    const result = model.getEntryFixName();

    expect(result === expectedResult).toBe(true);
});

test('.getEntryFixName() returns route string before the first \'.\' when this leg is a STAR leg', () => {
    const model = new LegModel('DAG.KEPEC3.KLAS19R');
    const expectedResult = 'DAG';
    const result = model.getEntryFixName();

    expect(result === expectedResult).toBe(true);
});

test('.getExitFixName() returns the name of the fix when this leg is a direct leg', () => {
    const model = new LegModel('TNP');
    const expectedResult = 'TNP';
    const result = model.getExitFixName();

    expect(result === expectedResult).toBe(true);
});

test('.getExitFixName() returns route string after the last \'.\' when this leg is a SID leg', () => {
    const model = new LegModel('KLAS25R.BOACH6.TNP');
    const expectedResult = 'TNP';
    const result = model.getExitFixName();

    expect(result === expectedResult).toBe(true);
});

test('.getExitFixName() returns route string after the last \'.\' when this leg is a STAR leg', () => {
    const model = new LegModel('DAG.KEPEC3.KLAS19R');
    const expectedResult = 'KLAS19R';
    const result = model.getExitFixName();

    expect(result === expectedResult).toBe(true);
});

test('.getProcedureIcao() returns undefined when this is not a procedure leg', () => {
    const model = new LegModel(directRouteStringMock);
    const result = model.getProcedureIcao();

    expect(typeof result === 'undefined').toBe(true);
});

test('.getProcedureIcao() returns the ICAO identifier of the ProcedureModel in use by this leg', () => {
    const model = new LegModel('KLAS25R.BOACH6.TNP');
    const expectedResult = 'BOACH6';
    const result = model.getProcedureIcao();

    expect(result === expectedResult).toBe(true);
});

test('.getProcedureName() returns undefined when this is not a procedure leg', () => {
    const model = new LegModel(directRouteStringMock);
    const result = model.getProcedureName();

    expect(typeof result === 'undefined').toBe(true);
});

test('.getProcedureName() returns the name of the ProcedureModel in use by this leg', () => {
    const model = new LegModel('KLAS25R.BOACH6.TNP');
    const expectedResult = 'Boach Six';
    const result = model.getProcedureName();

    expect(result === expectedResult).toBe(true);
});

test('.getRouteStringWithoutAirports() returns #_routeString when neither a SID or STAR leg', () => {
    const model = new LegModel('BOACH');
    const expectedResult = model._routeString;
    const result = model.getRouteStringWithoutAirports();

    expect(result === expectedResult).toBe(true);
});

test('.getRouteStringWithoutAirports() returns route string without airport for SID leg', () => {
    const model = new LegModel('KLAS25R.BOACH6.TNP');
    const expectedResult = 'BOACH6.TNP';
    const result = model.getRouteStringWithoutAirports();

    expect(result === expectedResult).toBe(true);
});

test('.getRouteStringWithoutAirports() returns route string without airport for STAR leg', () => {
    const model = new LegModel('DAG.KEPEC3.KLAS19R');
    const expectedResult = 'DAG.KEPEC3';
    const result = model.getRouteStringWithoutAirports();

    expect(result === expectedResult).toBe(true);
});

test('.hasWaypointName() throws when the not provided with a waypoint name', () => {
    const model = new LegModel(sidRouteStringMock);

    expect(() => model.hasWaypointName()).toThrow();
    expect(() => model.hasWaypointName('')).toThrow();
});

test('.getTopAltitude() returns -1 when leg is not a procedure leg', () => {
    const model = new LegModel(directRouteStringMock);
    const expectedResult = -1;
    const result = model.getTopAltitude();

    expect(result === expectedResult).toBe(true);
});

test('.getTopAltitude() returns -1 when procedure leg does not have a top altitude', () => {
    const model = new LegModel('KLAS19L.COWBY6.DRK');
    const expectedResult = -1;
    const result = model.getTopAltitude();

    expect(result === expectedResult).toBe(true);
});

test('.getTopAltitude() returns the correct top altitude when leg is a procedure leg', () => {
    const model = new LegModel(sidRouteStringMock);
    const expectedResult = 7000;
    const result = model.getTopAltitude();

    expect(result === expectedResult).toBe(true);
});

test('.hasNextWaypoint() returns false when #_waypointCollection has less than two elements', () => {
    const model = new LegModel(sidRouteStringMock);

    model._waypointCollection = [model._waypointCollection[0]];

    const result = model.hasNextWaypoint();

    expect(model._waypointCollection.length === 1).toBe(true);
    expect(result).toBe(false);
});

test('.hasNextWaypoint() returns true when #_waypointCollection has at least two elements', () => {
    const model = new LegModel(sidRouteStringMock);
    const result = model.hasNextWaypoint();

    expect(model._waypointCollection.length > 1).toBe(true);
    expect(result).toBe(true);
});

test('.hasWaypointName() returns false when the specified waypoint does not exist in the #waypointCollection', () => {
    const model = new LegModel(sidRouteStringMock);

    expect(model.hasWaypointName('ABC')).toBe(false);
});

test('.hasWaypointName() returns true when the specified waypoint exists within the #waypointCollection', () => {
    const model = new LegModel(sidRouteStringMock);

    expect(model.hasWaypointName('BOACH')).toBe(true);
});

test('.moveToNextWaypoint() moves #currentWaypoint into the #_previousWaypointCollection', () => {
    const model = new LegModel(sidRouteStringMock);

    expect(model._previousWaypointCollection.length === 0).toBe(true);
    expect(model._waypointCollection.length === 7).toBe(true);

    model.moveToNextWaypoint();

    expect(model._previousWaypointCollection.length === 1).toBe(true);
    expect(model._waypointCollection.length === 6).toBe(true);
});

test('.skipAllWaypointsInLeg() moves entire #_waypointCollection into the #_previousWaypointCollection', () => {
    const model = new LegModel(sidRouteStringMock);
    const oldWaypointCollection = model._waypointCollection;

    expect(model._previousWaypointCollection.length === 0).toBe(true);
    expect(model._waypointCollection.length === 7).toBe(true);

    model.skipAllWaypointsInLeg();

    expect(model._waypointCollection).toEqual([]);
    expect(model._previousWaypointCollection).toEqual(oldWaypointCollection);
});

test('.skipToWaypointName() returns false early when the specified waypoint is not in the leg', () => {
    const model = new LegModel(sidRouteStringMock);
    const fixNotInLeg = 'ABCDE';
    const oldCurrentWaypointName = model.currentWaypoint.name;
    const result = model.skipToWaypointName(fixNotInLeg);
    const currentWaypointName = model.currentWaypoint.name;

    expect(result).toBe(false);
    expect(currentWaypointName === oldCurrentWaypointName).toBe(true);
});

test('.skipToWaypointName() moves all waypoints before the specified waypoint to the #_previousWaypointCollection', () => {
    const model = new LegModel(sidRouteStringMock);
    const expectedPreviousFixNames = ['RBELL', 'ROPPR', 'RODDD'];
    const expectedRemainingFixNames = ['BOACH', 'ZELMA', 'JOTNU', 'TNP'];
    const result = model.skipToWaypointName('BOACH');
    const previousFixNames = model._previousWaypointCollection.map((wp) => wp.name);
    const remainingFixNames = model._waypointCollection.map((wp) => wp.name);

    expect(result).toBe(true);
    expect(previousFixNames).toEqual(expectedPreviousFixNames);
    expect(remainingFixNames).toEqual(expectedRemainingFixNames);
});

test('.reset() calls ._resetWaypointCollection()', () => {
    const model = new LegModel(sidRouteStringMock);
    const resetWaypointCollectionSpy = sinon.spy(model, '_resetWaypointCollection');

    model.reset();

    expect(resetWaypointCollectionSpy.calledWithExactly()).toBe(true);
});

test('.reset() resets to default all properties', () => {
    const model = new LegModel(sidRouteStringMock);

    model.reset();

    expect(!model._airwayModel).toBe(true);
    expect(model._legType === '').toBe(true);
    expect(!model._procedureModel).toBe(true);
    expect(model._previousWaypointCollection).toEqual([]);
    expect(model._routeString === '').toBe(true);
    expect(model._waypointCollection).toEqual([]);
});

test('.updateSidLegForDepartureRunwayModel() returns early when this is not a SID leg', () => {
    const starLegModel = new LegModel(starRouteStringMock);
    const directLegModel = new LegModel(directRouteStringMock);
    const airport = new AirportModel(AIRPORT_JSON_KLAS_MOCK);
    const runwayModel = airport.getRunway('01L');
    const starLegGenerateWaypointCollectionSpy = sinon.spy(starLegModel, '_generateWaypointCollection');
    const directLegGenerateWaypointCollectionSpy = sinon.spy(directLegModel, '_generateWaypointCollection');

    starLegModel.updateSidLegForDepartureRunwayModel(runwayModel);
    directLegModel.updateSidLegForDepartureRunwayModel(runwayModel);

    expect(starLegGenerateWaypointCollectionSpy.notCalled).toBe(true);
    expect(directLegGenerateWaypointCollectionSpy.notCalled).toBe(true);
});

test('.updateSidLegForDepartureRunwayModel() returns early when the specified runway is already the one in use', () => {
    const model = new LegModel(sidRouteStringMock);
    const airport = new AirportModel(AIRPORT_JSON_KLAS_MOCK);
    const currentRunwayModel = airport.getRunway('25R');
    const generateWaypointCollectionSpy = sinon.spy(model, '_generateWaypointCollection');

    model.updateSidLegForDepartureRunwayModel(currentRunwayModel);

    expect(generateWaypointCollectionSpy.notCalled).toBe(true);
});

test('.updateSidLegForDepartureRunwayModel() returns early when the SID is not valid for the specified runway', () => {
    const model = new LegModel(sidRouteStringMock);
    const airport = new AirportModel(AIRPORT_JSON_KLAS_MOCK);
    const illegalRunwayModel = airport.getRunway('01R');
    const generateWaypointCollectionSpy = sinon.spy(model, '_generateWaypointCollection');

    model.updateSidLegForDepartureRunwayModel(illegalRunwayModel);

    expect(generateWaypointCollectionSpy.notCalled).toBe(true);
});

test('.updateSidLegForDepartureRunwayModel() regenerates #_waypointCollection IAW the new departure runway', () => {
    const model = new LegModel(sidRouteStringMock);
    const airport = new AirportModel(AIRPORT_JSON_KLAS_MOCK);
    const runwayModel = airport.getRunway('01L');
    const generateWaypointCollectionSpy = sinon.spy(model, '_generateWaypointCollection');

    model.updateSidLegForDepartureRunwayModel(runwayModel);

    const expectedWaypointNames = ['BESSY', 'WITLA', 'JEBBB', 'BOACH', 'ZELMA', 'JOTNU', 'TNP'];
    const waypointNames = model.waypoints.map((waypoint) => waypoint.name);

    expect(generateWaypointCollectionSpy.calledWithExactly('KLAS01L', 'TNP')).toBe(true);
    expect(waypointNames).toEqual(expectedWaypointNames);
});

test('.updateStarLegForArrivalRunwayModel() returns early when this is not a STAR leg', () => {
    const sidLegModel = new LegModel(sidRouteStringMock);
    const directLegModel = new LegModel(directRouteStringMock);
    const airport = new AirportModel(AIRPORT_JSON_KLAS_MOCK);
    const runwayModel = airport.getRunway('01L');
    const sidLegGenerateWaypointCollectionSpy = sinon.spy(sidLegModel, '_generateWaypointCollection');
    const directLegGenerateWaypointCollectionSpy = sinon.spy(directLegModel, '_generateWaypointCollection');

    sidLegModel.updateStarLegForArrivalRunwayModel(runwayModel);
    directLegModel.updateStarLegForArrivalRunwayModel(runwayModel);

    expect(sidLegGenerateWaypointCollectionSpy.notCalled).toBe(true);
    expect(directLegGenerateWaypointCollectionSpy.notCalled).toBe(true);
});

test('.updateStarLegForArrivalRunwayModel() returns early when the specified runway is already the one in use', () => {
    const model = new LegModel(starRouteStringMock);
    const airport = new AirportModel(AIRPORT_JSON_KLAS_MOCK);
    const currentRunwayModel = airport.getRunway('19R');
    const generateWaypointCollectionSpy = sinon.spy(model, '_generateWaypointCollection');

    model.updateStarLegForArrivalRunwayModel(currentRunwayModel);

    expect(generateWaypointCollectionSpy.notCalled).toBe(true);
});

test('.updateStarLegForArrivalRunwayModel() returns early when the STAR is not valid for the specified runway', () => {
    const model = new LegModel(starRouteStringMock);
    const airport = new AirportModel(AIRPORT_JSON_KLAS_MOCK);
    const illegalRunwayModel = airport.getRunway('01R');
    const generateWaypointCollectionSpy = sinon.spy(model, '_generateWaypointCollection');

    model.updateStarLegForArrivalRunwayModel(illegalRunwayModel);

    expect(generateWaypointCollectionSpy.notCalled).toBe(true);
});

test('.updateStarLegForArrivalRunwayModel() regenerates #_waypointCollection IAW the new departure runway', () => {
    const model = new LegModel(starRouteStringMock);
    const airport = new AirportModel(AIRPORT_JSON_KLAS_MOCK);
    const runwayModel = airport.getRunway('01L');
    const generateWaypointCollectionSpy = sinon.spy(model, '_generateWaypointCollection');

    model.updateStarLegForArrivalRunwayModel(runwayModel);

    const expectedWaypointNames = ['DAG', 'MISEN', 'CLARR', 'SKEBR', 'KEPEC',
        'IPUMY', 'NIPZO', 'SUNST', 'KIMME', 'CHIPZ', 'POKRR', 'PRINO'
    ];
    const waypointNames = model.waypoints.map((waypoint) => waypoint.name);

    expect(generateWaypointCollectionSpy.calledWithExactly('DAG', 'KLAS01L')).toBe(true);
    expect(waypointNames).toEqual(expectedWaypointNames);
});

test('._findIndexOfWaypointName() returns -1 when no waypoint in the #waypointCollection has the specified name', () => {
    const model = new LegModel(sidRouteStringMock);
    const expectedResult = -1;
    const result = model._findIndexOfWaypointName('thisFixIsNotInTheRoute');

    expect(result === expectedResult).toBe(true);
});

test('._findIndexOfWaypointName() returns the index of the WaypointModel in the #waypointCollection with the specified name', () => {
    const model = new LegModel('KLAS25R.BOACH6.TNP');
    const expectedResult = 3;
    const result = model._findIndexOfWaypointName('BOACH');

    expect(result === expectedResult).toBe(true);
});

test('._resetWaypointCollection() calls .skipAllWaypointsInLeg()', () => {
    const model = new LegModel(shortSidRouteStringMock);
    const skipAllWaypointsInLegSpy = sinon.spy(model, 'skipAllWaypointsInLeg');

    model._resetWaypointCollection();

    expect(skipAllWaypointsInLegSpy.calledWithExactly()).toBe(true);
});

test('._resetWaypointCollection() calls .reset() method of all waypoints', () => {
    const model = new LegModel(shortSidRouteStringMock);

    model.skipAllWaypointsInLeg();

    const jesjiWaypointResetSpy = sinon.spy(model._previousWaypointCollection[0], 'reset');
    const bakrrWaypointResetSpy = sinon.spy(model._previousWaypointCollection[1], 'reset');
    const tralrWaypointResetSpy = sinon.spy(model._previousWaypointCollection[2], 'reset');
    const mlfWaypointResetSpy = sinon.spy(model._previousWaypointCollection[3], 'reset');

    model._resetWaypointCollection();

    expect(model._previousWaypointCollection.length === 4).toBe(true);
    expect(jesjiWaypointResetSpy.calledWithExactly()).toBe(true);
    expect(bakrrWaypointResetSpy.calledWithExactly()).toBe(true);
    expect(tralrWaypointResetSpy.calledWithExactly()).toBe(true);
    expect(mlfWaypointResetSpy.calledWithExactly()).toBe(true);
});

test('._verifyAirwayAndEntryAndExitAreValid() throws when #_airwayModel is null', () => {
    const model = new LegModel(directRouteStringMock);

    expect(() => model._verifyAirwayAndEntryAndExitAreValid('entryName', 'exitName')).toThrow();
});

test('._verifyAirwayAndEntryAndExitAreValid() throws when the specified entry is not on the airway', () => {
    const model = new LegModel('CHRLT.V394.LAS');
    const invalidEntryName = 'invalidEntry';
    const validExitName = 'SUVIE';

    expect(() => model._verifyAirwayAndEntryAndExitAreValid(invalidEntryName, validExitName)).toThrow();
});

test('._verifyAirwayAndEntryAndExitAreValid() throws when the specified exit is not on the airway', () => {
    const model = new LegModel('CHRLT.V394.LAS');
    const validEntryName = 'DISBE';
    const invalidExitName = 'invalidExit';

    expect(() => model._verifyAirwayAndEntryAndExitAreValid(validEntryName, invalidExitName)).toThrow();
});

test('._verifyAirwayAndEntryAndExitAreValid() does not throw when the specified entry and exit are both on the airway', () => {
    const model = new LegModel('CHRLT.V394.LAS');
    const validEntryName = 'DISBE';
    const validExitName = 'SUVIE';

    expect(() => model._verifyAirwayAndEntryAndExitAreValid(validEntryName, validExitName)).not.toThrow();
});

test('._verifyProcedureAndEntryAndExitAreValid() throws when #_procedureModel is null', () => {
    const model = new LegModel(directRouteStringMock);

    expect(() => model._verifyProcedureAndEntryAndExitAreValid('entryName', 'exitName')).toThrow();
});

test('._verifyProcedureAndEntryAndExitAreValid() throws when the specified entry is not valid for the procedure', () => {
    const model = new LegModel('KLAS25R.BOACH6.TNP');
    const invalidEntryName = 'invalidEntry';
    const validExitName = 'HEC';

    expect(() => model._verifyProcedureAndEntryAndExitAreValid(invalidEntryName, validExitName)).toThrow();
});

test('._verifyProcedureAndEntryAndExitAreValid() throws when the specified exit is not valid for the procedure', () => {
    const model = new LegModel('KLAS25R.BOACH6.TNP');
    const validEntryName = 'KLAS25L';
    const invalidExitName = 'invalidExit';

    expect(() => model._verifyProcedureAndEntryAndExitAreValid(validEntryName, invalidExitName)).toThrow();
});

test('._verifyProcedureAndEntryAndExitAreValid() does not throw when the specified entry and exit are valid for the procedure', () => {
    const model = new LegModel('KLAS25R.BOACH6.TNP');
    const validEntryName = 'KLAS25L';
    const validExitName = 'HEC';

    expect(() => model._verifyProcedureAndEntryAndExitAreValid(validEntryName, validExitName)).not.toThrow();
});

// test('._buildWaypointForDirectRoute() returns an array with a single instance of a WaypointModel', () => {
//     const model = new LegModel(directRouteStringMockMock, runwayMock, arrivalFlightPhaseMock, navigationLibraryFixture);
//     const result = model._buildWaypointForDirectRoute(directRouteStringMockMock);
//
//     expect(_isArray(result)).toBe(true);
//     expect(result[0] instanceof WaypointModel).toBe(true);
//     expect(result[0].name === 'cowby').toBe(true);
// });
//
// test('._buildWaypointForHoldingPattern() returns an array with a single instance of a WaypointModel with hold properties for a Fix', () => {
//     const model = new LegModel(directRouteStringMockMock, runwayMock, arrivalFlightPhaseMock, navigationLibraryFixture);
//     const result = model._buildWaypointForHoldingPattern(holdRouteStringMock);
//
//     expect(_isArray(result)).toBe(true);
//     expect(result[0] instanceof WaypointModel).toBe(true);
//     expect(result[0].isHold).toBe(true);
//     expect(result[0].name === 'cowby').toBe(true);
//     expect(result[0].altitudeMaximum === INVALID_NUMBER).toBe(true);
//     expect(result[0].altitudeMinimum === INVALID_NUMBER).toBe(true);
//     expect(result[0].speedMaximum === INVALID_NUMBER).toBe(true);
//     expect(result[0].speedMinimum === INVALID_NUMBER).toBe(true);
//     expect(result[0]._turnDirection === 'right').toBe(true);
//     expect(result[0]._legLength === '1min').toBe(true);
//     expect(result[0].timer === INVALID_NUMBER).toBe(true);
// });
//
// test('._buildWaypointForHoldingPatternAtPosition() returns an array with a single instance of a WaypointModel with hold properties for GPS', () => {
//     const model = new LegModel(HOLD_AT_PRESENT_LOCATION_MOCK.name, runwayMock, arrivalFlightPhaseMock, navigationLibraryFixture, HOLD_AT_PRESENT_LOCATION_MOCK);
//     const result = model._buildWaypointForHoldingPatternAtPosition(HOLD_AT_PRESENT_LOCATION_MOCK);
//
//     expect(_isArray(result)).toBe(true);
//     expect(result[0] instanceof WaypointModel).toBe(true);
//     expect(result[0].isHold).toBe(true);
//     expect(result[0].name === 'gps').toBe(true);
//     expect(result[0].altitudeMaximum === INVALID_NUMBER).toBe(true);
//     expect(result[0].altitudeMinimum === INVALID_NUMBER).toBe(true);
//     expect(result[0].speedMaximum === INVALID_NUMBER).toBe(true);
//     expect(result[0].speedMinimum === INVALID_NUMBER).toBe(true);
//     expect(result[0]._turnDirection === 'left').toBe(true);
//     expect(result[0]._legLength === '3min').toBe(true);
//     expect(result[0].timer === -999).toBe(true);
// });
//
// test('._buildWaypointForHoldingPatternAtPosition() returns the same position for a hold Waypoint at a fix vs position', () => {
//     const model = new LegModel(HOLD_AT_PRESENT_LOCATION_MOCK.name, runwayMock, arrivalFlightPhaseMock, navigationLibraryFixture, HOLD_AT_PRESENT_LOCATION_MOCK);
//     const fixResult = model._buildWaypointForHoldingPattern(holdRouteStringMock);
//     const positionalHoldingProps = Object.assign(HOLD_AT_PRESENT_LOCATION_MOCK, { positionModel: cowbyFixFixture.positionModel });
//     const positionResult = model._buildWaypointForHoldingPatternAtPosition(positionalHoldingProps);
//
//     expect(_isEqual(fixResult[0].relativePosition, positionResult[0].relativePosition)).toBe(true);
// });
//
// test('._buildWaypointCollectionForProcedureRoute() returns a list of WaypointModels', () => {
//     const model = new LegModel(arrivalProcedureRouteStringMock, runwayMock, arrivalFlightPhaseMock, navigationLibraryFixture);
//     const result = model._buildWaypointCollectionForProcedureRoute(arrivalProcedureRouteStringMock, runwayMock);
//
//     ;
//     for (let i = 0; i < result.length; i++) {
//         expect(result[i] instanceof WaypointModel).toBe(true);
//     }
// });
//
// test('._buildProcedureType() returns early when #routeString is a directRouteStringMock', () => {
//     const model = new LegModel(directRouteStringMockMock, runwayMock, arrivalFlightPhaseMock, navigationLibraryFixture);
//
//     expect(model.procedureType === '').toBe(true);
// });
//
// test('._buildProcedureType() sets #procedureType as `SID` the #routeString is a procedureType and #flightPhase is departure', () => {
//     const model = new LegModel(departureProcedureRouteStringMock, runwayMock, departureFlightPhaseMock, navigationLibraryFixture);
//
//     expect(model.procedureType === 'SID').toBe(true);
// });
//
// test('._buildProcedureType() sets #procedureType as `STAR` the #routeString is a procedureType and #flightPhase is arrival', () => {
//     const model = new LegModel(arrivalProcedureRouteStringMock, runwayMock, arrivalFlightPhaseMock, navigationLibraryFixture);
//
//     expect(model.procedureType === 'STAR').toBe(true);
// });
