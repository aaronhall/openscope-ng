import { test, expect, vi } from 'vitest';
import AircraftCommandModel from '../../../src/assets/scripts/client/commands/aircraftCommand/AircraftCommandModel';
import { AIRCRAFT_COMMAND_MAP } from '../../../src/assets/scripts/client/commands/aircraftCommand/aircraftCommandMap';
import { timewarpParser } from '../../../src/assets/scripts/client/commands/parsers/argumentParsers';
import {
    noopParse,
    zeroArgVal,
    singleArgVal,
    strToNumArrayParse,
    zeroOrOneArgumentVal,
    self_alias,
    test_aliases,
} from './testUtils';

const extractParseAndValidate = (cmd) => {
    const model = new AircraftCommandModel(cmd);
    const parse = model._commandDefinition.parse.toString();
    const validate = model._commandDefinition.validate.toString();
    expect(AIRCRAFT_COMMAND_MAP[cmd].isSystemCommand).toBe(true);
    return [parse, validate];
};

test('aliases, noop parser and zeroArgumentsValidator used by airac', () => {
    const [parse, validate] = extractParseAndValidate('airac');
    expect(parse === noopParse() && validate === zeroArgVal()).toBe(true);
    self_alias(AIRCRAFT_COMMAND_MAP, 'airac');
});

test('aliases, noop parser and singleArgumentValidator used by airport', () => {
    const [parse, validate] = extractParseAndValidate('airport');
    expect(parse === noopParse() && validate === singleArgVal()).toBe(true);
    self_alias(AIRCRAFT_COMMAND_MAP, 'airport');
});

test('aliases, noop parser and zeroArgumentsValidator used by auto', () => {
    const [parse, validate] = extractParseAndValidate('auto');
    expect(parse === noopParse() && validate === zeroArgVal()).toBe(true);
    self_alias(AIRCRAFT_COMMAND_MAP, 'auto');
});

test('aliases, noop parser and zeroArgumentsValidator used by clear', () => {
    const [parse, validate] = extractParseAndValidate('clear');
    expect(parse === noopParse() && validate === zeroArgVal()).toBe(true);
    self_alias(AIRCRAFT_COMMAND_MAP, 'clear');
});

test('aliases, noop parser and zeroArgumentsValidator used by pause', () => {
    const [parse, validate] = extractParseAndValidate('pause');
    expect(parse === noopParse() && validate === zeroArgVal()).toBe(true);
    self_alias(AIRCRAFT_COMMAND_MAP, 'pause');
});

test('aliases, noop parser and zeroArgumentsValidator used by tutorial', () => {
    const [parse, validate] = extractParseAndValidate('tutorial');
    expect(parse === noopParse() && validate === zeroArgVal()).toBe(true);
    self_alias(AIRCRAFT_COMMAND_MAP, 'tutorial');
});

test('aliases, strToNumArray parser and singleArgumentValidator used by rate', () => {
    const [parse, validate] = extractParseAndValidate('rate');
    expect(parse === strToNumArrayParse() && validate === singleArgVal()).toBe(true);
    self_alias(AIRCRAFT_COMMAND_MAP, 'rate');
});

test('aliases, timewarp parser and zeroOrOneArgumentValidator used by timewarp', () => {
    const [parse, validate] = extractParseAndValidate('timewarp');
    const p = timewarpParser;
    const v = zeroOrOneArgumentVal();
    expect(parse === p.toString() && validate === v.toString()).toBe(true);
    test_aliases(AIRCRAFT_COMMAND_MAP, 'timewarp', ['timewarp', 'tw']);
});

test('make sure we test all 8 system commands', () => {
    expect(
        Object.values(AIRCRAFT_COMMAND_MAP).filter((val) => val.isSystemCommand).length === 8
    ).toBe(true);
});
