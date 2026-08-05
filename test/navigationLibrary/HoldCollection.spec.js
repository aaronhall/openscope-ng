import { test, expect, vi } from 'vitest';
import HoldCollection from '../../src/assets/scripts/client/navigationLibrary/HoldCollection';

import {
    FIX_NAME_WITHOUT_HOLD,
    FIX_NAME_WITH_HOLD,
    HOLD_COLLECTION_MOCK,
} from './_mocks/holdCollectionMocks';

test('throws if called with invalid parameters', () => {
    expect(() => new HoldCollection('')).toThrow();
});

test('accepts a null that is used to initialize the collection', () => {
    const collection = new HoldCollection(null);

    expect(collection.length).toBe(0);
});

test('accepts an empty object that is used to initialize the collection', () => {
    const collection = new HoldCollection({});

    expect(collection.length).toBe(0);
});

test('accepts a valid object that is used to initialize the collection', () => {
    const collection = new HoldCollection(HOLD_COLLECTION_MOCK);
    const expectedLength = Object.keys(HOLD_COLLECTION_MOCK).length;

    expect(collection.length).toBe(expectedLength);
    expect(collection.holds.length).toBe(expectedLength);
});

test('.containsHoldForFix() returns expected value', () => {
    const collection = new HoldCollection(HOLD_COLLECTION_MOCK);

    expect(collection.containsHoldForFix('ABBOT')).toBe(true);
    expect(collection.containsHoldForFix('THREEVE')).toBe(false);
    expect(collection.containsHoldForFix()).toBe(false);
    expect(collection.containsHoldForFix(null)).toBe(false);
    expect(collection.containsHoldForFix('')).toBe(false);
});

test('.findHoldParametersByFix() returns expected value', () => {
    const collection = new HoldCollection(HOLD_COLLECTION_MOCK);
    const validFix = collection.findHoldParametersByFix(FIX_NAME_WITH_HOLD);

    expect(collection.findHoldParametersByFix('')).toBe(null);
    expect(collection.findHoldParametersByFix(FIX_NAME_WITHOUT_HOLD)).toBe(null);
    expect(validFix).not.toBe(null);
});

test(".populateHolds() doesn't add duplicate holds", () => {
    const collection = new HoldCollection(HOLD_COLLECTION_MOCK);
    const expectedLength = Object.keys(HOLD_COLLECTION_MOCK).length;

    collection.populateHolds(HOLD_COLLECTION_MOCK);

    expect(collection.length).toBe(expectedLength);
});

test('.reset() clears the instance properties', () => {
    const collection = new HoldCollection(HOLD_COLLECTION_MOCK);
    collection.reset();

    expect(collection.length).toBe(0);
});
