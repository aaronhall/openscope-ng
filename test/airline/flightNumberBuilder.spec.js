import { test, expect, vi } from 'vitest';
import { buildFlightNumber } from '../../src/assets/scripts/client/airline/buildFlightNumber';

test(".buildFlightNumber() creates a callsign made up of random numbers only if callsign format is ['###'] ", () => {
    const callsignFormat = ['###'];
    const result = buildFlightNumber(callsignFormat);

    expect(!isNaN(result)).toBe(true);
});

test(".buildFlightNumber() creates a callsign made up of random lowercase letters only if callsign format is ['@@@'] ", () => {
    const lowerAlphabeticalRegex = /^[a-z]+$/;
    const callsignFormat = ['@@@'];
    const result = buildFlightNumber(callsignFormat);

    expect(lowerAlphabeticalRegex.test(result)).toBe(true);
});

test(".buildFlightNumber() creates a callsign made up of one random number and one random lowercase letter if callsign format is ['#@'] ", () => {
    const regex = /[1-9]/;
    const callsignFormat = ['#@'];
    const result = buildFlightNumber(callsignFormat);

    expect(regex.test(result)).toBe(true);
});

test('.buildFlightNumber() returns callsignFormat as is if the format does not contain @ or #', () => {
    const callsignFormat = ['4EVR', '8AE'];
    const result = buildFlightNumber(callsignFormat);

    expect(callsignFormat.includes(result)).toBe(true);
});

test('.buildFlightNumber() does not allow 0 to be at the start of a callsign, returns a three digit callsign', () => {
    const callsignFormat = ['0##', '00@@'];
    const result = buildFlightNumber(callsignFormat);

    expect(!isNaN(result)).toBe(true);
});
