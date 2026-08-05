import { test, expect, vi } from 'vitest';
import _isArray from 'lodash/isArray';
import _isString from 'lodash/isString';
import BaseCollection from '../../src/assets/scripts/client/base/BaseCollection';
import ExtendedBaseCollectionFixture from './_fixtures/ExtendedBaseCollectionFixture';

test('instantiates with a _id and _items properties', () => {
    const result = new BaseCollection();

    expect(_isString(result._id)).toBe(true);
    expect(_isArray(result._items)).toBe(true);
    expect(result.length === 0).toBe(true);
});

test('._init() throws when called from BaseCollection', () => {
    const collection = new BaseCollection();

    expect(() => collection._init()).toThrow();
});

test('._init() does not throw when called by an extending class', () => {
    const collection = new ExtendedBaseCollectionFixture();

    expect(() => collection._init()).not.toThrow();
});

test('.destroy() throws when called from BaseCollection', () => {
    const collection = new BaseCollection();

    expect(() => collection.destroy()).toThrow();
});

test('.destroy() does not throw when called from and extending class', () => {
    const collection = new ExtendedBaseCollectionFixture();

    expect(() => collection.destroy()).not.toThrow();
});
