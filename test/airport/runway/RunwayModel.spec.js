import { test, expect, vi } from 'vitest';

import RunwayModel from '../../../src/assets/scripts/client/airport/runway/RunwayModel';
import { airportPositionFixtureKLAS } from '../../fixtures/airportFixtures';
import { AIRPORT_JSON_KLAS_MOCK } from '../_mocks/airportJsonMock';

// taken from KLAS
// "runways":[
//   {
//     "name": ["07L", "25R"],
//     "end": [["N36d4m34.82", "W115d10m16.98", "2179ft"], ["N36d4m35.05", "W115d7m15.93", "2033ft"]],
//     "delay": [5, 5],
//     "ils": [false, true]
//   }
//   // ...
// ]

// const airportMock = {
//     elevation: 2181
// }

const runway07L25R = AIRPORT_JSON_KLAS_MOCK.runways[0];

test('does not throw when instantiated with vaild parameters', () => {
    expect(() => new RunwayModel(runway07L25R, 0, airportPositionFixtureKLAS)).not.toThrow();
});

test('#gps returns the gps coordinates for a runway', () => {
    const expectedResult = [36.07633888888889, -115.17138333333334];
    const model = new RunwayModel(runway07L25R, 0, airportPositionFixtureKLAS);

    expect(model.gps).toEqual(expectedResult);
});

test('#elevation returns #_positionModel.elevation if it exists', () => {
    const model = new RunwayModel(runway07L25R, 0, airportPositionFixtureKLAS);

    expect(model.elevation === model._positionModel.elevation).toBe(true);
});

test('#elevation returns #airportPositionModel.elevation if #_positionModel.elevation does not exist', () => {
    const model = new RunwayModel(runway07L25R, 0, airportPositionFixtureKLAS);
    model._positionModel.elevation = null;

    expect(model.elevation === model.airportPositionModel.elevation).toBe(true);
});

test('#oppositeAngle returns opposite of runway heading', () => {
    const runwayModel = new RunwayModel(runway07L25R, 0, airportPositionFixtureKLAS);
    const result = runwayModel.oppositeAngle;
    const expectedResult = 4.502864578080533;

    expect(result === expectedResult).toBe(true);
});

test('.addAircraftToQueue() adds an aircraft#id to the queue', () => {
    const aircraftIdMock = 'aircraft-221';
    const model = new RunwayModel(runway07L25R, 0, airportPositionFixtureKLAS);

    model.addAircraftToQueue(aircraftIdMock);

    expect(model.queue.length === 1).toBe(true);
    expect(model.queue[0] === aircraftIdMock).toBe(true);
});

test('.calculateCrosswindAngleForRunway() returns the crosswind angle for a given runway based on a given windAngle', () => {
    const windAngleMock = 3.839724354387525;
    const model = new RunwayModel(runway07L25R, 0, airportPositionFixtureKLAS);
    const expectedResult = 2.478452429896785;
    const result = model.calculateCrosswindAngleForRunway(windAngleMock);

    expect(result === expectedResult).toBe(true);
});

test('.getGlideslopeAltitude() returns glideslope altitude at the specified distance', () => {
    const model = new RunwayModel(runway07L25R, 0, airportPositionFixtureKLAS);
    const distanceNm = 10;
    const expectedResult = 1719.4153308084387 + model.positionModel.elevation;
    const result = model.getGlideslopeAltitude(distanceNm);

    expect(result === expectedResult).toBe(true);
});

test('.getGlideslopeAltitudeAtFinalApproachFix() returns glideslope altitude at the final approach fix', () => {
    const model = new RunwayModel(runway07L25R, 0, airportPositionFixtureKLAS);
    const expectedResult = 3771.178596328614;
    const result = model.getGlideslopeAltitudeAtFinalApproachFix();

    expect(result === expectedResult).toBe(true);
});

test('.getMinimumGlideslopeInterceptAltitude() returns glideslope altitude at the final approach fix', () => {
    const model = new RunwayModel(runway07L25R, 0, airportPositionFixtureKLAS);
    const expectedResult = 3800;
    const result = model.getMinimumGlideslopeInterceptAltitude();

    expect(result === expectedResult).toBe(true);
});

test('.isAircraftInQueue() returns true when an aircraftId is in the queue', () => {
    const aircraftIdMock = 'aircraft-221';
    const model = new RunwayModel(runway07L25R, 0, airportPositionFixtureKLAS);
    model.queue = [aircraftIdMock];

    expect(model.isAircraftInQueue(aircraftIdMock)).toBe(true);
    expect(model.isAircraftInQueue('threeve')).toBe(false);
});

test('.isAircraftNextInQueue() returns true only when an aircraftId is at index 0', () => {
    const aircraftIdMock = 'aircraft-221';
    const model = new RunwayModel(runway07L25R, 0, airportPositionFixtureKLAS);
    model.queue = [aircraftIdMock, 'threeve'];

    expect(model.isAircraftNextInQueue(aircraftIdMock)).toBe(true);
    expect(model.isAircraftNextInQueue('threeve')).toBe(false);
});

// need an aircraftModel to be able to test
test.todo('.isOnApproachCourse()');

// need an aircraftModel to be able to test
test.todo('.isOnCorrectApproachGroundTrack()');

test('.removeAircraftFromQueue() removes an aircraft#id from the queue', () => {
    const aircraftIdMock = 'aircraft-221';
    const model = new RunwayModel(runway07L25R, 0, airportPositionFixtureKLAS);
    model.queue = ['1', '2', aircraftIdMock, '4'];

    model.removeAircraftFromQueue(aircraftIdMock);

    expect(model.queue.length === 3).toBe(true);
    expect(model.queue.indexOf(aircraftIdMock) === -1).toBe(true);
});

test('.resetQueue() removes all aircraft from the queue and clears #lastDepartedAircraftModel', () => {
    const model = new RunwayModel(runway07L25R, 0, airportPositionFixtureKLAS);
    model.queue = ['aircraft1', 'aircraft2', 'aircraft3'];
    model.lastDepartedAircraftModel = { callsign: 'aircraft2' };

    model.resetQueue();

    expect(model.queue.length === 0).toBe(true);
    expect(model.lastDepartedAircraftModel === null).toBe(true);
});
