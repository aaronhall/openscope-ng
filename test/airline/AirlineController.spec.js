import { test, expect, vi } from 'vitest';
import sinon from 'sinon';

import AirlineController from '../../src/assets/scripts/client/airline/AirlineController';
import { AIRLINE_DEFINITION_LIST_FOR_FIXTURE } from './_mocks/airlineMocks';

test('does not throw when called with valid parameters', () => {
    expect(() => new AirlineController(AIRLINE_DEFINITION_LIST_FOR_FIXTURE)).not.toThrow();
});

test('.generateFlightNumberWithAirlineModel() throws when it receives anything other than an AirlineModel', () => {
    const controller = new AirlineController(AIRLINE_DEFINITION_LIST_FOR_FIXTURE);

    expect(() => controller.generateFlightNumberWithAirlineModel({})).toThrow();
});

test('.generateFlightNumberWithAirlineModel() returns a new flightNumber', () => {
    const controller = new AirlineController(AIRLINE_DEFINITION_LIST_FOR_FIXTURE);
    const airlineModel = controller.airlineCollection._items[0];
    const generateFlightNumberSpy = sinon.spy(airlineModel, 'generateFlightNumber');

    controller.generateFlightNumberWithAirlineModel(airlineModel);

    expect(generateFlightNumberSpy.called).toBe(true);
});

test('.generateFlightNumberWithAirlineModel() calls airlineModel.generateFlightNumber() twice if the first return exists in flightNumbers', () => {
    const controller = new AirlineController(AIRLINE_DEFINITION_LIST_FOR_FIXTURE);
    const airlineModel = controller.airlineCollection._items[0];
    airlineModel.activeFlightNumbers = ['42'];

    const generateFlightNumberStub = sinon.stub(airlineModel, 'generateFlightNumber');
    generateFlightNumberStub.onFirstCall().returns('42');
    generateFlightNumberStub.onSecondCall().returns('3');

    controller.generateFlightNumberWithAirlineModel(airlineModel);

    expect(generateFlightNumberStub.calledTwice).toBe(true);

    generateFlightNumberStub.restore();
});

test('.generateFlightNumberWithAirlineModel() does not set a duplicate flightNumber to the list', () => {
    const controller = new AirlineController(AIRLINE_DEFINITION_LIST_FOR_FIXTURE);
    const airlineModel = controller.airlineCollection._items[0];
    airlineModel.activeFlightNumbers = ['42'];

    const generateFlightNumberStub = sinon.stub(airlineModel, 'generateFlightNumber');
    generateFlightNumberStub.onFirstCall().returns('42');
    generateFlightNumberStub.onSecondCall().returns('3');

    controller.generateFlightNumberWithAirlineModel(airlineModel);

    expect(controller.flightNumbers.length === 2).toBe(true);
    expect(controller.flightNumbers.indexOf('42') !== -1).toBe(true);
    expect(controller.flightNumbers.indexOf('3') !== -1).toBe(true);

    generateFlightNumberStub.restore();
});

test('.generateFlightNumberWithAirlineModel() calls airlineModel.addFlightNumberToInUse() when a unique flightNumber is generated', () => {
    const controller = new AirlineController(AIRLINE_DEFINITION_LIST_FOR_FIXTURE);
    const airlineModel = controller.airlineCollection._items[0];
    const addFlightNumberToInUseSpy = sinon.spy(airlineModel, 'addFlightNumberToInUse');
    const result = controller.generateFlightNumberWithAirlineModel(airlineModel);

    expect(addFlightNumberToInUseSpy.calledWithExactly(result)).toBe(true);
});

test('.generateFlightNumberWithAirlineModel() returns a string', () => {
    const controller = new AirlineController(AIRLINE_DEFINITION_LIST_FOR_FIXTURE);
    const airlineModel = controller.airlineCollection._items[0];
    const result = controller.generateFlightNumberWithAirlineModel(airlineModel);

    expect(typeof result === 'string').toBe(true);
});

test('.removeFlightNumberFromList() does not throw if an airlineModel is not found', () => {
    const airlineMock = 'aal';
    const callsignMock = '123';
    const controller = new AirlineController(AIRLINE_DEFINITION_LIST_FOR_FIXTURE);

    expect(() => controller.removeFlightNumberFromList(airlineMock, callsignMock)).not.toThrow();
});

test('.removeFlightNumberFromList() calls .removeFlightNumber() on the found AirlineModel', () => {
    const airlineMock = 'aal';
    const callsignMock = '123';
    const controller = new AirlineController(AIRLINE_DEFINITION_LIST_FOR_FIXTURE);
    const model = controller.findAirlineById(airlineMock);
    const removeFlightNumberSpy = sinon.spy(model, 'removeFlightNumber');

    controller.removeFlightNumberFromList(airlineMock, callsignMock);

    expect(removeFlightNumberSpy.calledWithExactly(callsignMock)).toBe(true);
});

test('._isActiveFlightNumber() returns true if a given flightNumber exists within any AirlineModel.activeFlightNumbers list', () => {
    const invalidFlightNumberMock = 'threeve';
    const validFlightNumberMock = '42';
    const controller = new AirlineController(AIRLINE_DEFINITION_LIST_FOR_FIXTURE);
    controller.airlineCollection._items[0].activeFlightNumbers = [validFlightNumberMock];

    expect(controller._isActiveFlightNumber(invalidFlightNumberMock)).toBe(false);
    expect(controller._isActiveFlightNumber(validFlightNumberMock)).toBe(true);
});
