import { test, expect, vi } from 'vitest';

import { groupNumbers } from '../../../src/assets/scripts/client/utilities/radioUtilities';

test('groupNumbers() returns appropriate string for "5"', () => {
    expect(groupNumbers('5') === 'five').toBe(true);
});

test('groupNumbers() returns appropriate string for "10"', () => {
    expect(groupNumbers('10') === 'ten').toBe(true);
});

test('groupNumbers() returns appropriate string for "17"', () => {
    expect(groupNumbers('17') === 'seventeen').toBe(true);
});

test('groupNumbers() returns appropriate string for "30"', () => {
    expect(groupNumbers('30') === 'thirty').toBe(true);
});

test('groupNumbers() returns appropriate string for "31"', () => {
    expect(groupNumbers('31') === 'thirty one').toBe(true);
});

test('groupNumbers() returns appropriate string for "100"', () => {
    expect(groupNumbers('100') === 'one hundred').toBe(true);
});

test('groupNumbers() returns appropriate string for "107"', () => {
    expect(groupNumbers('107') === 'one zero seven').toBe(true);
});

test('groupNumbers() returns appropriate string for "112"', () => {
    expect(groupNumbers('112') === 'one twelve').toBe(true);
});

test('groupNumbers() returns appropriate string for "589"', () => {
    expect(groupNumbers('589') === 'five eighty niner').toBe(true);
});

test('groupNumbers() returns appropriate string for "1000"', () => {
    expect(groupNumbers('1000') === 'one thousand').toBe(true);
});

test('groupNumbers() returns appropriate string for "1008"', () => {
    expect(groupNumbers('1008') === 'ten zero eight').toBe(true);
});

test('groupNumbers() returns appropriate string for "1018"', () => {
    expect(groupNumbers('1018') === 'ten eighteen').toBe(true);
});

test('groupNumbers() returns appropriate string for "1020"', () => {
    expect(groupNumbers('1020') === 'ten twenty').toBe(true);
});

test('groupNumbers() returns appropriate string for "2216"', () => {
    expect(groupNumbers('2216') === 'twenty two sixteen').toBe(true);
});

test('groupNumbers() returns appropriate string for "3000"', () => {
    expect(groupNumbers('3000') === 'three thousand').toBe(true);
});

test('groupNumbers() returns appropriate string for "4000"', () => {
    expect(groupNumbers('4000') === 'four thousand').toBe(true);
});

test('groupNumbers() returns appropriate string for "5000"', () => {
    expect(groupNumbers('5000') === 'five thousand').toBe(true);
});

test('groupNumbers() returns appropriate string for "6641"', () => {
    expect(groupNumbers('6641') === 'sixty six fourty one').toBe(true);
});
