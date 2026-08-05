import { test, expect, vi } from 'vitest';

import {
    isWithin,
    isWithinEpsilon,
    calculateMiddle,
    clamp,
    generateRandomOctalWithLength
} from '../../src/assets/scripts/client/math/core';

test('.isWithin() returns true if value is within (inclusive) two given values', () => {
    // we want to test the function operates correctly in the negative
    // range, the positive range, as well as right in the middle.
    const tests = [0, 1, -1];

    // we will test providing the 'limit1' and 'limit2' both
    // ways since the function is supposed to work both ways
    for (const number of tests) {
        let limit1;
        let limit2;

        // should pass
        limit1 = number - Number.EPSILON;
        limit2 = number + Number.EPSILON;
        expect(isWithin(number, limit1, limit2), `${number} should be within ${limit1} and ${limit2}`).toBe(true);
        expect(isWithin(number, limit2, limit1), `${number} should be within ${limit2} and ${limit1}`).toBe(true);

        // should fail
        limit1 = number - Number.EPSILON;
        limit2 = number - 2 * Number.EPSILON;
        expect(isWithin(number, limit1, limit2), `${number} should NOT be within ${limit1} and ${limit2}`).toBe(false);
        expect(isWithin(number, limit2, limit1), `${number} should NOT be within ${limit2} and ${limit1}`).toBe(false);

        // should fail too
        limit1 = number + Number.EPSILON;
        limit2 = number + 2 * Number.EPSILON;
        expect(isWithin(number, limit1, limit2), `${number} should NOT be within ${limit1} and ${limit2}`).toBe(false);
        expect(isWithin(number, limit2, limit1), `${number} should NOT be within ${limit2} and ${limit1}`).toBe(false);
    }
});

test('.isWithinEpsilon() returns true if value is within EPSILON of an expected value', () => {
    // we want to test the function operates correctly in the negative
    // range, the positive range, as well as right in the middle.
    const tests = [0, 1, -1];

    for (const number of tests) {
        let numberVariant1;
        let numberVariant2;

        // test the numbers plus and minus EPSILON
        // should pass
        numberVariant1 = number - Number.EPSILON;
        numberVariant2 = number + Number.EPSILON;
        expect(isWithinEpsilon(number, number), `${number} should be within EPSILON of ${number}`).toBe(true);
        expect(isWithinEpsilon(numberVariant1, number), `${numberVariant1} should be within EPSILON of ${number}`).toBe(true);
        expect(isWithinEpsilon(numberVariant2, number), `${numberVariant2} should be within EPSILON of ${number}`).toBe(true);

        // test the numbers plus and minus *2 times* EPSILON
        // should fail
        numberVariant1 = number - 2 * Number.EPSILON;
        numberVariant2 = number + 2 * Number.EPSILON;
        expect(isWithinEpsilon(numberVariant1, number), `${numberVariant1} should NOT be within EPSILON of ${number}`).toBe(false);
        expect(isWithinEpsilon(numberVariant2, number), `${numberVariant2} should NOT be within EPSILON of ${number}`).toBe(false);
    }
});

test('.calculateMiddle() returns a number the is the mid-point of a given number, rounded up', () => {
    expect(() => calculateMiddle('10')).toThrow();
    expect(() => calculateMiddle([])).toThrow();
    expect(() => calculateMiddle({})).toThrow();
    expect(() => calculateMiddle(null)).toThrow();
    expect(() => calculateMiddle(false)).toThrow();

    expect(() => calculateMiddle(undefined)).not.toThrow();
    expect(() => calculateMiddle()).not.toThrow();

    expect(calculateMiddle(10) === 5).toBe(true);
    expect(calculateMiddle(17) === 9).toBe(true);
});

test('.clamp() returns a number within a range, or the specified min/max number', () => {
    expect(() => clamp(7, [])).toThrow();
    expect(() => clamp(7, {})).toThrow();
    expect(() => clamp(7, false)).toThrow();
    expect(() => clamp(7, '')).toThrow();
    expect(() => clamp(7)).toThrow();

    expect(clamp(0, 20, 5) === 5).toBe(true);
    expect(clamp(-5, -10, 5) === -5).toBe(true);
    expect(clamp(1, 10) === 10).toBe(true);
});

test('.generateRandomOctalWithLength() returns a single digit number when called without parameters', () => {
    const result = generateRandomOctalWithLength();

    expect(result.toString().length === 1).toBe(true);
});


test('.generateRandomOctalWithLength() returns a number of a desired length', () => {
    const result = generateRandomOctalWithLength(4);

    expect(result.toString().length === 4).toBe(true);
});
