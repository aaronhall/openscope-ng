import { test, expect, vi } from 'vitest';
import AirportController from '../../src/assets/scripts/client/airport/AirportController';
import { AIRPORT_JSON_KLAS_MOCK } from '../airport/_mocks/airportJsonMock';
import { AIRPORT_LOAD_LIST_MOCK } from '../airport/_mocks/airportLoadListMocks';

test('throws when called to instantiate', () => {
    expect(() => new AirportController()).toThrow();
});

test('does not throw when .init() is called with initialization props', () => {
    expect(() =>
        AirportController.init('klas', AIRPORT_JSON_KLAS_MOCK, AIRPORT_LOAD_LIST_MOCK)
    ).not.toThrow();
});
