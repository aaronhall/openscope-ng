import { test, expect, vi } from 'vitest';
import sinon from 'sinon';
import _map from 'lodash/map';
import _some from 'lodash/some';
import _tail from 'lodash/tail';

import CommandParser from '../../../src/assets/scripts/client/commands/parsers/CommandParser';
import AircraftCommandModel from '../../../src/assets/scripts/client/commands/aircraftCommand/AircraftCommandModel';
import { PARSED_COMMAND_NAME } from '../../../src/assets/scripts/client/constants/inputConstants';

const COMMAND_ARGS_SEPARATOR = ' ';

const AIRPORT_MOCK = 'airport ksea';
const PAUSE_MOCK = 'pause';
const TIMEWARP_50_MOCK = 'timewarp 50';
const TW_50_MOCK = 'tw 50';
const TUTORIAL_MOCK = 'tutorial';

const CALLSIGN_MOCK = 'AAL777';
const CAF_MOCK = 'caf';
const CVS_MOCK = 'cvs';
const TAKEOFF_MOCK = 'to';

const buildCommandString = (...args) => `${CALLSIGN_MOCK} ${args.join(' ')}`;

const buildCommandList = (...args) => {
    const commandString = buildCommandString(...args);

    return commandString.split(' ');
};

test('throws when called with an invalid command', () => {
    expect(() => new CommandParser(['threeve'])).toThrow();
    expect(() => new CommandParser(false)).toThrow();
    expect(() => new CommandParser(42)).toThrow();
    expect(() => new CommandParser({})).toThrow();
});

test('throws when called with invalid arguments', () => {
    const expectedResult = 'Invalid argument length. Expected exactly zero arguments';
    const commandStringMock = buildCommandString(TAKEOFF_MOCK, 'threeve');

    try {
        // eslint-disable-next-line no-unused-vars
        const model = new CommandParser(commandStringMock);
    } catch (e) {
        expect(e === expectedResult).toBe(true);
    }
});

test('does not throw when called without parameters', () => {
    expect(() => new CommandParser()).not.toThrow();
});

test('sets #command with the correct name when provided a system command', () => {
    const airportModel = new CommandParser(AIRPORT_MOCK);
    const pauseModel = new CommandParser(PAUSE_MOCK);
    const timewarpModel = new CommandParser(TIMEWARP_50_MOCK);
    const tutorialModel = new CommandParser(TUTORIAL_MOCK);

    expect(airportModel.command === PARSED_COMMAND_NAME.AIRPORT).toBe(true);
    expect(pauseModel.command === PARSED_COMMAND_NAME.PAUSE).toBe(true);
    expect(timewarpModel.command === PARSED_COMMAND_NAME.TIMEWARP).toBe(true);
    expect(tutorialModel.command === PARSED_COMMAND_NAME.TUTORIAL).toBe(true);
});

test('sets #command with identical name when provided an alias of a system command', () => {
    const twModel = new CommandParser(TW_50_MOCK);
    const timewarpModel = new CommandParser(TIMEWARP_50_MOCK);

    expect(twModel.command).toBe(timewarpModel.command);
});

test('sets #command with the correct name when provided a transmit command', () => {
    const commandStringMock = buildCommandString(CAF_MOCK, CVS_MOCK, TAKEOFF_MOCK);
    const model = new CommandParser(commandStringMock);

    expect(model.command === PARSED_COMMAND_NAME.TRANSMIT).toBe(true);
});

test('sets #commandList with a AircraftCommandModel object when provided a system command', () => {
    const model = new CommandParser(TIMEWARP_50_MOCK);

    expect(model.commandList.length === 1).toBe(true);
    expect(model.commandList[0] instanceof AircraftCommandModel).toBe(true);
});

test('sets #commandList with AircraftCommandModel objects when it receives transmit commands', () => {
    const commandStringMock = buildCommandString(CAF_MOCK, CVS_MOCK, TAKEOFF_MOCK);
    const model = new CommandParser(commandStringMock);

    expect(model.commandList.length === 3).toBe(true);

    _map(model.commandList, (command) => {
        expect(command instanceof AircraftCommandModel).toBe(true);
    });
});

test('._extractCommandsAndArgs() discards empty tokens caused by multiple spaces', () => {
    const extraSpacesMock = 'timewarp  50';
    const model = new CommandParser(extraSpacesMock);
    const _buildSystemCommandModelSpy = sinon.spy(model, '_buildSystemCommandModel');

    model._extractCommandsAndArgs(extraSpacesMock);

    expect(_buildSystemCommandModelSpy.calledOnce).toBe(true);
    expect(_some(_buildSystemCommandModelSpy.lastCall.args[0], { length: 0 })).toBe(false);
});

test('._extractCommandsAndArgs() calls _buildCommandList() when provided transmit commands', () => {
    const commandStringMock = buildCommandString(CAF_MOCK, CVS_MOCK, TAKEOFF_MOCK);
    const expectedArgs = buildCommandList(CAF_MOCK, CVS_MOCK, TAKEOFF_MOCK);
    const model = new CommandParser(commandStringMock);
    const _buildCommandListSpy = sinon.spy(model, '_buildCommandList');

    model._extractCommandsAndArgs(commandStringMock);

    expect(_buildCommandListSpy.calledWithExactly(_tail(expectedArgs))).toBe(true);
});

test('._buildCommandList() returns an empty array when adding args to an undefined AircraftCommandModel', () => {
    const model = new CommandParser('threeve');

    expect(() => model._buildCommandList(['$texas'])).not.toThrow();

    const result = model._buildCommandList(['$texas']);

    expect(result).toEqual([]);
});

test('._validateAndParseCommandArguments() calls ._validateCommandArguments()', () => {
    const commandStringMock = buildCommandString(CAF_MOCK, CVS_MOCK, TAKEOFF_MOCK);
    const model = new CommandParser(commandStringMock);

    const _validateCommandArgumentsSpy = sinon.spy(model, '_validateCommandArguments');
    model._validateCommandArguments();

    expect(_validateCommandArgumentsSpy.called).toBe(true);
});

test('._isSystemCommand() returns true if callsignOrSystemCommandName exists within AIRCRAFT_COMMAND_MAP and is marked as a system command there', () => {
    const airportModel = new CommandParser(AIRPORT_MOCK);
    const pauseModel = new CommandParser(PAUSE_MOCK);
    const timewarpModel = new CommandParser(TIMEWARP_50_MOCK);
    const tutorialModel = new CommandParser(TUTORIAL_MOCK);

    expect(airportModel._isSystemCommand(AIRPORT_MOCK.split(COMMAND_ARGS_SEPARATOR)[0])).toBe(true);
    expect(pauseModel._isSystemCommand(PAUSE_MOCK.split(COMMAND_ARGS_SEPARATOR)[0])).toBe(true);
    expect(timewarpModel._isSystemCommand(TIMEWARP_50_MOCK.split(COMMAND_ARGS_SEPARATOR)[0])).toBe(true);
    expect(tutorialModel._isSystemCommand(TUTORIAL_MOCK.split(COMMAND_ARGS_SEPARATOR)[0])).toBe(true);
});

test('._isSystemCommand() returns identical outcome for alias of a system command', () => {
    const twModel = new CommandParser(TW_50_MOCK);
    const timewarpModel = new CommandParser(TIMEWARP_50_MOCK);

    expect(twModel._isSystemCommand(TW_50_MOCK.split(COMMAND_ARGS_SEPARATOR)[0])).toBe(
        timewarpModel._isSystemCommand(TIMEWARP_50_MOCK.split(COMMAND_ARGS_SEPARATOR)[0])
    );
});
