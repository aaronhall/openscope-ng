import { test, expect, vi } from 'vitest';
import sinon from 'sinon';
import AircraftCommander from '../../src/assets/scripts/client/aircraft/AircraftCommander';
import AircraftModel from '../../src/assets/scripts/client/aircraft/AircraftModel';
import {
    AIRCRAFT_MOCK_BASE,
    AIRCRAFT_MOCK_WITH_NE_HEADING,
    AIRCRAFT_MOCK_WITH_NORTH_HEADING,
    AIRCRAFT_MOCK_WITH_POSITIVE_SW_HEADING,
    AIRCRAFT_MOCK_WITH_NEGATIVE_SW_HEADING,
    RUN_SAY_HEADING_RESULT_NE,
    RUN_SAY_HEADING_RESULT_NORTH,
    RUN_SAY_HEADING_RESULT_SW,
    SQUAWK_RESPONSE_SUCCESS,
    SQUAWK_RESPONSE_FAILURE
} from './_mocks/aircraftCommanderMocks';

const sandbox = sinon.createSandbox();
let onChangeTransponderCodeFixture;
let findAircraftByIdFixture;

beforeEach(() => {
    onChangeTransponderCodeFixture = () => true;
    findAircraftByIdFixture = () => new AircraftModel(AIRCRAFT_MOCK_WITH_NORTH_HEADING);
});

afterEach(() => {
    sandbox.restore();
});

test('.runSayHeading() returns correct when heading north', () => {
    const commander = new AircraftCommander(onChangeTransponderCodeFixture, findAircraftByIdFixture);
    const aircraft = new AircraftModel(AIRCRAFT_MOCK_WITH_NORTH_HEADING);
    const result = commander.runSayHeading(aircraft);

    expect(result).toEqual(RUN_SAY_HEADING_RESULT_NORTH);
});

test('.runSayHeading() returns correct when heading has two digits', () => {
    const commander = new AircraftCommander(onChangeTransponderCodeFixture, findAircraftByIdFixture);
    const aircraft = new AircraftModel(AIRCRAFT_MOCK_WITH_NE_HEADING);
    const result = commander.runSayHeading(aircraft);

    expect(result).toEqual(RUN_SAY_HEADING_RESULT_NE);
});

test('.runSayHeading() returns correct when heading is positive', () => {
    const commander = new AircraftCommander(onChangeTransponderCodeFixture, findAircraftByIdFixture);
    const aircraft = new AircraftModel(AIRCRAFT_MOCK_WITH_POSITIVE_SW_HEADING);
    const result = commander.runSayHeading(aircraft);

    expect(result).toEqual(RUN_SAY_HEADING_RESULT_SW);
});

test('.runSayHeading() returns correct when heading is negative', () => {
    const commander = new AircraftCommander(onChangeTransponderCodeFixture, findAircraftByIdFixture);
    const aircraft = new AircraftModel(AIRCRAFT_MOCK_WITH_NEGATIVE_SW_HEADING);
    const result = commander.runSayHeading(aircraft);

    expect(result).toEqual(RUN_SAY_HEADING_RESULT_SW);
});

test('.runSquawk() returns a success response when _onChangeTransponderCode() succeeds', () => {
    const commander = new AircraftCommander(onChangeTransponderCodeFixture, findAircraftByIdFixture);
    const aircraft = new AircraftModel(AIRCRAFT_MOCK_BASE);
    const result = commander.runSquawk(aircraft, ['3377']);

    expect(result).toEqual(SQUAWK_RESPONSE_SUCCESS);
});

test('.runSquawk() returns a failure response when _onChangeTransponderCode() fails', () => {
    const commander = new AircraftCommander(onChangeTransponderCodeFixture, findAircraftByIdFixture);
    const aircraft = new AircraftModel(AIRCRAFT_MOCK_BASE);

    sandbox.stub(commander, '_onChangeTransponderCode').returns(false);

    const result = commander.runSquawk(aircraft, ['3377']);

    expect(result).toEqual(SQUAWK_RESPONSE_FAILURE);
});
