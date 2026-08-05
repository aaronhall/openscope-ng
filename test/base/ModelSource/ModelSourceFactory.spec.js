/* eslint-disable arrow-parens, import/no-extraneous-dependencies, new-cap */
import { test, expect, vi } from 'vitest';

import ModelSourceFactory from '../../../src/assets/scripts/client/base/ModelSource/ModelSourceFactory';
import FixModel from '../../../src/assets/scripts/client/navigationLibrary/FixModel';
import { FIXNAME_MOCK, FIX_COORDINATE_MOCK } from '../../navigationLibrary/Fix/_mocks/fixMocks';
import { airportPositionFixtureKSFO } from '../../fixtures/airportFixtures';
import {
    createNavigationLibraryFixture,
    resetNavigationLibraryFixture,
} from '../../fixtures/navigationLibraryFixtures';

const SOURCE_NAME_MOCK = 'FixModel';
const FIX_ARGS_MOCK = [FIXNAME_MOCK, FIX_COORDINATE_MOCK, airportPositionFixtureKSFO];

beforeEach(() => {
    createNavigationLibraryFixture();
});

afterEach(() => {
    resetNavigationLibraryFixture();
});

test('throws when attempting to instantiate', () => {
    expect(() => new ModelSourceFactory()).toThrow();
});

test('.getModelSourceForType() throws when provided an unsupported type', () => {
    expect(() => ModelSourceFactory.getModelSourceForType('abc')).toThrow();
});

test('.getModelSourceForType() does not throw when provided a supported type', () => {
    expect(() =>
        ModelSourceFactory.getModelSourceForType(SOURCE_NAME_MOCK, ...FIX_ARGS_MOCK)
    ).not.toThrow();
});

test('.getModelSourceForType() returns a constructor when one doesnt exist in the pool', () => {
    const result = ModelSourceFactory.getModelSourceForType(SOURCE_NAME_MOCK, ...FIX_ARGS_MOCK);

    expect(result instanceof FixModel).toBe(true);
});

test('.getModelSourceForType() returns a constructor that exists in the pool', () => {
    const model = new FixModel(...FIX_ARGS_MOCK);
    ModelSourceFactory.returnModelToPool(model);
    const result = ModelSourceFactory.getModelSourceForType(SOURCE_NAME_MOCK, ...FIX_ARGS_MOCK);

    expect(result instanceof FixModel).toBe(true);
});

test('.returnModelToPool() throws when provided an unsupported type', () => {
    const model = new Date();

    expect(() => ModelSourceFactory.returnModelToPool(model)).toThrow();
});

test('.returnModelToPool() accepts a class instance', () => {
    const model = new FixModel(...FIX_ARGS_MOCK);

    expect(() => ModelSourceFactory.returnModelToPool(model)).not.toThrow();
});
