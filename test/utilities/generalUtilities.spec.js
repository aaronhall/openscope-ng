import { test, expect, vi } from 'vitest';

import { leftPad } from '../../src/assets/scripts/client/utilities/generalUtilities';

const lengthMock = 3;

test('.leftPad() returns a string prepended with zeros when value provided is less than length', () => {
    const result = leftPad(1, lengthMock);

    expect(result === '001').toBe(true);
});

test('.leftPad() returns original string when value.length is > length', () => {
    const result = leftPad(1234, lengthMock);

    expect(result === '1234').toBe(true);
});

test('.leftPad() returns original string when value.length === length', () => {
    const result = leftPad(123, lengthMock);

    expect(result === '123').toBe(true);
});
