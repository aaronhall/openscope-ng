import { test, expect, vi } from 'vitest';

import AircraftTypeDefinitionModel from '../../src/assets/scripts/client/aircraft/AircraftTypeDefinitionModel';
import { AIRCRAFT_DEFINITION_MOCK } from './_mocks/aircraftMocks';

test('throws when passed invalid parameters', () => {
    const expectedMessage = /Invalid aircraftTypeDefinition passed to AircraftTypeDefinitionModel constructor\. Expected a non-empty object, but received .*/;

    expect(() => new AircraftTypeDefinitionModel(), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => new AircraftTypeDefinitionModel(null), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => new AircraftTypeDefinitionModel([]), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => new AircraftTypeDefinitionModel({}), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => new AircraftTypeDefinitionModel(42), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => new AircraftTypeDefinitionModel('threeve'), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
    expect(() => new AircraftTypeDefinitionModel(false), {
        instanceOf: TypeError,
        message: expectedMessage
    }).toThrow();
});

test('does not throw when passed valid parameters', () => {
    expect(() => new AircraftTypeDefinitionModel(AIRCRAFT_DEFINITION_MOCK)).not.toThrow();
});

test('._buildTypeForStripView() returns the icao when not a heavy/super weightClass', () => {
    const model = new AircraftTypeDefinitionModel(AIRCRAFT_DEFINITION_MOCK);
    const result = model._buildTypeForStripView();

    expect(result === 'B737/L').toBe(true);
});

test('._buildTypeForStripView() returns the correct string for H weightClass', () => {
    const model = new AircraftTypeDefinitionModel(AIRCRAFT_DEFINITION_MOCK);
    model.weightClass = 'H';
    const result = model._buildTypeForStripView();

    expect(result === 'H/B737/L').toBe(true);
});

test('._buildTypeForStripView() returns the correct string for J weightClass', () => {
    const model = new AircraftTypeDefinitionModel(AIRCRAFT_DEFINITION_MOCK);
    model.weightClass = 'J';
    const result = model._buildTypeForStripView();

    expect(result === 'J/B737/L').toBe(true);
});

test('.isHeavyOrSuper() returns true when `#weightClass` is `H`', () => {
    const model = new AircraftTypeDefinitionModel(AIRCRAFT_DEFINITION_MOCK);
    model.weightClass = 'H';

    expect(model.isHeavyOrSuper()).toBe(true);
});

test('.isHeavyOrSuper() returns true when `#weightClass` is `J`', () => {
    const model = new AircraftTypeDefinitionModel(AIRCRAFT_DEFINITION_MOCK);
    model.weightClass = 'J';

    expect(model.isHeavyOrSuper()).toBe(true);
});

test('.isHeavyOrSuper() returns false when `#weightClass` is not `H` or `J`', () => {
    const model = new AircraftTypeDefinitionModel(AIRCRAFT_DEFINITION_MOCK);
    model.weightClass = 'L';

    expect(model.isHeavyOrSuper()).toBe(false);
});

test('.calculateSameRunwaySeparationDistanceInFeet() returns the correct distance as long as the previous aircraft is not a srs category 3', () => {
    const model = new AircraftTypeDefinitionModel(AIRCRAFT_DEFINITION_MOCK);
    const previousModel = new AircraftTypeDefinitionModel(AIRCRAFT_DEFINITION_MOCK);
    previousModel.category.srs = 1;
    model.category.srs = 1;

    let distance = model.calculateSameRunwaySeparationDistanceInFeet(previousModel);

    expect(distance === 3000).toBe(true);

    model.category.srs = 2;
    distance = model.calculateSameRunwaySeparationDistanceInFeet(previousModel);

    expect(distance === 4500).toBe(true);

    model.category.srs = 3;
    distance = model.calculateSameRunwaySeparationDistanceInFeet(previousModel);

    expect(distance === 6000).toBe(true);
});

test('.calculateSameRunwaySeparationDistanceInFeet() returns 6000ft when the previous aircraft has no srs category or is srs category 3', () => {
    const model = new AircraftTypeDefinitionModel(AIRCRAFT_DEFINITION_MOCK);
    const previousModel = new AircraftTypeDefinitionModel(AIRCRAFT_DEFINITION_MOCK);
    model.category.srs = undefined;
    previousModel.category.srs = undefined;

    let distance = model.calculateSameRunwaySeparationDistanceInFeet(previousModel);

    expect(distance === 6000).toBe(true);

    previousModel.category.srs = 3;
    distance = model.calculateSameRunwaySeparationDistanceInFeet(previousModel);

    expect(distance === 6000).toBe(true);
});

test('.getRadioWeightClass() returns heavy for heavy aircrafts', () => {
    const model = new AircraftTypeDefinitionModel(AIRCRAFT_DEFINITION_MOCK);
    model.weightClass = 'H';

    expect(model.getRadioWeightClass() === 'heavy').toBe(true);
});

test('.getRadioWeightClass() returns super for super aircrafts', () => {
    const model = new AircraftTypeDefinitionModel(AIRCRAFT_DEFINITION_MOCK);
    model.weightClass = 'J';

    expect(model.getRadioWeightClass() === 'super').toBe(true);
});

test('.getRadioWeightClass() returns empty string if aircraft is neither super nor heavy', () => {
    const model = new AircraftTypeDefinitionModel(AIRCRAFT_DEFINITION_MOCK);
    model.weightClass = 'L';

    expect(model.getRadioWeightClass() === '').toBe(true);
});
