import { test, expect, vi } from 'vitest';
import FixModel from '../../../src/assets/scripts/client/navigationLibrary/FixModel';
import DynamicPositionModel from '../../../src/assets/scripts/client/base/DynamicPositionModel';
import { FIXNAME_MOCK, FIX_COORDINATE_MOCK, REAL_FIXNAME_MOCK } from './_mocks/fixMocks';
import { airportPositionFixtureKSFO } from '../../fixtures/airportFixtures';
import {
    createNavigationLibraryFixture,
    resetNavigationLibraryFixture,
} from '../../fixtures/navigationLibraryFixtures';

beforeEach(() => {
    createNavigationLibraryFixture();
});

afterEach(() => {
    resetNavigationLibraryFixture();
});

test('throws when instantiated with invalid parameters', () => {
    expect(() => new FixModel()).toThrow();
    expect(() => new FixModel([])).toThrow();
    expect(() => new FixModel('')).toThrow();
    expect(() => new FixModel(42)).toThrow();
    expect(() => new FixModel(false)).toThrow();
    expect(() => new FixModel(FIXNAME_MOCK, undefined, airportPositionFixtureKSFO)).toThrow();
    expect(() => new FixModel(FIXNAME_MOCK, FIX_COORDINATE_MOCK, undefined)).toThrow();
    expect(() => new FixModel(FIXNAME_MOCK, undefined, undefined)).toThrow();
    expect(
        () => new FixModel(undefined, FIX_COORDINATE_MOCK, airportPositionFixtureKSFO)
    ).toThrow();
    expect(() => new FixModel(undefined, undefined, airportPositionFixtureKSFO)).toThrow();
    expect(() => new FixModel(undefined, FIX_COORDINATE_MOCK, undefined)).toThrow();
});

test('.init() sets name in upperCase', () => {
    let model = new FixModel('uppercase', FIX_COORDINATE_MOCK, airportPositionFixtureKSFO);
    expect(model.name === 'UPPERCASE').toBe(true);

    model = new FixModel('u443rcas3', FIX_COORDINATE_MOCK, airportPositionFixtureKSFO);
    expect(model.name === 'U443RCAS3').toBe(true);
});

test('.init() sets spoken to specified value (lower-cased) when "spoken" parameter is given', () => {
    let model = new FixModel(
        FIXNAME_MOCK,
        [...FIX_COORDINATE_MOCK, 'Spoken Werds'],
        airportPositionFixtureKSFO
    );
    expect(model.spoken === 'spoken werds').toBe(true);

    model = new FixModel(
        FIXNAME_MOCK,
        [...FIX_COORDINATE_MOCK, 'L0W3RC4S3'],
        airportPositionFixtureKSFO
    );
    expect(model.spoken === 'l0w3rc4s3').toBe(true);
});

test('.init() sets spoken to fix name (lower-cased) when "spoken" parameter is not given', () => {
    let model = new FixModel('FIXXA', [...FIX_COORDINATE_MOCK], airportPositionFixtureKSFO);
    expect(model.spoken === 'fixxa').toBe(true);

    model = new FixModel('F1XX4', [...FIX_COORDINATE_MOCK], airportPositionFixtureKSFO);
    expect(model.spoken === 'f1xx4').toBe(true);
});

test('.isRealFix returns correct value', () => {
    let model = new FixModel(FIXNAME_MOCK, FIX_COORDINATE_MOCK, airportPositionFixtureKSFO);
    expect(model.isRealFix).toBe(false);

    model = new FixModel(REAL_FIXNAME_MOCK, FIX_COORDINATE_MOCK, airportPositionFixtureKSFO);
    expect(model.isRealFix).toBe(true);
});

test('.clonePosition() returns a DynamicPositionModel with the position information of the FixModel', () => {
    const model = new FixModel(FIXNAME_MOCK, FIX_COORDINATE_MOCK, airportPositionFixtureKSFO);
    const result = model.clonePosition();

    expect(result instanceof DynamicPositionModel).toBe(true);
    expect(result.latitude === model.positionModel.latitude).toBe(true);
    expect(result.longitude === model.positionModel.longitude).toBe(true);
});
