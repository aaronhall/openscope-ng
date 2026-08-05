import { test, expect, vi } from 'vitest';
import _isString from 'lodash/isString';

import BaseModel from '../../src/assets/scripts/client/base/BaseModel';
import ExtendedBaseModelFixture from './_fixtures/ExtendedBaseModelFixture';

test('sets the #_id when passed valid parameters', () => {
    let model = new BaseModel();
    expect(model._id.indexOf('BaseModel') !== -1).toBe(true);

    model = new BaseModel('modelName');
    expect(model._id.indexOf('modelName') !== -1).toBe(true);
});

test('throws when passed invalid parameters', () => {
    expect(() => new BaseModel([])).toThrow();
    expect(() => new BaseModel({})).toThrow();
    expect(() => new BaseModel(42)).toThrow();
    expect(() => new BaseModel(false)).toThrow();
});

test('makes sure the model in instantiates with the correct data type', () => {
    expect(() => new BaseModel()).not.toThrow();
    expect(() => new BaseModel('string')).not.toThrow();
});

test('instantiates with an _id property', () => {
    const model = new BaseModel();

    expect(_isString(model._id)).toBe(true);
});

test('._init() throws when called from BaseModel', () => {
    const model = new BaseModel();

    expect(() => model._init()).toThrow();
});

test('._init() does not throw when called by an extending class', () => {
    const model = new ExtendedBaseModelFixture();

    expect(() => model._init()).not.toThrow();
});

test('.reset() throws when called from BaseModel', () => {
    const model = new BaseModel();

    expect(() => model.reset()).toThrow();
});

test('.reset() does not throw when called from and extending class', () => {
    const model = new ExtendedBaseModelFixture();

    expect(() => model.reset()).not.toThrow();
});
