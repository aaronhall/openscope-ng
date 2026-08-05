import { test, expect, vi } from 'vitest';
import AircraftCommandModel
    from '../../../src/assets/scripts/client/commands/aircraftCommand/AircraftCommandModel';

import {
    altitudeValidator,
    crossingValidator,
    fixValidator,
    headingValidator,
    holdValidator,
    squawkValidator,
    optionalAltitudeValidator
} from '../../../src/assets/scripts/client/commands/parsers/argumentValidators';
import {
    altitudeParser,
    ilsParser,
    crossingParser,
    headingParser,
    holdParser,
    optionalAltitudeParser
} from '../../../src/assets/scripts/client/commands/parsers/argumentParsers';
import { AIRCRAFT_COMMAND_MAP } from '../../../src/assets/scripts/client/commands/aircraftCommand/aircraftCommandMap';

import {
    noopParse,
    zeroArgVal,
    singleArgVal,
    strToNumArrayParse,
    zeroOrOneArgumentVal,
    self_alias,
    test_aliases
} from './testUtils';

const extractParseAndValidate = (cmd) => {
    const model = new AircraftCommandModel(cmd);
    const parse = model._commandDefinition.parse.toString();
    const validate = model._commandDefinition.validate.toString();
    expect(AIRCRAFT_COMMAND_MAP[cmd].isSystemCommand).toBe(false);
    return [parse, validate];
};


test('aliases, noop parser and zeroArgumentsValidator used by abort', () => {
    const [parse, validate] = extractParseAndValidate('abort');
    expect(parse === noopParse() && validate === zeroArgVal()).toBe(true);
    self_alias(AIRCRAFT_COMMAND_MAP, 'abort');
});


test('aliases, noop parser and zeroArgumentsValidator used by clearedAsFiled', () => {
    const [parse, validate] = extractParseAndValidate('clearedAsFiled');
    expect(parse === noopParse() && validate === zeroArgVal()).toBe(true);
    test_aliases(AIRCRAFT_COMMAND_MAP, 'clearedAsFiled', ['caf', 'clearedAsFiled']);
});


test('aliases, noop parser and zeroArgumentsValidator used by delete', () => {
    const [parse, validate] = extractParseAndValidate('delete');
    expect(parse === noopParse() && validate === zeroArgVal()).toBe(true);
    test_aliases(AIRCRAFT_COMMAND_MAP, 'delete', ['del', 'delete', 'kill']);
});


test('aliases, noop parser and zeroArgumentsValidator used by flyPresentHeading', () => {
    const [parse, validate] = extractParseAndValidate('flyPresentHeading');
    expect(parse === noopParse() && validate === zeroArgVal()).toBe(true);
    test_aliases(AIRCRAFT_COMMAND_MAP, 'flyPresentHeading', ['fph']);
});


test('aliases, noop parser and zeroArgumentsValidator used by takeoff', () => {
    const [parse, validate] = extractParseAndValidate('takeoff');
    expect(parse === noopParse() && validate === zeroArgVal()).toBe(true);
    test_aliases(AIRCRAFT_COMMAND_MAP, 'takeoff', ['/', 'cto', 'to', 'takeoff']);
});

test('aliases, noop parser and zeroArgumentsValidator used by sayAltitude', () => {
    const [parse, validate] = extractParseAndValidate('sayAltitude');
    expect(parse === noopParse() && validate === zeroArgVal()).toBe(true);
    test_aliases(AIRCRAFT_COMMAND_MAP, 'sayAltitude', ['sa']);
});

test('aliases, noop parser and zeroArgumentsValidator used by sayAssignedAltitude', () => {
    const [parse, validate] = extractParseAndValidate('sayAssignedAltitude');
    expect(parse === noopParse() && validate === zeroArgVal()).toBe(true);
    test_aliases(AIRCRAFT_COMMAND_MAP, 'sayAssignedAltitude', ['saa']);
});

test('aliases, noop parser and zeroArgumentsValidator used by sayHeading', () => {
    const [parse, validate] = extractParseAndValidate('sayHeading');
    expect(parse === noopParse() && validate === zeroArgVal()).toBe(true);
    test_aliases(AIRCRAFT_COMMAND_MAP, 'sayHeading', ['sh']);
});

test('aliases, noop parser and zeroArgumentsValidator used by sayAssignedHeading', () => {
    const [parse, validate] = extractParseAndValidate('sayAssignedHeading');
    expect(parse === noopParse() && validate === zeroArgVal()).toBe(true);
    test_aliases(AIRCRAFT_COMMAND_MAP, 'sayAssignedHeading', ['sah']);
});

test('aliases, noop parser and zeroArgumentsValidator used by sayIndicatedAirspeed', () => {
    const [parse, validate] = extractParseAndValidate('sayIndicatedAirspeed');
    expect(parse === noopParse() && validate === zeroArgVal()).toBe(true);
    test_aliases(AIRCRAFT_COMMAND_MAP, 'sayIndicatedAirspeed', ['si']);
});

test('aliases, noop parser and zeroArgumentsValidator used by sayAssignedSpeed', () => {
    const [parse, validate] = extractParseAndValidate('sayAssignedSpeed');
    expect(parse === noopParse() && validate === zeroArgVal()).toBe(true);
    test_aliases(AIRCRAFT_COMMAND_MAP, 'sayAssignedSpeed', ['sas']);
});

test('aliases, noop parser and zeroArgumentsValidator used by sayRoute', () => {
    const [parse, validate] = extractParseAndValidate('sayRoute');
    expect(parse === noopParse() && validate === zeroArgVal()).toBe(true);
    test_aliases(AIRCRAFT_COMMAND_MAP, 'sayRoute', ['sr']);
});

test('aliases, noop parser and singleArgumentValidator used by direct', () => {
    const [parse, validate] = extractParseAndValidate('direct');
    expect(parse === noopParse() && validate === singleArgVal()).toBe(true);
    test_aliases(AIRCRAFT_COMMAND_MAP, 'direct', ['dct', 'direct', 'pd']);
});

test('aliases, noop parser and singleArgumentValidator used by expectArrivalRunway', () => {
    const [parse, validate] = extractParseAndValidate('expectArrivalRunway');
    expect(parse === noopParse() && validate === singleArgVal()).toBe(true);
    test_aliases(AIRCRAFT_COMMAND_MAP, 'expectArrivalRunway', ['e']);
});

test('aliases, ilsParser and singleArgumentValidator used by ils', () => {
    const [parse, validate] = extractParseAndValidate('ils');
    const tmp = ilsParser;
    expect(parse === tmp.toString() && validate === singleArgVal()).toBe(true);
    test_aliases(AIRCRAFT_COMMAND_MAP, 'ils', ['*', 'i', 'ils']);
});

test('aliases, noop parser and zeroOrOneArgumentValidator used by land', () => {
    const [parse, validate] = extractParseAndValidate('land');
    expect(parse === noopParse() && validate === zeroOrOneArgumentVal()).toBe(true);
    self_alias(AIRCRAFT_COMMAND_MAP, 'land');
});

test('aliases, noop parser and singleArgumentValidator used by moveDataBlock', () => {
    const [parse, validate] = extractParseAndValidate('moveDataBlock');
    expect(parse === noopParse() && validate === singleArgVal()).toBe(true);
    test_aliases(AIRCRAFT_COMMAND_MAP, 'moveDataBlock', ['`']);
});


test('aliases, noop parser and singleArgumentValidator used by reroute', () => {
    const [parse, validate] = extractParseAndValidate('reroute');
    expect(parse === noopParse() && validate === singleArgVal()).toBe(true);
    test_aliases(AIRCRAFT_COMMAND_MAP, 'reroute', ['reroute', 'rr']);
});

test('aliases, noop parser and singleArgumentValidator used by route', () => {
    const [parse, validate] = extractParseAndValidate('route');
    expect(parse === noopParse() && validate === singleArgVal()).toBe(true);
    self_alias(AIRCRAFT_COMMAND_MAP, 'route');
});

test('aliases, noop parser and singleArgumentValidator used by sid', () => {
    const [parse, validate] = extractParseAndValidate('sid');
    expect(parse === noopParse() && validate === singleArgVal()).toBe(true);
    self_alias(AIRCRAFT_COMMAND_MAP, 'sid');
});

test('aliases, strToNumArray parser and singleArgumentValidator used by speed', () => {
    const [parse, validate] = extractParseAndValidate('speed');
    expect(parse === strToNumArrayParse() && validate === singleArgVal()).toBe(true);
    test_aliases(AIRCRAFT_COMMAND_MAP, 'speed', ['-', '+', 'slow', 'sp', 'speed']);
});

test('aliases, noop parser and singleArgumentValidator used by star', () => {
    const [parse, validate] = extractParseAndValidate('star');
    expect(parse === noopParse() && validate === singleArgVal()).toBe(true);
    self_alias(AIRCRAFT_COMMAND_MAP, 'star');
});

test('aliases, noop parser and zeroOrOneArgumentValidator used by taxi', () => {
    const [parse, validate] = extractParseAndValidate('taxi');
    expect(parse === noopParse() && validate === zeroOrOneArgumentVal()).toBe(true);
    test_aliases(AIRCRAFT_COMMAND_MAP, 'taxi', ['taxi', 'w', 'wait']);
});

test('aliases, noop parser and zeroOrOneArgumentValidator used by cancelHold', () => {
    const [parse, validate] = extractParseAndValidate('cancelHold');
    expect(parse === noopParse() && validate === zeroOrOneArgumentVal()).toBe(true);
    test_aliases(AIRCRAFT_COMMAND_MAP, 'cancelHold', ['exithold', 'cancelhold', 'continue', 'nohold', 'xh']);
});

test('aliases, altitude parser and altitude validator used by altitude', () => {
    const [parse, validate] = extractParseAndValidate('altitude');
    const p = altitudeParser;
    const v = altitudeValidator;
    expect(parse === p.toString() && validate === v.toString()).toBe(true);
    test_aliases(AIRCRAFT_COMMAND_MAP, 'altitude', ['a', 'altitude', 'c', 'climb', 'd', 'descend']);
});

test('aliases, crossing parser and crossing validator used by cross', () => {
    const [parse, validate] = extractParseAndValidate('cross');
    const p = crossingParser;
    const v = crossingValidator;
    expect(parse === p.toString() && validate === v.toString()).toBe(true);
    test_aliases(AIRCRAFT_COMMAND_MAP, 'cross', ['cross', 'cr', 'x']);
});

test('aliases, noop parser and fix validator used by fix', () => {
    const [parse, validate] = extractParseAndValidate('fix');
    const v = fixValidator;
    expect(parse === noopParse() && validate === v.toString()).toBe(true);
    test_aliases(AIRCRAFT_COMMAND_MAP, 'fix', ['f', 'fix', 'track']);
});

test('aliases, heading parser and heading validator used by heading', () => {
    const [parse, validate] = extractParseAndValidate('heading');
    const p = headingParser;
    const v = headingValidator;
    expect(parse === p.toString() && validate === v.toString()).toBe(true);
    test_aliases(AIRCRAFT_COMMAND_MAP, 'heading', ['fh', 'h', 'heading', 't', 'turn']);
});

test('aliases, hold parser and hold validator used by hold', () => {
    const [parse, validate] = extractParseAndValidate('hold');
    const p = holdParser;
    const v = holdValidator;
    expect(parse === p.toString() && validate === v.toString()).toBe(true);
    self_alias(AIRCRAFT_COMMAND_MAP, 'hold');
});

test('aliases, noop parser and squawk validator used by squawk', () => {
    const [parse, validate] = extractParseAndValidate('squawk');
    const v = squawkValidator;
    expect(parse === noopParse() && validate === v.toString()).toBe(true);
    test_aliases(AIRCRAFT_COMMAND_MAP, 'squawk', ['sq', 'squawk']);
});


test('aliases, optionalAltitudeParser and optionalAltitudeValidator used by descendViaStar', () => {
    const [parse, validate] = extractParseAndValidate('descendViaStar');
    const p = optionalAltitudeParser;
    const v = optionalAltitudeValidator;
    expect(parse === p.toString() && validate === v.toString()).toBe(true);
    test_aliases(AIRCRAFT_COMMAND_MAP, 'descendViaStar', ['descendViaStar', 'dvs']);
});

test('aliases, optionalAltitudeParser and optionalAltitudeValidator used by climbViaSid', () => {
    const [parse, validate] = extractParseAndValidate('climbViaSid');
    const p = optionalAltitudeParser;
    const v = optionalAltitudeValidator;
    expect(parse === p.toString() && validate === v.toString()).toBe(true);
    test_aliases(AIRCRAFT_COMMAND_MAP, 'climbViaSid', ['climbViaSid', 'cvs']);
});

test('make sure we test all 32 aircraft commands', () => {
    expect(Object.values(AIRCRAFT_COMMAND_MAP)
        .filter(val => !val.isSystemCommand).length === 32).toBe(true);
});
