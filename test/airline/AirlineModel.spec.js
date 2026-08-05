import { test, expect, vi } from 'vitest';
import sinon from 'sinon';
import _isArray from 'lodash/isArray';
import _isEqual from 'lodash/isEqual';
import _map from 'lodash/map';

import AirlineModel from '../../src/assets/scripts/client/airline/AirlineModel';
import {
    AIRLINE_DEFINITION_MOCK,
    AIRLINE_DEFINITION_SIMPLE_FLEET_MOCK,
} from './_mocks/airlineMocks';

test('throws when called with invalid data', () => {
    const expectedMessage =
        /Invalid airlineDefinition passed to AirlineModel constructor\. Expected a non-empty object, but received .*/;

    expect(() => new AirlineModel(), {
        instanceOf: TypeError,
        message: expectedMessage,
    }).toThrow();
    expect(() => new AirlineModel(null), {
        instanceOf: TypeError,
        message: expectedMessage,
    }).toThrow();
    expect(() => new AirlineModel({}), {
        instanceOf: TypeError,
        message: expectedMessage,
    }).toThrow();
    expect(() => new AirlineModel([]), {
        instanceOf: TypeError,
        message: expectedMessage,
    }).toThrow();
    expect(() => new AirlineModel(42), {
        instanceOf: TypeError,
        message: expectedMessage,
    }).toThrow();
    expect(() => new AirlineModel('threeve'), {
        instanceOf: TypeError,
        message: expectedMessage,
    }).toThrow();
    expect(() => new AirlineModel(false), {
        instanceOf: TypeError,
        message: expectedMessage,
    }).toThrow();
});

test('aircraftList returns a list of all aircraft from all fleets', () => {
    const model = new AirlineModel(AIRLINE_DEFINITION_MOCK);

    expect(_isArray(model.aircraftList)).toBe(true);
});

test('flightNumbers returns a list of all activeFlightNumbers', () => {
    const model = new AirlineModel(AIRLINE_DEFINITION_MOCK);
    model.activeFlightNumbers = ['1', '2', '3'];

    expect(_isEqual(model.flightNumbers, ['1', '2', '3'])).toBe(true);
});

test('.getRandomAircraftType() calls _getRandomAircraftTypeFromAllFleets when no parameter is passed', () => {
    const model = new AirlineModel(AIRLINE_DEFINITION_MOCK);
    const _getRandomAircraftTypeFromAllFleetsSpy = sinon.spy(
        model,
        '_getRandomAircraftTypeFromAllFleets'
    );

    model._getRandomAircraftTypeFromAllFleets();

    expect(_getRandomAircraftTypeFromAllFleetsSpy.called).toBe(true);
});

test('.getRandomAircraftType() calls _getRandomAircraftTypeFromFleet when a fleet parameter is passed', () => {
    const fleetNameMock = '90long';
    const model = new AirlineModel(AIRLINE_DEFINITION_MOCK);
    const _getRandomAircraftTypeFromFleetSpy = sinon.spy(model, '_getRandomAircraftTypeFromFleet');

    model._getRandomAircraftTypeFromFleet(fleetNameMock);

    expect(_getRandomAircraftTypeFromFleetSpy.calledWithExactly(fleetNameMock)).toBe(true);
});

test('.removeFlightNumber() calls _deactivateFlightNumber', () => {
    const flightNumberMock = '123';
    const model = new AirlineModel(AIRLINE_DEFINITION_MOCK);
    const _deactivateFlightNumberSpy = sinon.spy(model, '_deactivateFlightNumber');
    model.activeFlightNumbers.push(flightNumberMock);

    model.removeFlightNumber(flightNumberMock);

    expect(_deactivateFlightNumberSpy.calledWithExactly(flightNumberMock)).toBe(true);
});

test('.removeFlightNumber() removes a provided flightNumber from activeFlightNumbers', () => {
    const flightNumberMock = '123';
    const model = new AirlineModel(AIRLINE_DEFINITION_MOCK);
    model.activeFlightNumbers.push(flightNumberMock);

    model.removeFlightNumber(flightNumberMock);

    expect(model.activeFlightNumbers.indexOf(flightNumberMock) === -1).toBe(true);
    expect(model.activeFlightNumbers.length === 0).toBe(true);
});

test('.getRandomAircraftType() calls ._getRandomAircraftTypeFromAllFleets() when no fleet is provided', () => {
    const model = new AirlineModel(AIRLINE_DEFINITION_MOCK);
    const _getRandomAircraftTypeFromAllFleetsSpy = sinon.spy(
        model,
        '_getRandomAircraftTypeFromAllFleets'
    );

    model.getRandomAircraftType();

    expect(_getRandomAircraftTypeFromAllFleetsSpy.calledOnce).toBe(true);
});

test('.getRandomAircraftType() calls ._getRandomAircraftTypeFromFleet() fleet is provided', () => {
    const fleetNameMock = 'long';
    const model = new AirlineModel(AIRLINE_DEFINITION_MOCK);
    const _getRandomAircraftTypeFromFleetSpy = sinon.spy(model, '_getRandomAircraftTypeFromFleet');

    model.getRandomAircraftType(fleetNameMock);

    expect(_getRandomAircraftTypeFromFleetSpy.calledWithExactly(fleetNameMock)).toBe(true);
});

test('._getRandomAircraftTypeFromFleet() throws if it received an invalid fleetName', () => {
    const fleetNameMock = 'threeve';
    const model = new AirlineModel(AIRLINE_DEFINITION_MOCK);

    expect(() => model._getRandomAircraftTypeFromFleet(fleetNameMock)).toThrow();
});

test('._getRandomAircraftTypeFromFleet() returns a random aircraft types form a specific fleet', () => {
    const fleetNameMock = '90long';
    const expectedResult = _map(
        AIRLINE_DEFINITION_MOCK.fleets['90long'],
        (aircraft) => aircraft[0]
    );
    const model = new AirlineModel(AIRLINE_DEFINITION_MOCK);
    const result = model._getRandomAircraftTypeFromFleet(fleetNameMock);

    expect(expectedResult.indexOf(result) !== -1).toBe(true);
});

test('._transformFleetNamesToLowerCase() transforms each type in fleet to lowercase', () => {
    const model = new AirlineModel(AIRLINE_DEFINITION_SIMPLE_FLEET_MOCK);

    expect(model.fleets.default[0][[0]] === 'a319').toBe(true);
});

test('.generateFlightNumber() returns a valid callsign when called', () => {
    const model = new AirlineModel(AIRLINE_DEFINITION_SIMPLE_FLEET_MOCK);
    const result = model.generateFlightNumber();
    const regex = /[^A-Z]/;

    expect(regex.test(result) && result.charAt(0) !== 0).toBe(true);
});

test('._isActiveFlightNumber() returns false if a given flightNumber is not present in activeFlightNumbers', () => {
    const model = new AirlineModel(AIRLINE_DEFINITION_SIMPLE_FLEET_MOCK);

    expect(model._isActiveFlightNumber('threeve')).toBe(false);
});

test('._isActiveFlightNumber() returns true if a given flightNumber is present in activeFlightNumbers', () => {
    const flightNumberMock = '123';
    const model = new AirlineModel(AIRLINE_DEFINITION_SIMPLE_FLEET_MOCK);
    model.activeFlightNumbers.push(flightNumberMock);

    expect(model._isActiveFlightNumber(flightNumberMock)).toBe(true);
});
