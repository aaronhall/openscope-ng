import { test, expect } from 'vitest';
import {
    generateTransponderCode, isDiscreteTransponderCode, isValidTransponderCode
} from '../../src/assets/scripts/client/utilities/transponderUtilities';

const USA_ICAO = 'klax';
const UK_ICAO = 'egll';

test('isDiscreteTransponderCode returns false for all non-discrete codes', () => {
    // Loops are not ideal, but it saves writing 64 identical tests!
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const squawk = `${i}${j}00`;
            expect(isDiscreteTransponderCode(squawk)).toBe(false);
        }
    }
});

test('generateTransponderCode returns a valid transponder code', () => {
    // This is basically pointless, as we're testing random output...
    const code = generateTransponderCode();
    expect(isValidTransponderCode(code)).toBe(true);
});

test('isDiscreteTransponderCode returns false for invalid squawk code', () => {
    expect(isDiscreteTransponderCode(USA_ICAO, '1239')).toBe(false);
});

test('isDiscreteTransponderCode returns false when given a non-discrete squawk', () => {
    expect(isDiscreteTransponderCode(UK_ICAO, '3600')).toBe(false);
});

test('isDiscreteTransponderCode returns false when given restricted squawks for the USA', () => {
    expect(isDiscreteTransponderCode(USA_ICAO, '7500')).toBe(false);
    expect(isDiscreteTransponderCode(USA_ICAO, '7600')).toBe(false);
    expect(isDiscreteTransponderCode(USA_ICAO, '7700')).toBe(false);
    expect(isDiscreteTransponderCode(USA_ICAO, '7777')).toBe(false);
});

test('isDiscreteTransponderCode returns false when given VFR codes', () => {
    expect(isDiscreteTransponderCode(USA_ICAO, '1200')).toBe(false);
    expect(isDiscreteTransponderCode(USA_ICAO, '1202')).toBe(false);
    expect(isDiscreteTransponderCode(USA_ICAO, '1277')).toBe(false);

    expect(isDiscreteTransponderCode(UK_ICAO, '1201')).toBe(true); // 1201 is allowed in the UK
    expect(isDiscreteTransponderCode(UK_ICAO, '7000')).toBe(false);
});

test('isValidTransponderCode returns true when given a valid transponder code', () => {
    expect(isValidTransponderCode('0000')).toBe(true);
    expect(isValidTransponderCode('7777')).toBe(true);
});

test('isValidTransponderCode returns false when given a invalid transponder code', () => {
    expect(isValidTransponderCode('777')).toBe(false);
    expect(isValidTransponderCode('7778')).toBe(false);
});
