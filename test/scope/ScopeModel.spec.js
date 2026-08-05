import { test, expect, vi } from 'vitest';
import sinon from 'sinon';
import GameController from '../../src/assets/scripts/client/game/GameController';
import ScopeModel from '../../src/assets/scripts/client/scope/ScopeModel';
import RadarTargetCollection from '../../src/assets/scripts/client/scope/RadarTargetCollection';
import {
    createRadarTargetArrivalMock,
    createRadarCollectionMock
} from './_mocks/radarTargetMocks';
import { createScopeCommandMock } from './_mocks/scopeCommandMocks';
import { THEME } from '../../src/assets/scripts/client/constants/themes';
import { EVENT } from '../../src/assets/scripts/client/constants/eventNames';

let sandbox; // using the sinon sandbox ensures stubs are restored after each test

beforeEach(() => {
    sandbox = sinon.createSandbox();
});

afterEach(() => {
    sandbox.restore();
});

test('does not throw when instantiated with no parameters', () => {
    expect(() => new ScopeModel()).not.toThrow();
});

test('creates RadarTargetCollection on instantiation', () => {
    const model = new ScopeModel();

    expect(model.radarTargetCollection instanceof RadarTargetCollection).toBe(true);
});

test('#ptlLength returns #_ptlLength', () => {
    const model = new ScopeModel();
    const expectedResult = 17;
    model._ptlLength = expectedResult;
    const result = model.ptlLength;

    expect(result === expectedResult).toBe(true);
});

test('.enable() registers event handlers', () => {
    const model = new ScopeModel();
    const eventBusOnStub = sandbox.stub(model._eventBus, 'on');
    const expectedEventsToRegister = 1;
    const result = model.enable();

    expect(typeof result === 'undefined').toBe(true);
    expect(eventBusOnStub.callCount === expectedEventsToRegister).toBe(true);
});

test('.disable() deregisters event handlers', () => {
    const model = new ScopeModel();
    const eventBusOffStub = sandbox.stub(model._eventBus, 'off');
    const expectedEventsToDeregister = 1;
    const result = model.disable();

    expect(typeof result === 'undefined').toBe(true);
    expect(eventBusOffStub.callCount === expectedEventsToDeregister).toBe(true);
});

test('.acceptHandoff() returns message that command is unavailable', () => {
    const model = new ScopeModel();
    const expectedResult = [false, 'acceptHandoff command not yet available'];

    const result = model.acceptHandoff();

    expect(result).toEqual(expectedResult);
});

test('.amendAltitude() accepts {string} number and passes {number} number to radarTargetModel.amendAltitude()', () => {
    const model = new ScopeModel();
    const radarTargetArrivalMock = createRadarTargetArrivalMock();
    const radarTargetModelAmendAltitudeSpy = sinon.spy(radarTargetArrivalMock, 'amendAltitude');

    model.amendAltitude(radarTargetArrivalMock, '220');

    expect(radarTargetModelAmendAltitudeSpy.calledWithExactly(220)).toBe(true);
});

test('.changePtlLength() sets #_ptlLength to 0 and triggers a shallow render when #_ptlLength is invalid and a decrease is requested', (t) => {
    const model = new ScopeModel();
    model._ptlLength = 3.5;
    const direction = -1;

    sandbox.stub(GameController, 'getGameOption').returns('1-2-4-8');

    const eventBusTriggerStub = sandbox.stub(model._eventBus, 'trigger');
    const result = model.changePtlLength(direction);

    expect(typeof result === 'undefined').toBe(true);
    expect(model._ptlLength === 0).toBe(true);
    expect(eventBusTriggerStub.calledWithExactly(EVENT.MARK_SHALLOW_RENDER)).toBe(true);
});

test('.changePtlLength() sets #_ptlLength to 0 and triggers a shallow render when #_ptlLength is 0 and a decrease is requested', (t) => {
    const model = new ScopeModel();
    model._ptlLength = 0;
    const direction = -1;

    sandbox.stub(GameController, 'getGameOption').returns('1-2-4-8');

    const eventBusTriggerStub = sandbox.stub(model._eventBus, 'trigger');
    const result = model.changePtlLength(direction);

    expect(typeof result === 'undefined').toBe(true);
    expect(model._ptlLength === 0).toBe(true);
    expect(eventBusTriggerStub.calledWithExactly(EVENT.MARK_SHALLOW_RENDER)).toBe(true);
});

test('.changePtlLength() returns early when #_ptlLength is already at the highest increment and an increase is requested', (t) => {
    const model = new ScopeModel();
    model._ptlLength = 8;
    const direction = 1;

    sandbox.stub(GameController, 'getGameOption').returns('1-2-4-8');

    const eventBusTriggerStub = sandbox.stub(model._eventBus, 'trigger');
    const result = model.changePtlLength(direction);

    expect(typeof result === 'undefined').toBe(true);
    expect(model._ptlLength === 8).toBe(true);
    expect(eventBusTriggerStub.notCalled).toBe(true);
});

test('.changePtlLength() increases #_ptlLength by one step and triggers a shallow render when an increase is requested and is possible', (t) => {
    const model = new ScopeModel();
    model._ptlLength = 2;
    const direction = 1;

    sandbox.stub(GameController, 'getGameOption').returns('1-2-4-8');

    const eventBusTriggerStub = sandbox.stub(model._eventBus, 'trigger');
    const result = model.changePtlLength(direction);

    expect(typeof result === 'undefined').toBe(true);
    expect(model._ptlLength === 4).toBe(true);
    expect(eventBusTriggerStub.calledWithExactly(EVENT.MARK_SHALLOW_RENDER)).toBe(true);
});

test('.changePtlLength() decreases #_ptlLength by one step and triggers a shallow render when a decrease is requested and is possible', (t) => {
    const model = new ScopeModel();
    model._ptlLength = 4;
    const direction = -1;

    sandbox.stub(GameController, 'getGameOption').returns('1-2-4-8');

    const eventBusTriggerStub = sandbox.stub(model._eventBus, 'trigger');
    const result = model.changePtlLength(direction);

    expect(typeof result === 'undefined').toBe(true);
    expect(model._ptlLength === 2).toBe(true);
    expect(eventBusTriggerStub.calledWithExactly(EVENT.MARK_SHALLOW_RENDER)).toBe(true);
});

test('.decreasePtlLength() calls .changePtlLength() with direction of `-1`', () => {
    const model = new ScopeModel();
    const expectedDirection = -1;
    const changePtlLengthStub = sandbox.stub(model, 'changePtlLength');
    const result = model.decreasePtlLength();

    expect(typeof result === 'undefined').toBe(true);
    expect(changePtlLengthStub.calledWithExactly(expectedDirection)).toBe(true);
});

test('.increasePtlLength() calls .changePtlLength() with direction of `1`', () => {
    const model = new ScopeModel();
    const expectedDirection = 1;
    const changePtlLengthStub = sandbox.stub(model, 'changePtlLength');
    const result = model.increasePtlLength();

    expect(typeof result === 'undefined').toBe(true);
    expect(changePtlLengthStub.calledWithExactly(expectedDirection)).toBe(true);
});

test('.initiateHandoff() returns message that command is unavailable', () => {
    const model = new ScopeModel();
    const expectedResult = [false, 'initiateHandoff command not yet available'];

    const result = model.initiateHandoff();

    expect(result).toEqual(expectedResult);
});

test('.moveDataBlock() calls radarTargetModel.moveDataBlock() with correct parameters', () => {
    const model = new ScopeModel();
    const radarTargetArrivalMock = createRadarTargetArrivalMock();
    const radarTargetModelMoveDataBlockSpy = sinon.spy(radarTargetArrivalMock, 'moveDataBlock');

    model.moveDataBlock(radarTargetArrivalMock, '3/2');

    expect(radarTargetModelMoveDataBlockSpy.calledWithExactly('3/2')).toBe(true);
});

test('.propogateDataBlock() returns message that command is unavailable', () => {
    const model = new ScopeModel();
    const expectedResult = [false, 'propogateDataBlock command not yet available'];

    const result = model.propogateDataBlock();

    expect(result).toEqual(expectedResult);
});

test('.route() returns message that command is unavailable', () => {
    const model = new ScopeModel();
    const expectedResult = [false, 'route command not yet available'];

    const result = model.route();

    expect(result).toEqual(expectedResult);
});

test('.runScopeCommand() returns syntax error if scope command function does not exist', () => {
    const scopeModel = new ScopeModel();
    const scopeCommandModel = createScopeCommandMock();
    const expectedResponse = [false, 'ERR: BAD SYNTAX'];

    scopeCommandModel.commandFunction = 'complete and utter nonsense';

    const response = scopeModel.runScopeCommand(scopeCommandModel);

    expect(response).toEqual(expectedResponse);
});

test('.runScopeCommand() returns unknown aircraft error when aircraft reference has no matching target models', () => {
    const scopeModel = new ScopeModel();

    scopeModel.radarTargetCollection = createRadarCollectionMock();

    const scopeCommandModel = createScopeCommandMock();

    scopeCommandModel.aircraftReference = 'yabbadabbadoo';

    const scopeMethodSpy = sinon.spy(scopeModel, scopeCommandModel.commandFunction);
    const expectedResponse = [false, 'ERR: UNKNOWN AIRCRAFT'];
    const response = scopeModel.runScopeCommand(scopeCommandModel);
    expect(response).toEqual(expectedResponse);
    expect(scopeMethodSpy.notCalled).toBe(true);
});

test('.runScopeCommand() calls the correct method specified in the ScopeCommandModel', () => {
    const scopeModel = new ScopeModel();

    scopeModel.radarTargetCollection = createRadarCollectionMock();

    const scopeCommandModel = createScopeCommandMock();
    const scopeMethodSpy = sinon.spy(scopeModel, scopeCommandModel.commandFunction);
    const expectedResponse = [true, 'AMEND ALTITUDE'];
    const response = scopeModel.runScopeCommand(scopeCommandModel);

    expect(response).toEqual(expectedResponse);
    expect(scopeMethodSpy.calledOnce).toBe(true);
});

test('.setScratchpad() returns scratchpad length error when too many characters provided', () => {
    const model = new ScopeModel();
    const radarTargetModel = createRadarTargetArrivalMock();
    const radarTargetModelSetScratchPadSpy = sinon.spy(radarTargetModel, 'setScratchpad');
    const newScratchPadText = 'ABDEFGHIJKLMNOP';
    const expectedResponse = [false, 'ERR: SCRATCHPAD MAX 3 CHAR'];
    const response = model.setScratchpad(radarTargetModel, newScratchPadText);

    expect(response).toEqual(expectedResponse);
    expect(radarTargetModelSetScratchPadSpy.notCalled).toBe(true);
});

test('.setScratchpad() calls and returns RadarTargetModel.setDefaultScratchpad() with no parameters', () => {
    const model = new ScopeModel();
    const radarTargetModel = createRadarTargetArrivalMock();
    const radarTargetModelSetScratchpadSpy = sinon.spy(radarTargetModel, 'setScratchpad');
    const radarTargetModelSetDefaultScratchpadSpy = sinon.spy(radarTargetModel, 'setDefaultScratchpad');
    const resetScratchPadTrigger = '.';
    const expectedResponse = [true, 'RESET SCRATCHPAD'];
    const response = model.setScratchpad(radarTargetModel, resetScratchPadTrigger);

    expect(response).toEqual(expectedResponse);
    expect(radarTargetModelSetScratchpadSpy.notCalled).toBe(true);
    expect(radarTargetModelSetDefaultScratchpadSpy.called).toBe(true);
    expect(radarTargetModelSetDefaultScratchpadSpy.calledWithExactly()).toBe(true);
});

test('.setScratchpad() sets RadarTargetModel._scratchPadText to the specified string', () => {
    const model = new ScopeModel();
    const radarTargetModel = createRadarTargetArrivalMock();
    const radarTargetModelSetScratchPadSpy = sinon.spy(radarTargetModel, 'setScratchpad');
    const newScratchPadText = 'V6R';
    const expectedResponse = [true, 'SET SCRATCHPAD'];
    const response = model.setScratchpad(radarTargetModel, newScratchPadText);

    expect(response).toEqual(expectedResponse);
    expect(radarTargetModelSetScratchPadSpy.calledWithExactly(newScratchPadText)).toBe(true);
});

test('.setHalo() returns error when requested halo size is invalid', () => {
    const scopeModel = new ScopeModel();
    const radarTargetModel = createRadarTargetArrivalMock();
    const setHaloRadiusStub = sinon.stub(radarTargetModel, 'setHalo');
    const expectedResponse = [false, 'ERR: HALO SIZE INVALID'];
    const response = scopeModel.setHalo(radarTargetModel, 0);

    expect(response).toEqual(expectedResponse);
    expect(setHaloRadiusStub.notCalled).toBe(true);
});

test('.setHalo() returns error when requested halo size is too large', () => {
    const scopeModel = new ScopeModel();
    const radarTargetModel = createRadarTargetArrivalMock();
    const maxRadius = scopeModel._theme.SCOPE.HALO_MAX_RADIUS_NM;
    const radius = maxRadius + 0.1;
    const setHaloRadiusStub = sinon.stub(radarTargetModel, 'setHalo');
    const expectedResponse = [false, `ERR: HALO MAX ${maxRadius} NM`];
    const response = scopeModel.setHalo(radarTargetModel, radius);

    expect(response).toEqual(expectedResponse);
    expect(setHaloRadiusStub.notCalled).toBe(true);
});

test('.setHalo() uses default halo radius when one is not specified in the command', () => {
    const scopeModel = new ScopeModel();
    const radarTargetModel = createRadarTargetArrivalMock();
    const defaultRadius = scopeModel._theme.SCOPE.HALO_DEFAULT_RADIUS_NM;
    const setHaloRadiusStub = sinon.stub(radarTargetModel, 'setHalo');

    scopeModel.setHalo(radarTargetModel);

    expect(setHaloRadiusStub.calledWithExactly(defaultRadius)).toBe(true);
});

test('.setHalo() calls RadarTargetModel.setHalo()', () => {
    const scopeModel = new ScopeModel();
    const radarTargetModel = createRadarTargetArrivalMock();
    const radius = 7;
    const setHaloRadiusStub = sinon.stub(radarTargetModel, 'setHalo');

    scopeModel.setHalo(radarTargetModel, radius);

    expect(setHaloRadiusStub.calledWithExactly(radius)).toBe(true);
});

test('._setTheme returns early when an invalid theme name is passed', () => {
    const model = new ScopeModel();
    const themeName = 'great googly moogly!';

    model._setTheme(themeName);

    expect(model._theme === THEME.DEFAULT).toBe(true);
});

test('._setTheme() changes the value of #_theme', () => {
    const model = new ScopeModel();
    const themeName = 'CLASSIC';

    model._setTheme(themeName);

    expect(model._theme === THEME.CLASSIC).toBe(true);
});

// test.todo('Add test for .amendAltitude()');
