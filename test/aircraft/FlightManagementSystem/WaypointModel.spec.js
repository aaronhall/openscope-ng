import { test, expect, vi } from 'vitest';
import sinon from 'sinon';
import WaypointModel from '../../../src/assets/scripts/client/aircraft/FlightManagementSystem/WaypointModel';
import StaticPositionModel from '../../../src/assets/scripts/client/base/StaticPositionModel';
import {
    createNavigationLibraryFixture,
    resetNavigationLibraryFixture
} from '../../fixtures/navigationLibraryFixtures';
import { INVALID_NUMBER } from '../../../src/assets/scripts/client/constants/globalConstants';
import { DEFAULT_HOLD_PARAMETERS } from '../../../src/assets/scripts/client/constants/waypointConstants';

let sandbox;

beforeEach(() => {
    sandbox = sinon.createSandbox();
    createNavigationLibraryFixture();
});

afterEach(() => {
    sandbox.restore();
    resetNavigationLibraryFixture();
});

test('throws when instantiated without parameters', () => {
    expect(() => new WaypointModel()).toThrow();
});

test('throws when instantiated with string containing unknown fix', () => {
    expect(() => new WaypointModel('INVALIDFIXNAME')).toThrow();
});

test('throws when instantiated with array containing unknown fix', () => {
    expect(() => new WaypointModel(['INVALIDFIXNAME', 'A100'])).toThrow();
});

test('throws when instantiated with an array containing an unrestricted fix', () => {
    expect(() => new WaypointModel(['BOACH'])).toThrow();
});

test('throws when instantiated with an array containing improperly formatted restrictions', () => {
    expect(() => new WaypointModel(['BOACH', '100A'])).toThrow();
});

test('throws when instantiated with an array containing improperly formatted altitude restrictions', () => {
    expect(() => new WaypointModel(['BOACH', 'A1000'])).toThrow();
    expect(() => new WaypointModel(['BOACH', 'A150@'])).toThrow();
});

test('throws when instantiated with an array containing improperly formatted speed restrictions', () => {
    expect(() => new WaypointModel(['BOACH', 'S50+'])).toThrow();
    expect(() => new WaypointModel(['BOACH', 'S1000+'])).toThrow();
    expect(() => new WaypointModel(['BOACH', 'S150@'])).toThrow();
});

test('does not throw when instantiated with string containing known fix', () => {
    expect(() => new WaypointModel('BOACH')).not.toThrow();
});

test('does not throw when instantiated with array containing known fix', () => {
    expect(() => new WaypointModel(['BOACH', 'A100-'])).not.toThrow();
});

test('instantiates correctly when given a fly-over fix', () => {
    const model = new WaypointModel('^BOACH');

    expect(model.altitudeMaximum === -1).toBe(true);
    expect(model.altitudeMinimum === -1).toBe(true);
    expect(model.speedMaximum === -1).toBe(true);
    expect(model.speedMinimum === -1).toBe(true);
    expect(model._isFlyOverWaypoint === true).toBe(true);
    expect(model._isHoldWaypoint === false).toBe(true);
    expect(model._isVectorWaypoint === false).toBe(true);
    expect(model._name === 'BOACH').toBe(true);
    expect(model._positionModel.gps).toEqual([35.6782610435946, -115.29470074200118]);
});

test('instantiates correctly when given a hold fix', () => {
    const model = new WaypointModel('@BOACH');

    expect(model.altitudeMaximum === -1).toBe(true);
    expect(model.altitudeMinimum === -1).toBe(true);
    expect(model.speedMaximum === -1).toBe(true);
    expect(model.speedMinimum === -1).toBe(true);
    expect(model._isFlyOverWaypoint === false).toBe(true);
    expect(model._isHoldWaypoint === true).toBe(true);
    expect(model._isVectorWaypoint === false).toBe(true);
    expect(model._name === 'BOACH').toBe(true);
    expect(model._positionModel.gps).toEqual([35.6782610435946, -115.29470074200118]);
});

test('instantiates correctly when given a vector fix', () => {
    const model = new WaypointModel('#320');

    expect(model.altitudeMaximum === -1).toBe(true);
    expect(model.altitudeMinimum === -1).toBe(true);
    expect(model.speedMaximum === -1).toBe(true);
    expect(model.speedMinimum === -1).toBe(true);
    expect(model._isFlyOverWaypoint === false).toBe(true);
    expect(model._isHoldWaypoint === false).toBe(true);
    expect(model._isVectorWaypoint === true).toBe(true);
    expect(model._name === '#320').toBe(true);
    expect(!model._positionModel).toBe(true);
});

test('instantiates correctly when given an unrestricted fix', () => {
    const model = new WaypointModel('BOACH');

    expect(model.altitudeMaximum === -1).toBe(true);
    expect(model.altitudeMinimum === -1).toBe(true);
    expect(model.speedMaximum === -1).toBe(true);
    expect(model.speedMinimum === -1).toBe(true);
    expect(model._isFlyOverWaypoint === false).toBe(true);
    expect(model._isHoldWaypoint === false).toBe(true);
    expect(model._isVectorWaypoint === false).toBe(true);
    expect(model._name === 'BOACH').toBe(true);
    expect(model._positionModel.gps).toEqual([35.6782610435946, -115.29470074200118]);
});

test('instantiates correctly when given a restricted fix (simple altitude)', () => {
    const model = new WaypointModel(['BOACH', 'A100']);

    expect(model.altitudeMaximum === 10000).toBe(true);
    expect(model.altitudeMinimum === 10000).toBe(true);
    expect(model.speedMaximum === -1).toBe(true);
    expect(model.speedMinimum === -1).toBe(true);
    expect(model._isFlyOverWaypoint === false).toBe(true);
    expect(model._isHoldWaypoint === false).toBe(true);
    expect(model._isVectorWaypoint === false).toBe(true);
    expect(model._name === 'BOACH').toBe(true);
    expect(model._positionModel.gps).toEqual([35.6782610435946, -115.29470074200118]);
});

test('instantiates correctly when given a restricted fix (minimum altitude)', () => {
    const model = new WaypointModel(['BOACH', 'A100+']);

    expect(model.altitudeMaximum === -1).toBe(true);
    expect(model.altitudeMinimum === 10000).toBe(true);
    expect(model.speedMaximum === -1).toBe(true);
    expect(model.speedMinimum === -1).toBe(true);
    expect(model._isFlyOverWaypoint === false).toBe(true);
    expect(model._isHoldWaypoint === false).toBe(true);
    expect(model._isVectorWaypoint === false).toBe(true);
    expect(model._name === 'BOACH').toBe(true);
    expect(model._positionModel.gps).toEqual([35.6782610435946, -115.29470074200118]);
});

test('instantiates correctly when given a restricted fix (maximum altitude)', () => {
    const model = new WaypointModel(['BOACH', 'A100-']);

    expect(model.altitudeMaximum === 10000).toBe(true);
    expect(model.altitudeMinimum === -1).toBe(true);
    expect(model.speedMaximum === -1).toBe(true);
    expect(model.speedMinimum === -1).toBe(true);
    expect(model._isFlyOverWaypoint === false).toBe(true);
    expect(model._isHoldWaypoint === false).toBe(true);
    expect(model._isVectorWaypoint === false).toBe(true);
    expect(model._name === 'BOACH').toBe(true);
    expect(model._positionModel.gps).toEqual([35.6782610435946, -115.29470074200118]);
});

test('instantiates correctly when given a restricted fix (ranged altitude)', () => {
    const model = new WaypointModel(['BOACH', 'A80+|A120-']);

    expect(model.altitudeMaximum === 12000).toBe(true);
    expect(model.altitudeMinimum === 8000).toBe(true);
    expect(model.speedMaximum === -1).toBe(true);
    expect(model.speedMinimum === -1).toBe(true);
    expect(model._isFlyOverWaypoint === false).toBe(true);
    expect(model._isHoldWaypoint === false).toBe(true);
    expect(model._isVectorWaypoint === false).toBe(true);
    expect(model._name === 'BOACH').toBe(true);
    expect(model._positionModel.gps).toEqual([35.6782610435946, -115.29470074200118]);
});

test('instantiates correctly when given a restricted fix (simple speed)', () => {
    const model = new WaypointModel(['BOACH', 'S210']);

    expect(model.altitudeMaximum === -1).toBe(true);
    expect(model.altitudeMinimum === -1).toBe(true);
    expect(model.speedMaximum === 210).toBe(true);
    expect(model.speedMinimum === 210).toBe(true);
    expect(model._isFlyOverWaypoint === false).toBe(true);
    expect(model._isHoldWaypoint === false).toBe(true);
    expect(model._isVectorWaypoint === false).toBe(true);
    expect(model._name === 'BOACH').toBe(true);
    expect(model._positionModel.gps).toEqual([35.6782610435946, -115.29470074200118]);
});

test('instantiates correctly when given a restricted fix (minimum speed)', () => {
    const model = new WaypointModel(['BOACH', 'S210+']);

    expect(model.altitudeMaximum === -1).toBe(true);
    expect(model.altitudeMinimum === -1).toBe(true);
    expect(model.speedMaximum === -1).toBe(true);
    expect(model.speedMinimum === 210).toBe(true);
    expect(model._isFlyOverWaypoint === false).toBe(true);
    expect(model._isHoldWaypoint === false).toBe(true);
    expect(model._isVectorWaypoint === false).toBe(true);
    expect(model._name === 'BOACH').toBe(true);
    expect(model._positionModel.gps).toEqual([35.6782610435946, -115.29470074200118]);
});

test('instantiates correctly when given a restricted fix (maximum speed)', () => {
    const model = new WaypointModel(['BOACH', 'S210-']);

    expect(model.altitudeMaximum === -1).toBe(true);
    expect(model.altitudeMinimum === -1).toBe(true);
    expect(model.speedMaximum === 210).toBe(true);
    expect(model.speedMinimum === -1).toBe(true);
    expect(model._isFlyOverWaypoint === false).toBe(true);
    expect(model._isHoldWaypoint === false).toBe(true);
    expect(model._isVectorWaypoint === false).toBe(true);
    expect(model._name === 'BOACH').toBe(true);
    expect(model._positionModel.gps).toEqual([35.6782610435946, -115.29470074200118]);
});

test('instantiates correctly when given a restricted fix (ranged speed)', () => {
    const model = new WaypointModel(['BOACH', 'S200+|S220-']);

    expect(model.altitudeMaximum === -1).toBe(true);
    expect(model.altitudeMinimum === -1).toBe(true);
    expect(model.speedMaximum === 220).toBe(true);
    expect(model.speedMinimum === 200).toBe(true);
    expect(model._isFlyOverWaypoint === false).toBe(true);
    expect(model._isHoldWaypoint === false).toBe(true);
    expect(model._isVectorWaypoint === false).toBe(true);
    expect(model._name === 'BOACH').toBe(true);
    expect(model._positionModel.gps).toEqual([35.6782610435946, -115.29470074200118]);
});

test('instantiates correctly when given a restricted fix (simple altitude and simple speed)', () => {
    const model = new WaypointModel(['BOACH', 'A100|S210']);

    expect(model.altitudeMaximum === 10000).toBe(true);
    expect(model.altitudeMinimum === 10000).toBe(true);
    expect(model.speedMaximum === 210).toBe(true);
    expect(model.speedMinimum === 210).toBe(true);
    expect(model._isFlyOverWaypoint === false).toBe(true);
    expect(model._isHoldWaypoint === false).toBe(true);
    expect(model._isVectorWaypoint === false).toBe(true);
    expect(model._name === 'BOACH').toBe(true);
    expect(model._positionModel.gps).toEqual([35.6782610435946, -115.29470074200118]);
});

test('instantiates correctly when given a restricted fix (simple altitude and minimum speed)', () => {
    const model = new WaypointModel(['BOACH', 'A100|S210+']);

    expect(model.altitudeMaximum === 10000).toBe(true);
    expect(model.altitudeMinimum === 10000).toBe(true);
    expect(model.speedMaximum === -1).toBe(true);
    expect(model.speedMinimum === 210).toBe(true);
    expect(model._isFlyOverWaypoint === false).toBe(true);
    expect(model._isHoldWaypoint === false).toBe(true);
    expect(model._isVectorWaypoint === false).toBe(true);
    expect(model._name === 'BOACH').toBe(true);
    expect(model._positionModel.gps).toEqual([35.6782610435946, -115.29470074200118]);
});

test('instantiates correctly when given a restricted fix (simple altitude and maximum speed)', () => {
    const model = new WaypointModel(['BOACH', 'A100|S210-']);

    expect(model.altitudeMaximum === 10000).toBe(true);
    expect(model.altitudeMinimum === 10000).toBe(true);
    expect(model.speedMaximum === 210).toBe(true);
    expect(model.speedMinimum === -1).toBe(true);
    expect(model._isFlyOverWaypoint === false).toBe(true);
    expect(model._isHoldWaypoint === false).toBe(true);
    expect(model._isVectorWaypoint === false).toBe(true);
    expect(model._name === 'BOACH').toBe(true);
    expect(model._positionModel.gps).toEqual([35.6782610435946, -115.29470074200118]);
});

test('instantiates correctly when given a restricted fix (simple altitude and ranged speed)', () => {
    const model = new WaypointModel(['BOACH', 'A100|S200+|S220-']);

    expect(model.altitudeMaximum === 10000).toBe(true);
    expect(model.altitudeMinimum === 10000).toBe(true);
    expect(model.speedMaximum === 220).toBe(true);
    expect(model.speedMinimum === 200).toBe(true);
    expect(model._isFlyOverWaypoint === false).toBe(true);
    expect(model._isHoldWaypoint === false).toBe(true);
    expect(model._isVectorWaypoint === false).toBe(true);
    expect(model._name === 'BOACH').toBe(true);
    expect(model._positionModel.gps).toEqual([35.6782610435946, -115.29470074200118]);
});

test('instantiates correctly when given a restricted fix (minimum altitude and simple speed)', () => {
    const model = new WaypointModel(['BOACH', 'A100+|S210']);

    expect(model.altitudeMaximum === -1).toBe(true);
    expect(model.altitudeMinimum === 10000).toBe(true);
    expect(model.speedMaximum === 210).toBe(true);
    expect(model.speedMinimum === 210).toBe(true);
    expect(model._isFlyOverWaypoint === false).toBe(true);
    expect(model._isHoldWaypoint === false).toBe(true);
    expect(model._isVectorWaypoint === false).toBe(true);
    expect(model._name === 'BOACH').toBe(true);
    expect(model._positionModel.gps).toEqual([35.6782610435946, -115.29470074200118]);
});

test('instantiates correctly when given a restricted fix (minimum altitude and minimum speed)', () => {
    const model = new WaypointModel(['BOACH', 'A100+|S210+']);

    expect(model.altitudeMaximum === -1).toBe(true);
    expect(model.altitudeMinimum === 10000).toBe(true);
    expect(model.speedMaximum === -1).toBe(true);
    expect(model.speedMinimum === 210).toBe(true);
    expect(model._isFlyOverWaypoint === false).toBe(true);
    expect(model._isHoldWaypoint === false).toBe(true);
    expect(model._isVectorWaypoint === false).toBe(true);
    expect(model._name === 'BOACH').toBe(true);
    expect(model._positionModel.gps).toEqual([35.6782610435946, -115.29470074200118]);
});

test('instantiates correctly when given a restricted fix (minimum altitude and maximum speed)', () => {
    const model = new WaypointModel(['BOACH', 'A100+|S210-']);

    expect(model.altitudeMaximum === -1).toBe(true);
    expect(model.altitudeMinimum === 10000).toBe(true);
    expect(model.speedMaximum === 210).toBe(true);
    expect(model.speedMinimum === -1).toBe(true);
    expect(model._isFlyOverWaypoint === false).toBe(true);
    expect(model._isHoldWaypoint === false).toBe(true);
    expect(model._isVectorWaypoint === false).toBe(true);
    expect(model._name === 'BOACH').toBe(true);
    expect(model._positionModel.gps).toEqual([35.6782610435946, -115.29470074200118]);
});

test('instantiates correctly when given a restricted fix (minimum altitude and ranged speed)', () => {
    const model = new WaypointModel(['BOACH', 'A100+|S200+|S220-']);

    expect(model.altitudeMaximum === -1).toBe(true);
    expect(model.altitudeMinimum === 10000).toBe(true);
    expect(model.speedMaximum === 220).toBe(true);
    expect(model.speedMinimum === 200).toBe(true);
    expect(model._isFlyOverWaypoint === false).toBe(true);
    expect(model._isHoldWaypoint === false).toBe(true);
    expect(model._isVectorWaypoint === false).toBe(true);
    expect(model._name === 'BOACH').toBe(true);
    expect(model._positionModel.gps).toEqual([35.6782610435946, -115.29470074200118]);
});

test('instantiates correctly when given a restricted fix (maximum altitude and simple speed)', () => {
    const model = new WaypointModel(['BOACH', 'A100-|S210']);

    expect(model.altitudeMaximum === 10000).toBe(true);
    expect(model.altitudeMinimum === -1).toBe(true);
    expect(model.speedMaximum === 210).toBe(true);
    expect(model.speedMinimum === 210).toBe(true);
    expect(model._isFlyOverWaypoint === false).toBe(true);
    expect(model._isHoldWaypoint === false).toBe(true);
    expect(model._isVectorWaypoint === false).toBe(true);
    expect(model._name === 'BOACH').toBe(true);
    expect(model._positionModel.gps).toEqual([35.6782610435946, -115.29470074200118]);
});

test('instantiates correctly when given a restricted fix (maximum altitude and minimum speed)', () => {
    const model = new WaypointModel(['BOACH', 'A100-|S210+']);

    expect(model.altitudeMaximum === 10000).toBe(true);
    expect(model.altitudeMinimum === -1).toBe(true);
    expect(model.speedMaximum === -1).toBe(true);
    expect(model.speedMinimum === 210).toBe(true);
    expect(model._isFlyOverWaypoint === false).toBe(true);
    expect(model._isHoldWaypoint === false).toBe(true);
    expect(model._isVectorWaypoint === false).toBe(true);
    expect(model._name === 'BOACH').toBe(true);
    expect(model._positionModel.gps).toEqual([35.6782610435946, -115.29470074200118]);
});

test('instantiates correctly when given a restricted fix (maximum altitude and maximum speed)', () => {
    const model = new WaypointModel(['BOACH', 'A100-|S210-']);

    expect(model.altitudeMaximum === 10000).toBe(true);
    expect(model.altitudeMinimum === -1).toBe(true);
    expect(model.speedMaximum === 210).toBe(true);
    expect(model.speedMinimum === -1).toBe(true);
    expect(model._isFlyOverWaypoint === false).toBe(true);
    expect(model._isHoldWaypoint === false).toBe(true);
    expect(model._isVectorWaypoint === false).toBe(true);
    expect(model._name === 'BOACH').toBe(true);
    expect(model._positionModel.gps).toEqual([35.6782610435946, -115.29470074200118]);
});

test('instantiates correctly when given a restricted fix (maximum altitude and ranged speed)', () => {
    const model = new WaypointModel(['BOACH', 'A100-|S200+|S220-']);

    expect(model.altitudeMaximum === 10000).toBe(true);
    expect(model.altitudeMinimum === -1).toBe(true);
    expect(model.speedMaximum === 220).toBe(true);
    expect(model.speedMinimum === 200).toBe(true);
    expect(model._isFlyOverWaypoint === false).toBe(true);
    expect(model._isHoldWaypoint === false).toBe(true);
    expect(model._isVectorWaypoint === false).toBe(true);
    expect(model._name === 'BOACH').toBe(true);
    expect(model._positionModel.gps).toEqual([35.6782610435946, -115.29470074200118]);
});

test('instantiates correctly when given a restricted fix (ranged altitude and simple speed)', () => {
    const model = new WaypointModel(['BOACH', 'A80+|A120-|S210']);

    expect(model.altitudeMaximum === 12000).toBe(true);
    expect(model.altitudeMinimum === 8000).toBe(true);
    expect(model.speedMaximum === 210).toBe(true);
    expect(model.speedMinimum === 210).toBe(true);
    expect(model._isFlyOverWaypoint === false).toBe(true);
    expect(model._isHoldWaypoint === false).toBe(true);
    expect(model._isVectorWaypoint === false).toBe(true);
    expect(model._name === 'BOACH').toBe(true);
    expect(model._positionModel.gps).toEqual([35.6782610435946, -115.29470074200118]);
});

test('instantiates correctly when given a restricted fix (ranged altitude and minimum speed)', () => {
    const model = new WaypointModel(['BOACH', 'A80+|A120-|S210+']);

    expect(model.altitudeMaximum === 12000).toBe(true);
    expect(model.altitudeMinimum === 8000).toBe(true);
    expect(model.speedMaximum === -1).toBe(true);
    expect(model.speedMinimum === 210).toBe(true);
    expect(model._isFlyOverWaypoint === false).toBe(true);
    expect(model._isHoldWaypoint === false).toBe(true);
    expect(model._isVectorWaypoint === false).toBe(true);
    expect(model._name === 'BOACH').toBe(true);
    expect(model._positionModel.gps).toEqual([35.6782610435946, -115.29470074200118]);
});

test('instantiates correctly when given a restricted fix (ranged altitude and maximum speed)', () => {
    const model = new WaypointModel(['BOACH', 'A80+|A120-|S210-']);

    expect(model.altitudeMaximum === 12000).toBe(true);
    expect(model.altitudeMinimum === 8000).toBe(true);
    expect(model.speedMaximum === 210).toBe(true);
    expect(model.speedMinimum === -1).toBe(true);
    expect(model._isFlyOverWaypoint === false).toBe(true);
    expect(model._isHoldWaypoint === false).toBe(true);
    expect(model._isVectorWaypoint === false).toBe(true);
    expect(model._name === 'BOACH').toBe(true);
    expect(model._positionModel.gps).toEqual([35.6782610435946, -115.29470074200118]);
});

test('instantiates correctly when given a restricted fix (ranged altitude and ranged speed)', () => {
    const model = new WaypointModel(['BOACH', 'A80+|A120-|S200+|S220-']);

    expect(model.altitudeMaximum === 12000).toBe(true);
    expect(model.altitudeMinimum === 8000).toBe(true);
    expect(model.speedMaximum === 220).toBe(true);
    expect(model.speedMinimum === 200).toBe(true);
    expect(model._isFlyOverWaypoint === false).toBe(true);
    expect(model._isHoldWaypoint === false).toBe(true);
    expect(model._isVectorWaypoint === false).toBe(true);
    expect(model._name === 'BOACH').toBe(true);
    expect(model._positionModel.gps).toEqual([35.6782610435946, -115.29470074200118]);
});

test('#hasAltitudeRestriction returns true when a minimum or maximium altitude restriction exists', () => {
    const modelWithSimpleRestriction = new WaypointModel(['BOACH', 'A100']);
    const modelWithMaximumRestriction = new WaypointModel(['BOACH', 'A120-']);
    const modelWithMininmumRestriction = new WaypointModel(['BOACH', 'A80+']);
    const modelWithRangedRestriction = new WaypointModel(['BOACH', 'A80+|A80-']);

    expect(modelWithSimpleRestriction.hasAltitudeRestriction).toBe(true);
    expect(modelWithMaximumRestriction.hasAltitudeRestriction).toBe(true);
    expect(modelWithMininmumRestriction.hasAltitudeRestriction).toBe(true);
    expect(modelWithRangedRestriction.hasAltitudeRestriction).toBe(true);
});

test('#hasAltitudeRestriction returns false when neither minimum nor maximum altitude restriction exists', () => {
    const model = new WaypointModel('BOACH');

    expect(model.hasAltitudeRestriction).toBe(false);
});

test('#hasRestriction returns true when any altitude or speed restriction exists', () => {
    const modelWithAltitudeRestriction = new WaypointModel(['BOACH', 'A100']);
    const modelWithSpeedRestriction = new WaypointModel(['BOACH', 'S250']);

    expect(modelWithAltitudeRestriction.hasRestriction).toBe(true);
    expect(modelWithSpeedRestriction.hasRestriction).toBe(true);
});

test('#hasRestriction returns false when neither altitude nor speed restriction exists', () => {
    const model = new WaypointModel('BOACH');

    expect(model.hasRestriction).toBe(false);
});

test('#hasSpeedRestriction returns true when a minimum or maximum speed restriction exists', () => {
    const modelWithSimpleRestriction = new WaypointModel(['BOACH', 'S210']);
    const modelWithMaximumRestriction = new WaypointModel(['BOACH', 'S220-']);
    const modelWithMininmumRestriction = new WaypointModel(['BOACH', 'S200+']);
    const modelWithRangedRestriction = new WaypointModel(['BOACH', 'S200+|S220-']);

    expect(modelWithSimpleRestriction.hasSpeedRestriction).toBe(true);
    expect(modelWithMaximumRestriction.hasSpeedRestriction).toBe(true);
    expect(modelWithMininmumRestriction.hasSpeedRestriction).toBe(true);
    expect(modelWithRangedRestriction.hasSpeedRestriction).toBe(true);
});


test('#hasSpeedRestriction returns true when a hold with a speed restriction is set', () => {
    const modelWithHold = new WaypointModel('@BOACH');
    const holdParametersMock = {
        inboundHeading: 3.14,
        legLength: '2min',
        speedMaximum: 220,
        turnDirection: 'left'
    };

    modelWithHold.setHoldParameters(
        holdParametersMock
    );

    expect(modelWithHold.hasSpeedRestriction).toBe(true);
});

test('#hasSpeedRestriction returns false when neither a minimum nor maximum speed restriction exists', () => {
    const model = new WaypointModel('BOACH');

    expect(model.hasSpeedRestriction).toBe(false);
});

test('#holdParameters returns undefined when #_isHoldWaypoint is false', () => {
    const model = new WaypointModel('BOACH');
    const result = model.holdParameters;

    expect(typeof result === 'undefined').toBe(true);
});

test('#holdParameters returns object with appropriate contents when #_isHoldWaypoint is true', () => {
    const model = new WaypointModel('@BOACH');
    const expectedResult = {
        inboundHeading: undefined,
        legLength: '1min',
        speedMaximum: undefined,
        timer: INVALID_NUMBER,
        turnDirection: 'right'
    };
    const result = model.holdParameters;

    expect(result).toEqual(expectedResult);
});

test('#isFlyOverWaypoint returns false when #_isFlyOverWaypoint is false', () => {
    const model = new WaypointModel('BOACH');
    const result = model.isFlyOverWaypoint;

    expect(result).toBe(false);
});

test('#isFlyOverWaypoint returns true when #_isFlyOverWaypoint is true', () => {
    const model = new WaypointModel('^BOACH');
    const result = model.isFlyOverWaypoint;

    expect(result).toBe(true);
});

test('#isHoldWaypoint returns false when #_isHoldWaypoint is false', () => {
    const model = new WaypointModel('BOACH');
    const result = model.isHoldWaypoint;

    expect(result).toBe(false);
});

test('#isHoldWaypoint returns true when #_isHoldWaypoint is true', () => {
    const model = new WaypointModel('@BOACH');
    const result = model.isHoldWaypoint;

    expect(result).toBe(true);
});

test('#isVectorWaypoint returns false when #_isVectorWaypoint is false', () => {
    const model = new WaypointModel('BOACH');
    const result = model.isVectorWaypoint;

    expect(result).toBe(false);
});

test('#isVectorWaypoint returns true when #_isVectorWaypoint is true', () => {
    const model = new WaypointModel('#BOACH');
    const result = model.isVectorWaypoint;

    expect(result).toBe(true);
});

test('#name returns value of #_name for fixes with names prefixed with underscore', () => {
    const model = new WaypointModel('_NAPSE068');
    const expectedResult = '_NAPSE068';
    const result = model.name;

    expect(result === expectedResult).toBe(true);
});

test('#name returns value of #_name for fixes with names not prefixed with underscore', () => {
    const model = new WaypointModel('BOACH');
    const expectedResult = 'BOACH';
    const result = model.name;

    expect(result === expectedResult).toBe(true);
});

test('#positionModel returns #_positionModel', () => {
    const waypointModel = new WaypointModel('BOACH');
    const { positionModel } = waypointModel;
    const expectedResult = [35.6782610435946, -115.29470074200118];
    const result = positionModel.gps;

    expect(positionModel instanceof StaticPositionModel).toBe(true);
    expect(result).toEqual(expectedResult);
});

test('#relativePosition returns undefined for vector waypoints', () => {
    const waypointModel = new WaypointModel('#320');
    const result = waypointModel.relativePosition;

    expect(typeof result === 'undefined').toBe(true);
});

test('#relativePosition returns #_positionModel.relativePosition for non-vector waypoints', () => {
    const waypointModel = new WaypointModel('BOACH');
    const expectedResult = [-3.3138243641281715, -46.35714730047791];
    const result = waypointModel.relativePosition;

    expect(result).toEqual(expectedResult);
});

test('#speedMaximum returns expected value when hold with speed restriction is inactive', () => {
    const modelWithHold = new WaypointModel(['BOACH', 'S250-']);
    const holdParametersMock = {
        inboundHeading: 3.14,
        legLength: '2min',
        speedMaximum: 220,
        turnDirection: 'left'
    };

    modelWithHold.setHoldParameters(
        holdParametersMock
    );

    expect(modelWithHold.speedMaximum).toBe(250);
});

test('#speedMaximum returns expected value when hold with speed restriction is active', () => {
    const modelWithHold = new WaypointModel(['@BOACH', 'S250-']);
    const holdParametersMock = {
        inboundHeading: 3.14,
        legLength: '2min',
        speedMaximum: 220,
        turnDirection: 'left'
    };

    modelWithHold.setHoldParameters(
        holdParametersMock
    );

    expect(modelWithHold.speedMaximum).toBe(holdParametersMock.speedMaximum);
});

test('.activateHold() sets #_isHoldWaypoint to true', () => {
    const waypointModel = new WaypointModel('@BOACH');

    waypointModel._isHoldWaypoint = false;

    const result = waypointModel.activateHold();

    expect(typeof result === 'undefined').toBe(true);
    expect(waypointModel._isHoldWaypoint).toBe(true);
});

test('.calculateBearingToWaypoint() calls ._ensureNonVectorWaypointsForThisAndWaypoint()', () => {
    const model = new WaypointModel('BOACH');
    const otherModel = new WaypointModel('FRAWG');
    const ensureNonVectorWaypointsForThisAndWaypointSpy = sinon.spy(model, '_ensureNonVectorWaypointsForThisAndWaypoint');

    model.calculateBearingToWaypoint(otherModel);

    expect(ensureNonVectorWaypointsForThisAndWaypointSpy.calledWithExactly(otherModel)).toBe(true);
});

test('.calculateBearingToWaypoint() returns correct bearing', () => {
    const model = new WaypointModel('BOACH');
    const otherModel = new WaypointModel('FRAWG');
    const expectedResult = 0.5299639748799476;
    const result = model.calculateBearingToWaypoint(otherModel);

    expect(result === expectedResult).toBe(true);
});

test('.calculateDistanceToWaypoint() calls ._ensureNonVectorWaypointsForThisAndWaypoint()', () => {
    const model = new WaypointModel('BOACH');
    const otherModel = new WaypointModel('FRAWG');
    const ensureNonVectorWaypointsForThisAndWaypointSpy = sinon.spy(model, '_ensureNonVectorWaypointsForThisAndWaypoint');

    model.calculateDistanceToWaypoint(otherModel);

    expect(ensureNonVectorWaypointsForThisAndWaypointSpy.calledWithExactly(otherModel)).toBe(true);
});

test('.calculateDistanceToWaypoint() returns correct distance', () => {
    const model = new WaypointModel('BOACH');
    const otherModel = new WaypointModel('FRAWG');
    const expectedResult = 37.98364876057637;
    const result = model.calculateDistanceToWaypoint(otherModel);

    expect(result === expectedResult).toBe(true);
});

test('.deactivateHold() sets #_isHoldWaypoint to false', () => {
    const model = new WaypointModel('BOACH');

    model._isHoldWaypoint = true;
    model.deactivateHold();

    expect(model._isHoldWaypoint).toBe(false);
});

test('.getDisplayName() returns "[RNAV]" for fixes with names prefixed with underscore', () => {
    const model = new WaypointModel('_NAPSE068');
    const expectedResult = '[RNAV]';
    const result = model.getDisplayName();

    expect(result === expectedResult).toBe(true);
});

test('.getDisplayName() returns value of #_name for fixes with names not prefixed with underscore', () => {
    const model = new WaypointModel('BOACH');
    const expectedResult = 'BOACH';
    const result = model.getDisplayName();

    expect(result === expectedResult).toBe(true);
});

test('.getVector() returns undefined if waypoint is not a vector waypoint', () => {
    const model = new WaypointModel('BOACH');
    const result = model.getVector();

    expect(typeof result === 'undefined').toBe(true);
});

test('.getVector() returns correct heading (in radians) for vector waypoints', () => {
    const model = new WaypointModel('#180');
    const expectedResult = Math.PI;
    const result = model.getVector();

    expect(result === expectedResult).toBe(true);
});

test('.hasMaximumAltitudeAtOrBelow() returns false when waypoint does not have max restriction at or below specified value', () => {
    const waypointWithNoRestrictions = new WaypointModel('BOACH');
    const waypointWithMinAltOnly = new WaypointModel(['BOACH', 'A80+']);
    const waypointWithMaxAltAboveConstraint = new WaypointModel(['BOACH', 'A110-']);
    const constraint = 10000;

    expect(waypointWithNoRestrictions.hasMaximumAltitudeAtOrBelow(constraint)).toBe(false);
    expect(waypointWithMinAltOnly.hasMaximumAltitudeAtOrBelow(constraint)).toBe(false);
    expect(waypointWithMaxAltAboveConstraint.hasMaximumAltitudeAtOrBelow(constraint)).toBe(false);
});

test('.hasMaximumAltitudeAtOrBelow() returns true when waypoint has max restriction at or below specified value', () => {
    const waypointWithMaxAltAtConstraint = new WaypointModel(['BOACH', 'A100-']);
    const waypointWithMaxAltBelowConstraint = new WaypointModel(['BOACH', 'A80-']);
    const constraint = 10000;

    expect(waypointWithMaxAltAtConstraint.hasMaximumAltitudeAtOrBelow(constraint)).toBe(true);
    expect(waypointWithMaxAltBelowConstraint.hasMaximumAltitudeAtOrBelow(constraint)).toBe(true);
});

test('.hasMinimumAltitudeAtOrAbove() returns false when waypoint does not have min restriction at or above specified value', () => {
    const waypointWithNoRestrictions = new WaypointModel('BOACH');
    const waypointWithMaxAltOnly = new WaypointModel(['BOACH', 'A110-']);
    const waypointWithMinAltBelowConstraint = new WaypointModel(['BOACH', 'A80+']);
    const constraint = 10000;

    expect(waypointWithNoRestrictions.hasMinimumAltitudeAtOrAbove(constraint)).toBe(false);
    expect(waypointWithMaxAltOnly.hasMinimumAltitudeAtOrAbove(constraint)).toBe(false);
    expect(waypointWithMinAltBelowConstraint.hasMinimumAltitudeAtOrAbove(constraint)).toBe(false);
});

test('.hasMinimumAltitudeAtOrAbove() returns true when waypoint has min restriction at or above specified value', () => {
    const waypointWithMinAltAtConstraint = new WaypointModel(['BOACH', 'A100+']);
    const waypointWithMinAltAboveConstraint = new WaypointModel(['BOACH', 'A110+']);
    const constraint = 10000;

    expect(waypointWithMinAltAtConstraint.hasMinimumAltitudeAtOrAbove(constraint)).toBe(true);
    expect(waypointWithMinAltAboveConstraint.hasMinimumAltitudeAtOrAbove(constraint)).toBe(true);
});

test('.setAltitude() calls .setAltitudeMinimum() and .setAltitudeMaximum()', () => {
    const model = new WaypointModel('BOACH');
    const altitudeMock = 5000;
    const setAltitudeMinimumStub = sinon.stub(model, 'setAltitudeMinimum');
    const setAltitudeMaximumStub = sinon.stub(model, 'setAltitudeMaximum');
    const result = model.setAltitude(altitudeMock);

    expect(typeof result === 'undefined').toBe(true);
    expect(setAltitudeMinimumStub.calledOnce).toBe(true);
    expect(setAltitudeMaximumStub.calledOnce).toBe(true);
});

test('.setAltitudeMaximum() returns early if specified altitude is not a number', () => {
    const model = new WaypointModel('BOACH');
    const originalAltitudeMaximimValueMock = 7000;
    const nextAltitudeMock = 'chipz';
    model.altitudeMaximum = originalAltitudeMaximimValueMock;
    const result = model.setAltitudeMaximum(nextAltitudeMock);

    expect(typeof result === 'undefined').toBe(true);
    expect(model.altitudeMaximum === originalAltitudeMaximimValueMock).toBe(true);
});

test('.setAltitudeMaximum() returns early if specified altitude is an "unreasonable" value', () => {
    const model = new WaypointModel('BOACH');
    const originalAltitudeMaximimValueMock = 7000;
    const nextAltitudeMock = 99999;
    model.altitudeMaximum = originalAltitudeMaximimValueMock;
    const result = model.setAltitudeMaximum(nextAltitudeMock);

    expect(typeof result === 'undefined').toBe(true);
    expect(model.altitudeMaximum === originalAltitudeMaximimValueMock).toBe(true);
});

test('.setAltitudeMaximum() sets #altitudeMaximum to the specified altitude', () => {
    const model = new WaypointModel('BOACH');
    const originalAltitudeMaximimValueMock = 7000;
    const nextAltitudeMock = 5500;
    model.altitudeMaximum = originalAltitudeMaximimValueMock;
    const result = model.setAltitudeMaximum(nextAltitudeMock);

    expect(typeof result === 'undefined').toBe(true);
    expect(model.altitudeMaximum === nextAltitudeMock).toBe(true);
});

test('.setAltitudeMinimum() returns early if specified altitude is not a number', () => {
    const model = new WaypointModel('BOACH');
    const originalAltitudeMinimimValueMock = 7000;
    const nextAltitudeMock = 'chipz';
    model.altitudeMinimum = originalAltitudeMinimimValueMock;
    const result = model.setAltitudeMinimum(nextAltitudeMock);

    expect(typeof result === 'undefined').toBe(true);
    expect(model.altitudeMinimum === originalAltitudeMinimimValueMock).toBe(true);
});

test('.setAltitudeMinimum() returns early if specified altitude is an "unreasonable" value', () => {
    const model = new WaypointModel('BOACH');
    const originalAltitudeMinimimValueMock = 7000;
    const nextAltitudeMock = 99999;
    model.altitudeMinimum = originalAltitudeMinimimValueMock;
    const result = model.setAltitudeMinimum(nextAltitudeMock);

    expect(typeof result === 'undefined').toBe(true);
    expect(model.altitudeMinimum === originalAltitudeMinimimValueMock).toBe(true);
});

test('.setAltitudeMinimum() sets #altitudeMinimum to the specified altitude', () => {
    const model = new WaypointModel('BOACH');
    const originalAltitudeMinimimValueMock = 7000;
    const nextAltitudeMock = 5500;
    model.altitudeMinimum = originalAltitudeMinimimValueMock;
    const result = model.setAltitudeMinimum(nextAltitudeMock);

    expect(typeof result === 'undefined').toBe(true);
    expect(model.altitudeMinimum === nextAltitudeMock).toBe(true);
});

test('.setHoldParameters() sets #_holdParameters to default values when no argument is provided', () => {
    const model = new WaypointModel('BOACH');

    model.setHoldParameters();

    expect(model._holdParameters).toEqual(DEFAULT_HOLD_PARAMETERS);
});

test('.setHoldParameters() sets #_holdParameters according to provided parameters', () => {
    const model = new WaypointModel('BOACH');
    const holdParametersMock = {
        inboundHeading: 3.14,
        legLength: '2min',
        speedMaximum: 220,
        turnDirection: 'left'
    };
    const expectedResult = {
        inboundHeading: 3.14,
        legLength: '2min',
        speedMaximum: 220,
        timer: -1,
        turnDirection: 'left'
    };

    const result = model.setHoldParameters(holdParametersMock);

    expect(result).toEqual(expectedResult);
    expect(model._holdParameters).toEqual(expectedResult);
});

test('.resetHoldTimer() sets #_holdParameters.timer back to the default value', () => {
    const model = new WaypointModel('BOACH');

    model._holdParameters.timer = 515;

    const result = model.resetHoldTimer();

    expect(typeof result === 'undefined').toBe(true);
    expect(model._holdParameters.timer === DEFAULT_HOLD_PARAMETERS.timer).toBe(true);
});

test('.setHoldParametersAndActivateHold() calls .setHoldParameters() and .activateHold()', () => {
    const model = new WaypointModel('BOACH');
    const setHoldParametersSpy = sinon.spy(model, 'setHoldParameters');
    const activateHoldSpy = sinon.spy(model, 'activateHold');
    const holdParametersMock = {
        inboundHeading: 3.14,
        legLength: '2min',
        turnDirection: 'left'
    };
    const result = model.setHoldParametersAndActivateHold(holdParametersMock);

    expect(typeof result).not.toBe('undefined');
    expect(setHoldParametersSpy.calledWith(holdParametersMock)).toBe(true);
    expect(activateHoldSpy.calledWithExactly()).toBe(true);
});

test('.setHoldTimer() throws when specified timer value is not a number', () => {
    const model = new WaypointModel('BOACH');

    expect(() => model.setHoldTimer()).toThrow();
    expect(() => model.setHoldTimer('')).toThrow();
    expect(() => model.setHoldTimer([])).toThrow();
    expect(() => model.setHoldTimer({})).toThrow();
});

test('.setHoldTimer() sets #_holdParameters.timer to the specified value', () => {
    const model = new WaypointModel('BOACH');
    const timerValueMock = 881.1234;
    const result = model.setHoldTimer(timerValueMock);

    expect(typeof result === 'undefined').toBe(true);
    expect(model._holdParameters.timer === timerValueMock).toBe(true);
});

test('._applyAltitudeRestriction() sets #altitudeMinimum to specified value (x100) when restriction has "+" character', () => {
    const model = new WaypointModel('BOACH');
    const restrictionMock = 'A65+';
    const result = model._applyAltitudeRestriction(restrictionMock);

    expect(typeof result === 'undefined').toBe(true);
    expect(model.altitudeMaximum === -1).toBe(true);
    expect(model.altitudeMinimum === 6500).toBe(true);
});

test('._applyAltitudeRestriction() sets #altitudeMaximum to specified value (x100) when restriction has "-" character', () => {
    const model = new WaypointModel('BOACH');
    const restrictionMock = 'A65-';
    const result = model._applyAltitudeRestriction(restrictionMock);

    expect(typeof result === 'undefined').toBe(true);
    expect(model.altitudeMaximum === 6500).toBe(true);
    expect(model.altitudeMinimum === -1).toBe(true);
});

test('._applyAltitudeRestriction() sets #altitudeMinimum and #altitudeMaximum to specified value (x100) when restriction has neither "+" or "-" characters', () => {
    const model = new WaypointModel('BOACH');
    const restrictionMock = 'A65';
    const result = model._applyAltitudeRestriction(restrictionMock);

    expect(typeof result === 'undefined').toBe(true);
    expect(model.altitudeMaximum === 6500).toBe(true);
    expect(model.altitudeMinimum === 6500).toBe(true);
});

test('._applyRestrictions() throws when an invalid restriction-type-qualifier is used to prefix the value', () => {
    const model = new WaypointModel('BOACH');

    expect(() => model._applyRestrictions('Y80')).toThrow();
    expect(() => model._applyRestrictions('A120|Y80')).toThrow();
});

test('._applyRestrictions() returns early when specified restriction is an empty string', () => {
    const model = new WaypointModel('BOACH');
    const applyAltitudeRestrictionSpy = sinon.spy(model, '_applyAltitudeRestriction');
    const applySpeedRestrictionSpy = sinon.spy(model, '_applySpeedRestriction');
    const result = model._applyRestrictions('');

    expect(typeof result === 'undefined').toBe(true);
    expect(applyAltitudeRestrictionSpy.notCalled).toBe(true);
    expect(applySpeedRestrictionSpy.notCalled).toBe(true);
});

test('._applyRestrictions() calls ._applyAltitudeRestriction() and ._applySpeedRestriction() appropriately', () => {
    const model = new WaypointModel('BOACH');
    const applyAltitudeRestrictionSpy = sinon.spy(model, '_applyAltitudeRestriction');
    const applySpeedRestrictionSpy = sinon.spy(model, '_applySpeedRestriction');
    const result = model._applyRestrictions('A125|S210');

    expect(typeof result === 'undefined').toBe(true);
    expect(applyAltitudeRestrictionSpy.calledWithExactly('A125')).toBe(true);
    expect(applySpeedRestrictionSpy.calledWithExactly('S210')).toBe(true);
});

test('._applySpeedRestriction() sets #speedMinimum to specified value when restriction has "+" character', () => {
    const model = new WaypointModel('BOACH');
    const restrictionMock = 'S210+';
    const result = model._applySpeedRestriction(restrictionMock);

    expect(typeof result === 'undefined').toBe(true);
    expect(model.speedMaximum === -1).toBe(true);
    expect(model.speedMinimum === 210).toBe(true);
});

test('._applySpeedRestriction() sets #speedMaximum to specified value when restriction has "-" character', () => {
    const model = new WaypointModel('BOACH');
    const restrictionMock = 'S210-';
    const result = model._applySpeedRestriction(restrictionMock);

    expect(typeof result === 'undefined').toBe(true);
    expect(model.speedMaximum === 210).toBe(true);
    expect(model.speedMinimum === -1).toBe(true);
});

test('._applySpeedRestriction() sets #speedMinimum and #speedMaximum to specified value when restriction has neither "+" or "-" characters', () => {
    const model = new WaypointModel('BOACH');
    const restrictionMock = 'S210';
    const result = model._applySpeedRestriction(restrictionMock);

    expect(typeof result === 'undefined').toBe(true);
    expect(model.speedMaximum === 210).toBe(true);
    expect(model.speedMinimum === 210).toBe(true);
});

test('._ensureNonVectorWaypointsForThisAndWaypoint() throws if parameter is not a WaypointModel', () => {
    const model = new WaypointModel('BOACH');
    const nonWaypoint = 'BOACH';

    expect(() => model._ensureNonVectorWaypointsForThisAndWaypoint(nonWaypoint)).toThrow();
});

test('._ensureNonVectorWaypointsForThisAndWaypoint() throws if this is a vector waypoint', () => {
    const model = new WaypointModel('#320');
    const otherModel = new WaypointModel('BOACH');

    expect(() => model._ensureNonVectorWaypointsForThisAndWaypoint(otherModel)).toThrow();
});

test('._ensureNonVectorWaypointsForThisAndWaypoint() throws if parameter is a vector waypoint', () => {
    const model = new WaypointModel('BOACH');
    const otherModel = new WaypointModel('#320');

    expect(() => model._ensureNonVectorWaypointsForThisAndWaypoint(otherModel)).toThrow();
});

test('._ensureNonVectorWaypointsForThisAndWaypoint() does not throw when both are valid, non-vector waypoints', () => {
    const model = new WaypointModel('BOACH');
    const otherModel = new WaypointModel('FRAWG');

    expect(() => model._ensureNonVectorWaypointsForThisAndWaypoint(otherModel)).not.toThrow();
});

test('._initializePosition() returns early when this is a vector waypoint', () => {
    const model = new WaypointModel('#320');
    const result = model._initializePosition();

    expect(typeof result === 'undefined').toBe(true);
    expect(!model._positionModel).toBe(true);
});

test('._initializePosition() throws when #_name does not have a corresponding fix definition in the FixCollection', () => {
    const model = new WaypointModel('BOACH');

    model._name = 'nonsense';

    expect(() => model._initializePosition()).toThrow();
});

test('._initializePosition() sets #_positionModel to the position corresponding with the #_name waypoint', () => {
    const model = new WaypointModel('BIKKR');

    model._name = 'BOACH';

    const result = model._initializePosition();
    const expectedGpsCoordinates = [35.67826104359460, -115.29470074200118];
    const resultingGpsCoordinates = model.positionModel.gps;

    expect(typeof result === 'undefined').toBe(true);
    expect(resultingGpsCoordinates).toEqual(expectedGpsCoordinates);
});
