import { test, expect, vi } from 'vitest';

import { getGrouping } from '../../../src/assets/scripts/client/utilities/radioUtilities';

test('getGrouping() returns appropriate string for "00"', () => {
    expect(getGrouping('00') === 'hundred').toBe(true);
});

test('getGrouping() returns appropriate string for "05"', () => {
    expect(getGrouping('05') === 'zero five').toBe(true);
});

test('getGrouping() returns appropriate string for "10"', () => {
    expect(getGrouping('10') === 'ten').toBe(true);
});

test('getGrouping() returns appropriate string for "17"', () => {
    expect(getGrouping('17') === 'seventeen').toBe(true);
});

test('getGrouping() returns appropriate string for "30"', () => {
    expect(getGrouping('30') === 'thirty').toBe(true);
});

test('getGrouping() returns appropriate string for "31"', () => {
    expect(getGrouping('31') === 'thirty one').toBe(true);
});
