import { test, expect, vi } from 'vitest';
import _every from 'lodash/every';
import _map from 'lodash/map';
import _isArray from 'lodash/isArray';
import ProcedureModel from '../../../src/assets/scripts/client/navigationLibrary/ProcedureModel';
import {
    createNavigationLibraryFixture,
    resetNavigationLibraryFixture,
} from '../../fixtures/navigationLibraryFixtures';
import { SID_MOCK, STAR_MOCK } from './_mocks/procedureMocks';
import { PROCEDURE_TYPE } from '../../../src/assets/scripts/client/constants/routeConstants';

// mocks
const invalidEntryMock = 'blahblahblah';
const invalidExitMock = 'blahblahblah';
const validBoachEntryMock = 'KLAS07R';
const validBoachExitMock = 'TNP';

beforeEach(() => {
    createNavigationLibraryFixture();
});

afterEach(() => {
    resetNavigationLibraryFixture();
});

test('throws when instantiated without parameters', () => {
    expect(() => new ProcedureModel()).toThrow();
});

test('throws when instantiated with a procedure type but no data', () => {
    expect(() => new ProcedureModel(PROCEDURE_TYPE.SID)).toThrow();
});

test('throws when instantiated with unknown procedure type', () => {
    expect(() => new ProcedureModel('invalidProcedureType', SID_MOCK.BOACH6)).toThrow();
});

test('instantiates correctly when given valid SID data', () => {
    const model = new ProcedureModel(PROCEDURE_TYPE.SID, SID_MOCK.BOACH6);
    const expectedEntries = [
        'KLAS01L',
        'KLAS01R',
        'KLAS07L',
        'KLAS07R',
        'KLAS19L',
        'KLAS19R',
        'KLAS25L',
        'KLAS25R',
    ];
    const expectedExits = ['HEC', 'TNP'];

    expect(model._body[0]).toEqual(['BOACH', 'A130+']);
    expect(model._body.length === 1).toBe(true);
    expect(model._entryPoints.KLAS07R[0] === 'JESJI').toBe(true);
    expect(Object.keys(model._entryPoints)).toEqual(expectedEntries);
    expect(model._exitPoints.TNP[0] === 'ZELMA').toBe(true);
    expect(Object.keys(model._exitPoints)).toEqual(expectedExits);
    expect(model._draw).toEqual(SID_MOCK.BOACH6.draw);
    expect(model._icao === SID_MOCK.BOACH6.icao).toBe(true);
    expect(model._name === SID_MOCK.BOACH6.name).toBe(true);
});

test('instantiates correctly when given valid STAR data', () => {
    const model = new ProcedureModel(PROCEDURE_TYPE.STAR, STAR_MOCK.KEPEC1);
    const expectedEntries = ['DAG', 'TNP'];
    const expectedExits = [
        'KLAS01L',
        'KLAS01R',
        'KLAS07L',
        'KLAS07R',
        'KLAS19L',
        'KLAS19R',
        'KLAS25L',
        'KLAS25R',
    ];

    expect(model._body[0]).toEqual(['CLARR', 'A130|S250']);
    expect(model._body.length === 4).toBe(true);
    expect(model._entryPoints.TNP[1] === 'JOTNU').toBe(true);
    expect(Object.keys(model._entryPoints)).toEqual(expectedEntries);
    expect(model._exitPoints.KLAS07R[0]).toEqual(['CHIPZ', 'A80|S170']);
    expect(Object.keys(model._exitPoints)).toEqual(expectedExits);
    expect(model._draw).toEqual(STAR_MOCK.KEPEC1.draw);
    expect(model._icao === STAR_MOCK.KEPEC1.icao).toBe(true);
    expect(model._name === STAR_MOCK.KEPEC1.name).toBe(true);
});

test('#draw returns value of #_draw', () => {
    const model = new ProcedureModel(PROCEDURE_TYPE.SID, SID_MOCK.BOACH6);
    const expectedResult = model._draw;
    const result = model.draw;

    expect(result).toEqual(expectedResult);
});

test('#icao returns value of #_icao', () => {
    const model = new ProcedureModel(PROCEDURE_TYPE.SID, SID_MOCK.BOACH6);
    const expectedResult = model._icao;
    const result = model.icao;

    expect(result === expectedResult).toBe(true);
});

test('#name returns value of #_name', () => {
    const model = new ProcedureModel(PROCEDURE_TYPE.SID, SID_MOCK.BOACH6);
    const expectedResult = model._name;
    const result = model.name;

    expect(result === expectedResult).toBe(true);
});

test('#procedureType returns value of #_procedureType', () => {
    const model = new ProcedureModel(PROCEDURE_TYPE.SID, SID_MOCK.BOACH6);
    const expectedResult = model._procedureType;
    const result = model.procedureType;

    expect(result === expectedResult).toBe(true);
});

test('.getAllFixNamesInUse() throws when #_draw is not a 2D array', () => {
    const model = new ProcedureModel(PROCEDURE_TYPE.SID, SID_MOCK.BOACH6);

    model._draw = [];

    expect(() => model.getAllFixNamesInUse()).toThrow();
});

test('.getAllFixNamesInUse() returns all fix names that exist in any portion of the procedure', () => {
    const model = new ProcedureModel(PROCEDURE_TYPE.SID, SID_MOCK.BOACH6);
    const expectedResult = [
        'BESSY',
        'WITLA',
        'JEBBB',
        'WASTE',
        'BAKRR',
        'MINEY',
        'HITME',
        'JESJI',
        'FIXIX',
        'ROPPR',
        'RODDD',
        'JAKER',
        'PIRMD',
        'RBELL',
        'BOACH',
        'HEC',
        'ZELMA',
        'JOTNU',
        'TNP',
    ];
    const result = model.getAllFixNamesInUse();

    expect(result).toEqual(expectedResult);
});

test('.getRandomExitPoint() returns different exit point names on successive calls', () => {
    const model = new ProcedureModel(PROCEDURE_TYPE.SID, SID_MOCK.BOACH6);
    // making call count high to prevent chance of erroneous failure
    // callCount 15 yields 1 in 32k chance of failure on 2-exit SID (such as in this test)
    const callCount = 15;
    const randomlySelectedExitNames = [];

    for (let i = 0; i < callCount; i++) {
        randomlySelectedExitNames.push(model.getRandomExitPoint());
    }

    const allExitsAreEqual = _every(
        randomlySelectedExitNames,
        (name) => name === randomlySelectedExitNames[0]
    );

    expect(allExitsAreEqual).toBe(false);
});

test('.getWaypointModelsForEntryAndExit() returns early when specified entry point is invalid', () => {
    const model = new ProcedureModel(PROCEDURE_TYPE.SID, SID_MOCK.BOACH6);
    const result = model.getWaypointModelsForEntryAndExit(invalidEntryMock, validBoachExitMock);

    expect(typeof result === 'undefined').toBe(true);
});

test('.getWaypointModelsForEntryAndExit() returns early when specified exit point is invalid', () => {
    const model = new ProcedureModel(PROCEDURE_TYPE.SID, SID_MOCK.BOACH6);
    const result = model.getWaypointModelsForEntryAndExit(validBoachEntryMock, invalidExitMock);

    expect(typeof result === 'undefined').toBe(true);
});

test('.getWaypointModelsForEntryAndExit() returns correct waypoints when specified entry/exit are valid', () => {
    const model = new ProcedureModel(PROCEDURE_TYPE.SID, SID_MOCK.BOACH6);
    const result = model.getWaypointModelsForEntryAndExit(validBoachEntryMock, validBoachExitMock);
    const resultingWaypointNames = _map(result, (waypointModel) => waypointModel._name);
    const expectedWaypointNames = [
        'JESJI',
        'BAKRR',
        'MINEY',
        'HITME',
        'BOACH',
        'ZELMA',
        'JOTNU',
        'TNP',
    ];

    expect(_isArray(result)).toBe(true);
    expect(result.length === 8).toBe(true);
    expect(resultingWaypointNames).toEqual(expectedWaypointNames);
});

test('.hasEntry() returns false when the specified entry is not valid for the procedure', () => {
    const model = new ProcedureModel(PROCEDURE_TYPE.SID, SID_MOCK.BOACH6);
    const result = model.hasEntry(invalidEntryMock);

    expect(result).toBe(false);
});

test('.hasEntry() returns true when the specified entry is valid for the procedure', () => {
    const model = new ProcedureModel(PROCEDURE_TYPE.SID, SID_MOCK.BOACH6);
    const result = model.hasEntry(validBoachEntryMock);

    expect(result).toBe(true);
});

test('.hasExit() returns false when the specified exit is not valid for the procedure', () => {
    const model = new ProcedureModel(PROCEDURE_TYPE.SID, SID_MOCK.BOACH6);
    const result = model.hasExit(invalidExitMock);

    expect(result).toBe(false);
});

test('.hasExit() returns true when the specified exit is valid for the procedure', () => {
    const model = new ProcedureModel(PROCEDURE_TYPE.SID, SID_MOCK.BOACH6);
    const result = model.hasExit(validBoachExitMock);

    expect(result).toBe(true);
});

test('.isSid() returns false when this procedure is not a SID', () => {
    const model = new ProcedureModel(PROCEDURE_TYPE.STAR, STAR_MOCK.KEPEC1);

    expect(model.isSid()).toBe(false);
});

test('.isSid() returns true when this procedure is a SID', () => {
    const model = new ProcedureModel(PROCEDURE_TYPE.SID, SID_MOCK.BOACH6);

    expect(model.isSid()).toBe(true);
});

test('.isStar() returns false when this procedure is not a STAR', () => {
    const model = new ProcedureModel(PROCEDURE_TYPE.SID, SID_MOCK.BOACH6);

    expect(model.isStar()).toBe(false);
});

test('.isStar() returns true when this procedure is a STAR', () => {
    const model = new ProcedureModel(PROCEDURE_TYPE.STAR, STAR_MOCK.KEPEC1);

    expect(model.isStar()).toBe(true);
});

test('._getFixNameFromRestrictedFixArray() returns undefined when provided a vector waypoint name', () => {
    const model = new ProcedureModel(PROCEDURE_TYPE.SID, SID_MOCK.BOACH6);
    const result = model._getFixNameFromRestrictedFixArray('#123');

    expect(typeof result === 'undefined').toBe(true);
});

test('._generateWaypointsForEntry() throws when specified entry point is invalid', () => {
    const model = new ProcedureModel(PROCEDURE_TYPE.SID, SID_MOCK.BOACH6);

    expect(() => model._generateWaypointsForEntry(invalidEntryMock)).toThrow();
});

test('._generateWaypointsForExit() throws when specified exit point is invalid', () => {
    const model = new ProcedureModel(PROCEDURE_TYPE.SID, SID_MOCK.BOACH6);

    expect(() => model._generateWaypointsForExit(invalidExitMock)).toThrow();
});
