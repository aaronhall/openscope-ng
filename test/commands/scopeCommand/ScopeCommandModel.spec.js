import { test, expect, vi } from 'vitest';
import ScopeCommandModel from '../../../src/assets/scripts/client/commands/scopeCommand/ScopeCommandModel';
import { COMMAND_FUNCTIONS } from '../../../src/assets/scripts/client/commands/scopeCommand/scopeCommandMap';

test('throws when instantiated without parameters', () => {
    expect(() => new ScopeCommandModel()).toThrow();
});

test('sets correct property values for ACCEPT_HANDOFF', () => {
    const commandMock = '167';
    const model = new ScopeCommandModel(commandMock);

    expect(model.aircraftReference === '167').toBe(true);
    expect(model.commandArguments).toEqual([]);
    expect(model.commandFunction === COMMAND_FUNCTIONS.ACCEPT_HANDOFF).toBe(true);
});

test('sets correct property values for HANDOFF', () => {
    const commandMock = '19 167';
    const model = new ScopeCommandModel(commandMock);

    expect(model.aircraftReference === '167').toBe(true);
    expect(model.commandArguments).toEqual(['19']);
    expect(model.commandFunction === COMMAND_FUNCTIONS.INITIATE_HANDOFF).toBe(true);
});

test('sets correct property values for MOVE_DATA_BLOCK (direction only)', () => {
    const commandMock = '1 167';
    const model = new ScopeCommandModel(commandMock);

    expect(model.aircraftReference === '167').toBe(true);
    expect(model.commandArguments).toEqual(['1']);
    expect(model.commandFunction === COMMAND_FUNCTIONS.MOVE_DATA_BLOCK).toBe(true);
});

test('sets correct property values for MOVE_DATA_BLOCK (length only)', () => {
    const commandMock = '/3 167';
    const model = new ScopeCommandModel(commandMock);

    expect(model.aircraftReference === '167').toBe(true);
    expect(model.commandArguments).toEqual(['/3']);
    expect(model.commandFunction === COMMAND_FUNCTIONS.MOVE_DATA_BLOCK).toBe(true);
});

test('sets correct property values for MOVE_DATA_BLOCK (direction and length)', () => {
    const commandMock = '3/2 167';
    const model = new ScopeCommandModel(commandMock);

    expect(model.aircraftReference === '167').toBe(true);
    expect(model.commandArguments).toEqual(['3/2']);
    expect(model.commandFunction === COMMAND_FUNCTIONS.MOVE_DATA_BLOCK).toBe(true);
});

test('sets correct property values for QP (toggle FDB suppression)', () => {
    const commandMock = 'QP 167';
    const model = new ScopeCommandModel(commandMock);

    expect(model.aircraftReference === '167').toBe(true);
    expect(model.commandArguments).toEqual([]);
    expect(model.commandFunction === COMMAND_FUNCTIONS.QP).toBe(true);
});

test('sets correct property values for QP (propogate FDB to another sector)', () => {
    const commandMock = 'QP 19 167';
    const model = new ScopeCommandModel(commandMock);

    expect(model.aircraftReference === '167').toBe(true);
    expect(model.commandArguments).toEqual(['19']);
    expect(model.commandFunction === COMMAND_FUNCTIONS.QP).toBe(true);
});

test('sets correct property values for QP_J', () => {
    const commandMock = 'QP_J 167';
    const model = new ScopeCommandModel(commandMock);

    expect(model.aircraftReference === '167').toBe(true);
    expect(model.commandArguments).toEqual([]);
    expect(model.commandFunction === COMMAND_FUNCTIONS.QP_J).toBe(true);
});

test('sets correct property values for QU', () => {
    const commandMock = 'QU 167';
    const model = new ScopeCommandModel(commandMock);

    expect(model.aircraftReference === '167').toBe(true);
    expect(model.commandArguments).toEqual([]);
    expect(model.commandFunction === COMMAND_FUNCTIONS.QU).toBe(true);
});

test('sets correct property values for QZ', () => {
    const commandMock = 'QZ 210 167';
    const model = new ScopeCommandModel(commandMock);

    expect(model.aircraftReference === '167').toBe(true);
    expect(model.commandArguments).toEqual(['210']);
    expect(model.commandFunction === COMMAND_FUNCTIONS.QZ).toBe(true);
});

test('sets correct property values for SCRATCHPAD', () => {
    const commandMock = 'I8R 167';
    const model = new ScopeCommandModel(commandMock);

    expect(model.aircraftReference === '167').toBe(true);
    expect(model.commandArguments).toEqual(['I8R']);
    expect(model.commandFunction === COMMAND_FUNCTIONS.SCRATCHPAD).toBe(true);
});
