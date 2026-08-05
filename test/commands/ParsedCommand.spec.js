import _isEqual from 'lodash/isEqual';
import { test, expect, vi } from 'vitest';
import CommandParser from '../../src/assets/scripts/client/commands/parsers/CommandParser';

const TIMEWARP_50_MOCK = 'timewarp 50';
const CALLSIGN_MOCK = 'AAL777';
const FH_COMMAND_MOCK = 'fh 180';
const D_COMMAND_MOCK = 'd 030';
const STAR_MOCK = 'star quiet7';

const buildCommandString = (...args) => `${CALLSIGN_MOCK} ${args.join(' ')}`;

test('#args returns one item when a system command is present', () => {
    const parser = new CommandParser(TIMEWARP_50_MOCK);
    const cmd = parser.parse();
    expect(_isEqual(cmd.args, [50])).toBe(true);
});

test('#args an array for each command with arg values when a transmit command is present', () => {
    const commandStringMock = buildCommandString(FH_COMMAND_MOCK, D_COMMAND_MOCK, STAR_MOCK);
    const parser = new CommandParser(commandStringMock);
    const cmd = parser.parse();
    expect(cmd.args.length === 3).toBe(true);
});

// specific use case tests
test('when passed hold LAM it creates the correct command with the correct arguments', () => {
    const commandStringMock = buildCommandString('hold', 'LAM');
    const parser = new CommandParser(commandStringMock);
    const cmd = parser.parse();
    expect(cmd.args[0][0] === 'hold').toBe(true);
    expect(cmd.args[0][1] === null).toBe(true);
    expect(cmd.args[0][2] === null).toBe(true);
    expect(cmd.args[0][3] === 'lam').toBe(true);
});

test('when passed dct WHAMY it creates the correct command with the correct arguments', () => {
    const commandStringMock = buildCommandString('dct', 'WHAMY');
    const parser = new CommandParser(commandStringMock);
    const cmd = parser.parse();
    expect(cmd.args[0][0] === 'direct').toBe(true);
    expect(cmd.args[0][1] === 'whamy').toBe(true);
});

test('when passed dct TOU it creates the correct command with the correct arguments', () => {
    const commandStringMock = buildCommandString('dct', 'TOU');
    const parser = new CommandParser(commandStringMock);
    const cmd = parser.parse();
    expect(cmd.args[0][0] === 'direct').toBe(true);
    expect(cmd.args[0][1] === 'tou').toBe(true);
});

test('provides a default value for the timewarp command when no args are passed', () => {
    const parser = new CommandParser('timewarp');
    const cmd = parser.parse();
    expect(cmd.args[0] === 1).toBe(true);
});
