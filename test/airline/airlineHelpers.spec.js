/* eslint-disable import/no-extraneous-dependencies, arrow-parens */
import { test, expect, vi } from 'vitest';

import {
    airlineNameAndFleetHelper,
    randomAirlineSelectionHelper
} from '../../src/assets/scripts/client/airline/airlineHelpers';

const AIRLINE_LIST_WITH_SEPERATOR_MOCK = [
    ['a7/fastGA', 4]
];

const AIRLINE_LIST_WITHOUT_SEPERATOR_MOCK = [
    ['aay', 15],
    ['aay', 15]
];

test('.airlineNameAndFleetHelper() throws when called with an invalid parameter', () => {
    expect(() => airlineNameAndFleetHelper()).toThrow();
    expect(() => airlineNameAndFleetHelper({})).toThrow();
    expect(() => airlineNameAndFleetHelper('')).toThrow();
    expect(() => airlineNameAndFleetHelper(42)).toThrow();
    expect(() => airlineNameAndFleetHelper(false)).toThrow();
});

test('.airlineNameAndFleetHelper() returns an object with two keys: name and fleet when an empty string is passed', () => {
    const result = airlineNameAndFleetHelper([]);

    expect(typeof result === 'object').toBe(true);
    expect(result.name === '').toBe(true);
    expect(result.fleet === 'default').toBe(true);
});

test('.airlineNameAndFleetHelper() returns default as the fleet when fleet is not present in original string', () => {
    const result = airlineNameAndFleetHelper(AIRLINE_LIST_WITHOUT_SEPERATOR_MOCK[0]);

    expect(typeof result === 'object').toBe(true);
    expect(result.name === 'aay').toBe(true);
    expect(result.fleet === 'default').toBe(true);
});

test('.airlineNameAndFleetHelper() returns an object with two keys: name and fleet when a string is passed', () => {
    const result = airlineNameAndFleetHelper(AIRLINE_LIST_WITH_SEPERATOR_MOCK[0]);

    expect(typeof result === 'object').toBe(true);
    expect(result.name === 'a7').toBe(true);
    expect(result.fleet === 'fastGA').toBe(true);
});

test('.airlineNameAndFleetHelper() returns name lowercase when it receives uppercase', () => {
    const airlineListMock = ['AAL', 14];
    const result = airlineNameAndFleetHelper(airlineListMock);

    expect(typeof result === 'object').toBe(true);
    expect(result.name === 'aal').toBe(true);
    expect(result.fleet === 'default').toBe(true);
});

test('.randomAirlineSelectionHelper() throws when called with an invalid parameter', () => {
    expect(() => randomAirlineSelectionHelper()).toThrow();
    expect(() => randomAirlineSelectionHelper({})).toThrow();
    expect(() => randomAirlineSelectionHelper('')).toThrow();
    expect(() => randomAirlineSelectionHelper(42)).toThrow();
    expect(() => randomAirlineSelectionHelper(false)).toThrow();

    expect(() => randomAirlineSelectionHelper([])).not.toThrow();
});

test('.randomAirlineSelectionHelper() returns an object with two keys: name and fleet when an empty array is passed', () => {
    const result = randomAirlineSelectionHelper([]);

    expect(typeof result === 'object').toBe(true);
    expect(result.name === '').toBe(true);
    expect(result.fleet === '').toBe(true);
});

test('.randomAirlineSelectionHelper() returns an object with two keys: name and fleet when passed aline with separator', () => {
    const result = randomAirlineSelectionHelper(AIRLINE_LIST_WITHOUT_SEPERATOR_MOCK);

    expect(typeof result === 'object').toBe(true);
    expect(result.name === 'aay').toBe(true);
    expect(result.fleet === '').toBe(true);
});

test('.randomAirlineSelectionHelper() returns an object with two keys: name and fleet', () => {
    const result = randomAirlineSelectionHelper(AIRLINE_LIST_WITH_SEPERATOR_MOCK);

    expect(typeof result === 'object').toBe(true);
    expect(result.name === 'a7').toBe(true);
    expect(result.fleet === 'fastGA').toBe(true);
});
