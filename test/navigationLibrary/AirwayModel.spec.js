import { test, expect, vi } from 'vitest';
import sinon from 'sinon';
import _isArray from 'lodash/isArray';
import _map from 'lodash/map';
import AirwayModel from '../../src/assets/scripts/client/navigationLibrary/AirwayModel';
import {
    createNavigationLibraryFixture,
    resetNavigationLibraryFixture,
} from '../fixtures/navigationLibraryFixtures';

const airwayNameMock = 'V587';
const validAirwayFixes = ['DAG', 'JOKUR', 'DANBY', 'WHIGG', 'BOACH', 'CRESO', 'BLD'];
const airwayWithUnknownFix = [
    'DAG',
    'JOKUR',
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    'WHIGG',
    'BOACH',
    'CRESO',
    'BLD',
];
const fixNotOnAirway = 'PRINO';

beforeEach(() => {
    createNavigationLibraryFixture();
});

afterEach(() => {
    resetNavigationLibraryFixture();
});

test('throws when any fix in the airway definition is not defined in the fixes section', () => {
    expect(() => new AirwayModel(airwayNameMock, airwayWithUnknownFix)).toThrow();
});

test('throws when an empty airway name is given', () => {
    expect(() => new AirwayModel(undefined, validAirwayFixes)).toThrow();
    expect(() => new AirwayModel(null, validAirwayFixes)).toThrow();
    expect(() => new AirwayModel('', validAirwayFixes)).toThrow();
});

test('throws when airway definition does not include any fixes', () => {
    expect(() => new AirwayModel(airwayNameMock, undefined)).toThrow();
    expect(() => new AirwayModel(airwayNameMock, null)).toThrow();
    expect(() => new AirwayModel(airwayNameMock, {})).toThrow();
    expect(() => new AirwayModel(airwayNameMock, [])).toThrow();
});

test('initializes correctly when provided valid airway name and fix list', () => {
    const model = new AirwayModel(airwayNameMock, validAirwayFixes);

    expect(model._icao === airwayNameMock).toBe(true);
    expect(_isArray(model._fixNameCollection)).toBe(true);
    expect(model._fixNameCollection.length === 7).toBe(true);
});

test('.getWaypointModelsForEntryAndExit() returns early when specified entry is the same as the exit', () => {
    const model = new AirwayModel(airwayNameMock, validAirwayFixes);
    const getFixNamesFromIndexToIndexSpy = sinon.spy(model, '_getFixNamesFromIndexToIndex');
    const result = model.getWaypointModelsForEntryAndExit('JOKUR', 'JOKUR');

    expect(typeof result === 'undefined').toBe(true);
    expect(getFixNamesFromIndexToIndexSpy.notCalled).toBe(true);
});

test('.getWaypointModelsForEntryAndExit() returns early when specified entry is not on the airway', () => {
    const model = new AirwayModel(airwayNameMock, validAirwayFixes);
    const getFixNamesFromIndexToIndexSpy = sinon.spy(model, '_getFixNamesFromIndexToIndex');
    const result = model.getWaypointModelsForEntryAndExit(fixNotOnAirway, 'CRESO');

    expect(typeof result === 'undefined').toBe(true);
    expect(getFixNamesFromIndexToIndexSpy.notCalled).toBe(true);
});

test('.getWaypointModelsForEntryAndExit() returns early when specified exit is not on the airway', () => {
    const model = new AirwayModel(airwayNameMock, validAirwayFixes);
    const getFixNamesFromIndexToIndexSpy = sinon.spy(model, '_getFixNamesFromIndexToIndex');
    const result = model.getWaypointModelsForEntryAndExit('JOKUR', fixNotOnAirway);

    expect(typeof result === 'undefined').toBe(true);
    expect(getFixNamesFromIndexToIndexSpy.notCalled).toBe(true);
});

test('.getWaypointModelsForEntryAndExit() calls ._getFixNamesFromIndexToIndex() correctly for forward-order fix chains', () => {
    const model = new AirwayModel(airwayNameMock, validAirwayFixes);
    const getFixNamesFromIndexToIndexSpy = sinon.spy(model, '_getFixNamesFromIndexToIndex');
    const result = model.getWaypointModelsForEntryAndExit('JOKUR', 'CRESO');
    const expectedFixNames = ['JOKUR', 'DANBY', 'WHIGG', 'BOACH', 'CRESO'];
    const fixNames = _map(result, (fixModel) => fixModel.name);

    expect(getFixNamesFromIndexToIndexSpy.calledWithExactly(1, 5)).toBe(true);
    expect(fixNames).toEqual(expectedFixNames);
});

test('.getWaypointModelsForEntryAndExit() calls ._getFixNamesFromIndexToIndex() correctly for backward-order fix chains', () => {
    const model = new AirwayModel(airwayNameMock, validAirwayFixes);
    const getFixNamesFromIndexToIndexSpy = sinon.spy(model, '_getFixNamesFromIndexToIndex');
    const result = model.getWaypointModelsForEntryAndExit('CRESO', 'JOKUR');
    const expectedFixNames = ['CRESO', 'BOACH', 'WHIGG', 'DANBY', 'JOKUR'];
    const fixNames = _map(result, (fixModel) => fixModel.name);

    expect(getFixNamesFromIndexToIndexSpy.calledWithExactly(5, 1)).toBe(true);
    expect(fixNames).toEqual(expectedFixNames);
});

test('.hasFixName() returns false when the specified fix is not on the airway', () => {
    const model = new AirwayModel(airwayNameMock, validAirwayFixes);
    const result = model.hasFixName('ABCDE');

    expect(result).toBe(false);
});

test('.hasFixName() returns true when the specified fix is on the airway', () => {
    const model = new AirwayModel(airwayNameMock, validAirwayFixes);
    const result = model.hasFixName('BOACH');

    expect(result).toBe(true);
});

test('._getFixNamesFromIndexToIndex() throws when specified indices are the same', () => {
    const model = new AirwayModel(airwayNameMock, validAirwayFixes);

    expect(() => model._getFixNamesFromIndexToIndex(1, 1)).toThrow();
});
