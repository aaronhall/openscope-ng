/* eslint-disable arrow-parens, import/no-extraneous-dependencies, new-cap */
import { test, expect, vi } from 'vitest';
import sinon from 'sinon';
import _isEqual from 'lodash/isEqual';

import modelSourcePool from '../../../src/assets/scripts/client/base/ModelSource/ModelSourcePool';
import FixModel from '../../../src/assets/scripts/client/navigationLibrary/FixModel';
import { airportPositionFixtureKSFO } from '../../fixtures/airportFixtures';
import { FIXNAME_MOCK, FIX_COORDINATE_MOCK } from '../../navigationLibrary/Fix/_mocks/fixMocks';

const SOURCE_NAME_MOCK = 'FixModel';

// when reactivating, use test.serial
test.skip('throws when attempting to instantiate', (t) => {
    expect(() => new modelSourcePool()).toThrow();
});

// when reactivating, use test.serial
test.skip('pre-populates pool with the specified number models', (t) => {
    expect(modelSourcePool.length !== 0).toBe(true);
    expect(modelSourcePool.length <= modelSourcePool._maxPoolSizePerModel).toBe(true);
});

// when reactivating, use test.serial
test.skip('.returnReusable() throws if the modelToAdd is the incorrect type', (t) => {
    const modelToAdd = new Date();

    expect(() => modelSourcePool.returnReusable(modelToAdd)).toThrow();
});

// when reactivating, use test.serial
test.skip('.returnReusable() adds the modelToAdd to the pool', (t) => {
    const reusableModel = new FixModel(
        FIXNAME_MOCK,
        FIX_COORDINATE_MOCK,
        airportPositionFixtureKSFO
    );
    const expectedResult = modelSourcePool.length + 1;

    modelSourcePool.returnReusable(reusableModel);

    expect(modelSourcePool.length === expectedResult).toBe(true);
});

// when reactivating, use test.serial
test.skip('._findModelByConstructorName() returns null if no instance is found within the pool', (t) => {
    const result = modelSourcePool._findModelByConstructorName('Date');

    expect(!result).toBe(true);
});

// when reactivating, use test.serial
test.skip('._findModelByConstructorName() returns an instance if one is found within the pool', (t) => {
    const result = modelSourcePool._findModelByConstructorName('FixModel');

    expect(result instanceof FixModel).toBe(true);
});

// when reactivating, use test.serial
test.skip('._findModelByConstructorName() calls ._removeItem() when an instance is found within the pool', (t) => {
    const stub = sinon.stub(modelSourcePool, '_removeItem');
    const result = modelSourcePool._findModelByConstructorName('FixModel');

    expect(result instanceof FixModel).toBe(true);
    expect(stub.withArgs(result).calledOnce).toBe(true);
});

// when reactivating, use test.serial
test.skip('.releaseModelFromPool() calls _findModelByConstructorName() with the correct argument', (t) => {
    const stub = sinon.stub(modelSourcePool, '_findModelByConstructorName');
    modelSourcePool.releaseReusable(
        SOURCE_NAME_MOCK,
        FIXNAME_MOCK,
        FIX_COORDINATE_MOCK,
        airportPositionFixtureKSFO
    );

    expect(stub.calledOnce).toBe(true);
    expect(stub.getCall(0).args[0] === SOURCE_NAME_MOCK).toBe(true);
});

// when reactivating, use test.serial
test.skip('.releaseModelFromPool() returns a model if one exists within the pool', (t) => {
    const expectedPosition = [74.90562387226687, 81.0566028386814];
    const result = modelSourcePool.releaseReusable(
        SOURCE_NAME_MOCK,
        FIXNAME_MOCK,
        FIX_COORDINATE_MOCK,
        airportPositionFixtureKSFO
    );

    expect(result instanceof FixModel).toBe(true);
    expect(result.name === FIXNAME_MOCK).toBe(true);
    expect(_isEqual(result.relativePosition, expectedPosition)).toBe(true);
});

// when reactivating, use test.serial
test.skip('.releasModelFromPool() returns a model if none exist within the pool', (t) => {
    modelSourcePool._items = [];
    const expectedPosition = [74.90562387226687, 81.0566028386814];
    const result = modelSourcePool.releaseReusable(
        SOURCE_NAME_MOCK,
        FIXNAME_MOCK,
        FIX_COORDINATE_MOCK,
        airportPositionFixtureKSFO
    );

    expect(result instanceof FixModel).toBe(true);
    expect(result.name === FIXNAME_MOCK).toBe(true);
    expect(_isEqual(result.relativePosition, expectedPosition)).toBe(true);
});
