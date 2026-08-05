import { test, expect, vi } from 'vitest';
import sinon from 'sinon';
import _includes from 'lodash/includes';
import _map from 'lodash/map';
import EventBus from '../../src/assets/scripts/client/lib/EventBus';
import RadarTargetCollection from '../../src/assets/scripts/client/scope/RadarTargetCollection';
import { THEME } from '../../src/assets/scripts/client/constants/themes';
import { RADAR_TARGET_ARRIVAL_MOCK } from './_mocks/radarTargetMocks';
import {
    ARRIVAL_AIRCRAFT_MODEL_MOCK,
    DEPARTURE_AIRCRAFT_MODEL_MOCK
} from '../aircraft/_mocks/aircraftMocks';

test('does not throw when instantiated without parameters', () => {
    expect(() => new RadarTargetCollection()).not.toThrow();
});

test('correctly sets properties when instantiated with theme parameter', () => {
    const collection = new RadarTargetCollection(THEME.DEFAULT);

    expect(collection._eventBus).toEqual(EventBus);
    expect(collection._items).toEqual([]);
    expect(collection._theme).toEqual(THEME.DEFAULT);
});

test('#items returns read-only values of #_items', () => {
    const collection = new RadarTargetCollection(THEME.DEFAULT);

    expect(collection.items).toEqual(collection._items);
});

test('.addRadarTargetModel() throws if argument is not a RadarTargetModel', () => {
    const collection = new RadarTargetCollection(THEME.DEFAULT);
    const previousItems = collection._items;
    const invalidArgument = 'wazzup!!!';

    expect(() => collection.addRadarTargetModel(invalidArgument)).toThrow();
    expect(previousItems.length === collection._items.length).toBe(true);
});

test('.addRadarTargetModel() adds the supplied radar target to the collection', () => {
    const collection = new RadarTargetCollection(THEME.DEFAULT);

    collection.addRadarTargetModel(RADAR_TARGET_ARRIVAL_MOCK);

    expect(_includes(collection._items, RADAR_TARGET_ARRIVAL_MOCK)).toBe(true);
});

test('.addRadarTargetModelForAircraftModel() adds new radar target to collection for the provided aircraft model', () => {
    const collection = new RadarTargetCollection(THEME.DEFAULT);

    collection.addRadarTargetModelForAircraftModel(ARRIVAL_AIRCRAFT_MODEL_MOCK);

    expect(collection._items[0].aircraftModel).toEqual(ARRIVAL_AIRCRAFT_MODEL_MOCK);
});

test('.findRadarTargetModelForAircraftModel() returns undefined when aircraft has no corresponding radar target', () => {
    const collection = new RadarTargetCollection(THEME.DEFAULT);
    const result = collection.findRadarTargetModelForAircraftModel(ARRIVAL_AIRCRAFT_MODEL_MOCK);

    expect(result === undefined).toBe(true);
});

test('.findRadarTargetModelForAircraftModel() throws when multiple aircraft match', () => {
    const collection = new RadarTargetCollection(THEME.DEFAULT);

    collection.addRadarTargetModelForAircraftModel(ARRIVAL_AIRCRAFT_MODEL_MOCK);
    collection.addRadarTargetModelForAircraftModel(ARRIVAL_AIRCRAFT_MODEL_MOCK);

    expect(() => collection.findRadarTargetModelForAircraftModel(ARRIVAL_AIRCRAFT_MODEL_MOCK)).toThrow();
});

test('.findRadarTargetModelForAircraftModel() returns radar target for corresponding supplied aircraft model', () => {
    const collection = new RadarTargetCollection(THEME.DEFAULT);

    collection.addRadarTargetModelForAircraftModel(ARRIVAL_AIRCRAFT_MODEL_MOCK);

    const result = collection.findRadarTargetModelForAircraftModel(ARRIVAL_AIRCRAFT_MODEL_MOCK);

    expect(result.aircraftModel).toEqual(ARRIVAL_AIRCRAFT_MODEL_MOCK);
});

test('.findRadarTargetModelForAircraftReference() returns undefined when aircraft has no corresponding radar target', () => {
    const collection = new RadarTargetCollection(THEME.DEFAULT);
    const aircraftReference = 'AAL432';
    const result = collection.findRadarTargetModelForAircraftReference(aircraftReference);

    expect(result === undefined).toBe(true);
});

test('.findRadarTargetModelForAircraftReference() returns undefined when multiple aircraft match', () => {
    const collection = new RadarTargetCollection(THEME.DEFAULT);
    const aircraftReference = 'AAL432';

    collection.addRadarTargetModelForAircraftModel(ARRIVAL_AIRCRAFT_MODEL_MOCK);
    collection.addRadarTargetModelForAircraftModel(ARRIVAL_AIRCRAFT_MODEL_MOCK);

    const result = collection.findRadarTargetModelForAircraftReference(aircraftReference);

    expect(result === undefined).toBe(true);
});

test('.findRadarTargetModelForAircraftReference() returns radar target for corresponding supplied aircraft reference', () => {
    const collection = new RadarTargetCollection(THEME.DEFAULT);
    const aircraftReference = 'AAL432';

    collection.addRadarTargetModelForAircraftModel(ARRIVAL_AIRCRAFT_MODEL_MOCK);

    const result = collection.findRadarTargetModelForAircraftReference(aircraftReference);

    expect(result.aircraftModel).toEqual(ARRIVAL_AIRCRAFT_MODEL_MOCK);
});

test('.removeRadarTargetModelForAircraftModel() makes no changes when the specified aircraft does not have a corresponding radar target', () => {
    const collection = new RadarTargetCollection(THEME.DEFAULT);

    collection.addRadarTargetModelForAircraftModel(ARRIVAL_AIRCRAFT_MODEL_MOCK);

    const initialStateOfCollection = collection;

    collection.removeRadarTargetModelForAircraftModel(DEPARTURE_AIRCRAFT_MODEL_MOCK);

    expect(collection).toEqual(initialStateOfCollection);
});

test('.removeRadarTargetModelForAircraftModel() removes the corresponding radar target for the specified aircraft model', () => {
    const collection = new RadarTargetCollection(THEME.DEFAULT);

    collection.addRadarTargetModelForAircraftModel(ARRIVAL_AIRCRAFT_MODEL_MOCK);
    collection.addRadarTargetModelForAircraftModel(DEPARTURE_AIRCRAFT_MODEL_MOCK);
    collection.removeRadarTargetModelForAircraftModel(ARRIVAL_AIRCRAFT_MODEL_MOCK);

    const aircraftInCollection = _map(collection._items, (radarTargetModel) => radarTargetModel.aircraftModel);

    expect(_includes(aircraftInCollection, ARRIVAL_AIRCRAFT_MODEL_MOCK)).toBe(false);
    expect(_includes(aircraftInCollection, DEPARTURE_AIRCRAFT_MODEL_MOCK)).toBe(true);
});

test('.resetAllRadarTargets() calls .reset() method of each radar target model in the collection', () => {
    const collection = new RadarTargetCollection(THEME.DEFAULT);

    collection.addRadarTargetModelForAircraftModel(ARRIVAL_AIRCRAFT_MODEL_MOCK);
    collection.addRadarTargetModelForAircraftModel(DEPARTURE_AIRCRAFT_MODEL_MOCK);

    const arrivalAircraftResetSpy = sinon.spy(collection._items[0], 'reset');
    const departureAircraftResetSpy = sinon.spy(collection._items[1], 'reset');

    collection.resetAllRadarTargets();

    expect(arrivalAircraftResetSpy.calledOnce).toBe(true);
    expect(departureAircraftResetSpy.calledOnce).toBe(true);
});

test('.reset() clears all radar target models from the collection', () => {
    const collection = new RadarTargetCollection(THEME.DEFAULT);

    collection.addRadarTargetModelForAircraftModel(ARRIVAL_AIRCRAFT_MODEL_MOCK);
    collection.addRadarTargetModelForAircraftModel(DEPARTURE_AIRCRAFT_MODEL_MOCK);
    collection.reset();

    expect(collection._items.length === 0).toBe(true);
});

test('._setTheme returns early when an invalid theme name is passed', () => {
    const collection = new RadarTargetCollection(THEME.DEFAULT);
    const themeName = 'great googly moogly!';

    collection._setTheme(themeName);

    expect(collection._theme === THEME.DEFAULT).toBe(true);
});

test('._setTheme() changes the value of #_theme', () => {
    const collection = new RadarTargetCollection(THEME.DEFAULT);
    const themeName = 'CLASSIC';

    collection._setTheme(themeName);

    expect(collection._theme === THEME.CLASSIC).toBe(true);
});
