import { test, expect, vi } from 'vitest';
import sinon from 'sinon';
import EventBus from '../../src/assets/scripts/client/lib/EventBus';
import RadarTargetModel from '../../src/assets/scripts/client/scope/RadarTargetModel';
import {
    ARRIVAL_AIRCRAFT_MODEL_MOCK,
    ARRIVAL_AIRCRAFT_MODEL_MOCK_HEAVY,
    ARRIVAL_AIRCRAFT_MODEL_MOCK_SUPER,
    DEPARTURE_AIRCRAFT_MODEL_MOCK
} from '../aircraft/_mocks/aircraftMocks';
import { INVALID_NUMBER } from '../../src/assets/scripts/client/constants/globalConstants';
import { THEME } from '../../src/assets/scripts/client/constants/themes';

let sandbox; // using the sinon sandbox ensures stubs are restored after each test

beforeEach(() => {
    sandbox = sinon.createSandbox();
});

afterEach(() => {
    sandbox.restore();
});

test('throws when called to instantiate with no parameters', () => {
    expect(() => new RadarTargetModel()).toThrow();
});

test('initializes correctly when called to instantiate with correct parameters', () => {
    const model = new RadarTargetModel(THEME.DEFAULT, ARRIVAL_AIRCRAFT_MODEL_MOCK);

    expect(model.aircraftModel).toEqual(ARRIVAL_AIRCRAFT_MODEL_MOCK);
    expect(model._cruiseAltitude === 28000).toBe(true);
    expect(model._dataBlockLeaderDirection === THEME.DEFAULT.DATA_BLOCK.LEADER_DIRECTION).toBe(true);
    expect(model._dataBlockLeaderLength === THEME.DEFAULT.DATA_BLOCK.LEADER_LENGTH).toBe(true);
    expect(model._eventBus).toEqual(EventBus);
    expect(model._hasFullDataBlock === true).toBe(true);
    expect(model._haloRadius === INVALID_NUMBER).toBe(true);
    expect(model._hasSuppressedDataBlock === false).toBe(true);
    expect(model._interimAltitude === INVALID_NUMBER).toBe(true);
    expect(model._isUnderOurControl === true).toBe(true);
    expect(model._routeString === 'DAG.KEPEC3.KLAS07R').toBe(true);
    expect(model._scratchPadText === 'LAS').toBe(true);
    expect(model._theme === THEME.DEFAULT).toBe(true);
});

test('#dataBlockLeaderDirection returns appropriate value', () => {
    const model = new RadarTargetModel(THEME.DEFAULT, ARRIVAL_AIRCRAFT_MODEL_MOCK);

    expect(model.dataBlockLeaderDirection === model._dataBlockLeaderDirection).toBe(true);
});

test('#dataBlockLeaderLength returns appropriate value', () => {
    const model = new RadarTargetModel(THEME.DEFAULT, ARRIVAL_AIRCRAFT_MODEL_MOCK);

    expect(model.dataBlockLeaderLength === model._dataBlockLeaderLength).toBe(true);
});

test('#positionModel returns appropriate value', () => {
    const model = new RadarTargetModel(THEME.DEFAULT, ARRIVAL_AIRCRAFT_MODEL_MOCK);

    expect(model.positionModel).toEqual(model.aircraftModel.positionModel);
});

test('#indicatedAltitude returns appropriate value', () => {
    const model = new RadarTargetModel(THEME.DEFAULT, ARRIVAL_AIRCRAFT_MODEL_MOCK);

    expect(model.indicatedAltitude === model.aircraftModel.altitude).toBe(true);
});

test('.amendAltitude() sets #_cruiseAltitude to the specified altitude', () => {
    const model = new RadarTargetModel(THEME.DEFAULT, ARRIVAL_AIRCRAFT_MODEL_MOCK);
    const expectedResponse = [true, 'AMEND ALTITUDE'];
    const newAltitude = 210;

    const response = model.amendAltitude(newAltitude);

    expect(response).toEqual(expectedResponse);
    expect(model._cruiseAltitude === newAltitude).toBe(true);
});

test('.markAsNotOurControl() sets #_isUnderOurControl to false', () => {
    const model = new RadarTargetModel(THEME.DEFAULT, ARRIVAL_AIRCRAFT_MODEL_MOCK);

    model.markAsNotOurControl();

    expect(model._isUnderOurControl).toBe(false);
});

test('.markAsOurControl() sets #_isUnderOurControl to false', () => {
    const model = new RadarTargetModel(THEME.DEFAULT, ARRIVAL_AIRCRAFT_MODEL_MOCK);

    model.markAsOurControl();

    expect(model._isUnderOurControl).toBe(true);
});

test('.moveDataBlock() returns syntax error when no arguments provided', () => {
    const model = new RadarTargetModel(THEME.DEFAULT, ARRIVAL_AIRCRAFT_MODEL_MOCK);
    const expectedResponse = [false, 'ERR: BAD SYNTAX'];
    const response = model.moveDataBlock('');

    expect(response).toEqual(expectedResponse);
    expect(model._dataBlockLeaderDirection === THEME.DEFAULT.DATA_BLOCK.LEADER_DIRECTION).toBe(true);
    expect(model._dataBlockLeaderLength === THEME.DEFAULT.DATA_BLOCK.LEADER_LENGTH).toBe(true);
});

test('.moveDataBlock() returns syntax error when invalid direction provided', () => {
    const model = new RadarTargetModel(THEME.DEFAULT, ARRIVAL_AIRCRAFT_MODEL_MOCK);
    const expectedResponse = [false, 'ERR: BAD SYNTAX'];
    const response = model.moveDataBlock('0');

    expect(response).toEqual(expectedResponse);
    expect(model._dataBlockLeaderDirection === THEME.DEFAULT.DATA_BLOCK.LEADER_DIRECTION).toBe(true);
    expect(model._dataBlockLeaderLength === THEME.DEFAULT.DATA_BLOCK.LEADER_LENGTH).toBe(true);
});

test('.moveDataBlock() returns error when a leader length greater than 6 is requested', () => {
    const model = new RadarTargetModel(THEME.DEFAULT, ARRIVAL_AIRCRAFT_MODEL_MOCK);
    const expectedResponse = [false, 'ERR: LEADER LENGTH 0-6 ONLY'];
    const response = model.moveDataBlock('/7');

    expect(response).toEqual(expectedResponse);
    expect(model._dataBlockLeaderDirection === THEME.DEFAULT.DATA_BLOCK.LEADER_DIRECTION).toBe(true);
    expect(model._dataBlockLeaderLength === THEME.DEFAULT.DATA_BLOCK.LEADER_LENGTH).toBe(true);
});

test('.moveDataBlock() correctly sets properties when only a direction is provided', () => {
    const model = new RadarTargetModel(THEME.DEFAULT, ARRIVAL_AIRCRAFT_MODEL_MOCK);
    const expectedResponse = [true, 'ADJUST DATA BLOCK'];
    const response = model.moveDataBlock('1');

    expect(response).toEqual(expectedResponse);
    expect(model._dataBlockLeaderDirection === 225).toBe(true);
    expect(model._dataBlockLeaderLength === THEME.DEFAULT.DATA_BLOCK.LEADER_LENGTH).toBe(true);
});

test('.moveDataBlock() correctly sets properties when only a length is provided', () => {
    const model = new RadarTargetModel(THEME.DEFAULT, ARRIVAL_AIRCRAFT_MODEL_MOCK);
    const expectedResponse = [true, 'ADJUST DATA BLOCK'];
    const response = model.moveDataBlock('/3');

    expect(response).toEqual(expectedResponse);
    expect(model._dataBlockLeaderDirection === THEME.DEFAULT.DATA_BLOCK.LEADER_DIRECTION).toBe(true);
    expect(model._dataBlockLeaderLength === 3).toBe(true);
});

test('.moveDataBlock() correctly sets properties when both a direction and length are provided', () => {
    const model = new RadarTargetModel(THEME.DEFAULT, ARRIVAL_AIRCRAFT_MODEL_MOCK);
    const expectedResponse = [true, 'ADJUST DATA BLOCK'];
    const response = model.moveDataBlock('3/2');

    expect(response).toEqual(expectedResponse);
    expect(model._dataBlockLeaderDirection === 135).toBe(true);
    expect(model._dataBlockLeaderLength === 2).toBe(true);
});

test('.setScratchpad() sets #_scratchPadText to the specified string', () => {
    const model = new RadarTargetModel(THEME.DEFAULT, ARRIVAL_AIRCRAFT_MODEL_MOCK);
    const expectedResponse = [true, 'SET SCRATCHPAD'];
    const newScratchPadText = 'V6R';

    const response = model.setScratchpad(newScratchPadText);

    expect(response).toEqual(expectedResponse);
    expect(model._scratchPadText === newScratchPadText).toBe(true);
});

test('.setHalo() sets halo radius correctly when no halo previously existed', () => {
    const radarTargetModel = new RadarTargetModel(THEME.DEFAULT, ARRIVAL_AIRCRAFT_MODEL_MOCK);
    const expectedResponse = [true, 'TOGGLE HALO'];
    const response = radarTargetModel.setHalo(7);

    expect(response).toEqual(expectedResponse);
    expect(radarTargetModel._haloRadius === 7).toBe(true);
});

test('.setHalo() adjusts halo radius correctly when a halo previously existed', () => {
    const radarTargetModel = new RadarTargetModel(THEME.DEFAULT, ARRIVAL_AIRCRAFT_MODEL_MOCK);

    radarTargetModel._haloRadius = 5;

    const expectedResponse = [true, 'ADJUST HALO'];
    const response = radarTargetModel.setHalo(7);

    expect(response).toEqual(expectedResponse);
    expect(radarTargetModel._haloRadius === 7).toBe(true);
});

test('.setHalo() calls .removeHalo() when a halo is requested of the same radius as the existing', () => {
    const radarTargetModel = new RadarTargetModel(THEME.DEFAULT, ARRIVAL_AIRCRAFT_MODEL_MOCK);
    const removeHaloStub = sinon.stub(radarTargetModel, 'removeHalo');

    radarTargetModel._haloRadius = 7;

    const expectedResponse = undefined;
    const response = radarTargetModel.setHalo(7);

    expect(response === expectedResponse).toBe(true);
    expect(removeHaloStub.calledWithExactly()).toBe(true);
});

test('.setDefaultScratchpad() sets #_scratchPadText to show aircraft\'s destination', () => {
    const model = new RadarTargetModel(THEME.DEFAULT, ARRIVAL_AIRCRAFT_MODEL_MOCK);
    const expectedValue = model.aircraftModel.destination.substr(1);

    model.setDefaultScratchpad();

    expect(model._scratchPadText === expectedValue).toBe(true);
});

test('.setDefaultScratchpad() sets #_scratchPadText to departure exit fix when aircraft is on departure route', () => {
    const model = new RadarTargetModel(THEME.DEFAULT, DEPARTURE_AIRCRAFT_MODEL_MOCK);
    const expectedValue = 'GUP';

    model.setDefaultScratchpad();

    expect(model._scratchPadText === expectedValue).toBe(true);
});

test('.setDefaultScratchpad() sets #_scratchPadText to arrival airport when aircraft is on arrival route', () => {
    const model = new RadarTargetModel(THEME.DEFAULT, ARRIVAL_AIRCRAFT_MODEL_MOCK);
    const expectedValue = 'LAS';

    model.setDefaultScratchpad();

    expect(model._scratchPadText === expectedValue).toBe(true);
});

test('._setTheme returns early when an invalid theme name is passed', () => {
    const model = new RadarTargetModel(THEME.DEFAULT, ARRIVAL_AIRCRAFT_MODEL_MOCK);
    const themeName = 'great googly moogly!';

    model._setTheme(themeName);

    expect(model._theme === THEME.DEFAULT).toBe(true);
});

test('._setTheme() changes the value of #_theme', () => {
    const model = new RadarTargetModel(THEME.DEFAULT, ARRIVAL_AIRCRAFT_MODEL_MOCK);
    const themeName = 'CLASSIC';

    model._setTheme(themeName);

    expect(model._theme === THEME.CLASSIC).toBe(true);
});

test('.buildDataBlockRowOne() creates correct first row for Large', () => {
    const model = new RadarTargetModel(THEME.DEFAULT, ARRIVAL_AIRCRAFT_MODEL_MOCK);
    const expectedValue = 'AAL432';

    expect(model.buildDataBlockRowOne() === expectedValue).toBe(true);
});

test('.buildDataBlockRowOne() creates correct first row for Heavy', () => {
    const model = new RadarTargetModel(THEME.DEFAULT, ARRIVAL_AIRCRAFT_MODEL_MOCK_HEAVY);
    const expectedValue = 'UAL99 H';

    expect(model.buildDataBlockRowOne() === expectedValue).toBe(true);
});

test('.buildDataBlockRowOne() creates correct first row for Super', () => {
    const model = new RadarTargetModel(THEME.DEFAULT, ARRIVAL_AIRCRAFT_MODEL_MOCK_SUPER);
    const expectedValue = 'UAE11 J';

    expect(model.buildDataBlockRowOne() === expectedValue).toBe(true);
});
