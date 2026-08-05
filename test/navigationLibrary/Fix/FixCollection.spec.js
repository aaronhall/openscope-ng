/* eslint-disable import/no-extraneous-dependencies, arrow-parens */
import { test, expect, vi } from 'vitest';
import _isEqual from 'lodash/isEqual';

import FixCollection from '../../../src/assets/scripts/client/navigationLibrary/FixCollection';
import FixModel from '../../../src/assets/scripts/client/navigationLibrary/FixModel';
import { airportPositionFixtureKSFO } from '../../fixtures/airportFixtures';
import { FIX_LIST_MOCK, SMALL_FIX_LIST_MOCK } from './_mocks/fixMocks';

beforeAll(() => {
    FixCollection.removeItems();
});

afterAll(() => {
    FixCollection.removeItems();
});

test('throws when an attempt to instantiate is made with invalid params', (t) => {
    expect(() => new FixCollection()).toThrow();

    expect(FixCollection._items.length === 0).toBe(true);
    expect(FixCollection.length === 0).toBe(true);
});

test('sets its properties when it receives a valid fixList', (t) => {
    FixCollection.addItems(FIX_LIST_MOCK, airportPositionFixtureKSFO);

    expect(FixCollection._items.length > 0).toBe(true);
    expect(FixCollection.length === FixCollection._items.length).toBe(true);
});

test('.addFixToCollection() throws if it doesnt receive a FixModel instance', (t) => {
    expect(() => FixCollection.addFixToCollection({})).toThrow();
});

test('.findFixByName() returns null when passed a null value', (t) => {
    let result = FixCollection.findFixByName(null);
    expect(!result).toBe(true);

    result = FixCollection.findFixByName(undefined);
    expect(!result).toBe(true);
});

test('.findFixByName() returns null when a FixModel does not exist within the collection', (t) => {
    const result = FixCollection.findFixByName('');

    expect(!result).toBe(true);
});

test('.findFixByName() returns a FixModel if it exists within the collection', (t) => {
    const result = FixCollection.findFixByName('BAKRR');

    expect(result.name === 'BAKRR').toBe(true);
    expect(result instanceof FixModel).toBe(true);
});

test('.findFixByName() returns a FixModel when passed a lowercase fixName', (t) => {
    const result = FixCollection.findFixByName('bakrr');

    expect(result.name === 'BAKRR').toBe(true);
    expect(result instanceof FixModel).toBe(true);
});

test('.findFixByName() returns a FixModel when passed a mixed case fixName', (t) => {
    const result = FixCollection.findFixByName('bAkRr');

    expect(result.name === 'BAKRR').toBe(true);
    expect(result instanceof FixModel).toBe(true);
});

test('.getFixRelativePosition() returns the position of a FixModel', (t) => {
    const result = FixCollection.getFixRelativePosition('BAKRR');
    const expectedResult = [675.4773179362775, -12.012226373501111];

    expect(_isEqual(result, expectedResult)).toBe(true);
});

test('.getFixRelativePosition() returns null if a FixModel does not exist within the collection', (t) => {
    const result = FixCollection.getFixRelativePosition('');

    expect(!result).toBe(true);
});

test('.getNearestFix() returns a fix and distance', (t) => {
    // In reality, this isnt the nearest fix to KSFO, but is the nearest in the mocks
    const expectedFix = FixCollection.findFixByName('OAL');
    const [fix, distance] = FixCollection.getNearestFix(
        airportPositionFixtureKSFO.relativePosition
    );

    expect(fix).toBe(expectedFix);
    expect(distance).not.toBe(Infinity);
});

test('.findRealFixes() returns a list of fixes that dont have `_` prepending thier name', (t) => {
    const result = FixCollection.findRealFixes();

    expect(result.length === 105).toBe(true);
});

test('.addItems() resets _items when it is called with an existing collection', (t) => {
    expect(FixCollection.length === 106).toBe(true);

    FixCollection.addItems(SMALL_FIX_LIST_MOCK, airportPositionFixtureKSFO);

    expect(FixCollection.length === 105).toBe(false);
    expect(FixCollection.length === 2).toBe(true);
});
