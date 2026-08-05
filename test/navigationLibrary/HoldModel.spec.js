import { test, expect, vi } from 'vitest';
import HoldModel from '../../src/assets/scripts/client/navigationLibrary/HoldModel';

import {
    FIX_NAME_MOCK_EMPTY,
    FIX_NAME_MOCK_VALID,
    HOLD_STRING_MOCK_INVALID_COURSE,
    HOLD_STRING_MOCK_INVALID_LENGTH,
    HOLD_STRING_MOCK_INVALID_SPEED,
    HOLD_STRING_MOCK_INVALID_SPEED_RESTRICTION,
    HOLD_STRING_MOCK_INVALID_TURN,
    HOLD_STRING_MOCK_MISSING_LENGTH,
    HOLD_STRING_MOCK_MISSING_RADIAL,
    HOLD_STRING_MOCK_MISSING_TURN,
    HOLD_STRING_MOCK_VALID,
    EXPECTED_HOLD_PARAMETERS
} from './_mocks/holdModelMocks';

test('throws if called with invalid parameters', () => {
    expect(() => new HoldModel(FIX_NAME_MOCK_EMPTY, null)).toThrow();
    expect(() => new HoldModel(FIX_NAME_MOCK_EMPTY, HOLD_STRING_MOCK_VALID)).toThrow();
    expect(() => new HoldModel(FIX_NAME_MOCK_VALID, null)).toThrow();

    expect(() => new HoldModel(FIX_NAME_MOCK_VALID, HOLD_STRING_MOCK_INVALID_COURSE)).toThrow();
    expect(() => new HoldModel(FIX_NAME_MOCK_VALID, HOLD_STRING_MOCK_INVALID_LENGTH)).toThrow();
    expect(() => new HoldModel(FIX_NAME_MOCK_VALID, HOLD_STRING_MOCK_INVALID_SPEED)).toThrow();
    expect(() => new HoldModel(FIX_NAME_MOCK_VALID, HOLD_STRING_MOCK_INVALID_SPEED_RESTRICTION)).toThrow();
    expect(() => new HoldModel(FIX_NAME_MOCK_VALID, HOLD_STRING_MOCK_INVALID_TURN)).toThrow();

    expect(() => new HoldModel(FIX_NAME_MOCK_VALID, HOLD_STRING_MOCK_MISSING_LENGTH)).toThrow();
    expect(() => new HoldModel(FIX_NAME_MOCK_VALID, HOLD_STRING_MOCK_MISSING_RADIAL)).toThrow();
    expect(() => new HoldModel(FIX_NAME_MOCK_VALID, HOLD_STRING_MOCK_MISSING_TURN)).toThrow();
});

test('accepts a hold string that is used to set the instance properties', () => {
    const model = new HoldModel(FIX_NAME_MOCK_VALID, HOLD_STRING_MOCK_VALID);

    expect(model.fixName).toBe(FIX_NAME_MOCK_VALID);
    expect(model.holdParameters).toEqual(EXPECTED_HOLD_PARAMETERS);
});

test('.reset() clears the instance properties', () => {
    const model = new HoldModel(FIX_NAME_MOCK_VALID, HOLD_STRING_MOCK_VALID);
    model.reset();

    expect(model.fixName).toBe('');
    expect(model.holdParameters).toBe(null);
});
