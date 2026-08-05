/* eslint-disable arrow-parens, max-len, import/no-extraneous-dependencies*/
import { test, expect, vi } from 'vitest';
import {
    isEmptyOrNotObject,
    isEmptyOrNotArray,
} from '../../src/assets/scripts/client/utilities/validatorUtilities';

test('.isEmptyOrNotObject() returns true when passed a non object', () => {
    expect(isEmptyOrNotObject()).toBe(true);
    expect(isEmptyOrNotObject(null)).toBe(true);
    expect(isEmptyOrNotObject(42)).toBe(true);
    expect(isEmptyOrNotObject('threeve')).toBe(true);
    expect(isEmptyOrNotObject(false)).toBe(true);
});

test('.isEmptyOrNotObject returns true when passed an empty object', () => {
    expect(isEmptyOrNotObject({})).toBe(true);
    expect(isEmptyOrNotObject([])).toBe(true);
});

test('.isEmptyOrNotObject() returns false when passed a non-empty object', () => {
    expect(isEmptyOrNotObject([1, 2, 3])).toBe(false);
    expect(
        isEmptyOrNotObject({
            a: 'threeve',
            b: 42,
            c: false,
        })
    ).toBe(false);
});

test('.isEmptyOrNotArray() returns true when passed a non array', () => {
    expect(isEmptyOrNotArray()).toBe(true);
    expect(isEmptyOrNotArray(null)).toBe(true);
    expect(isEmptyOrNotArray({})).toBe(true);
    expect(isEmptyOrNotArray(42)).toBe(true);
    expect(isEmptyOrNotArray('threeve')).toBe(true);
    expect(isEmptyOrNotArray(false)).toBe(true);
});

test('.isEmptyOrNotArray returns true when passed an empty array', () => {
    expect(isEmptyOrNotArray([])).toBe(true);
});

test('.isEmptyOrNotArray return false when passed an array with values', () => {
    expect(isEmptyOrNotArray([1, 2, 3])).toBe(false);
});

test('.isEmptyOrNotArray() returns true when passed an object with properties', () => {
    expect(
        isEmptyOrNotArray({
            a: 'threeve',
            b: 42,
            c: false,
        })
    ).toBe(true);
});
