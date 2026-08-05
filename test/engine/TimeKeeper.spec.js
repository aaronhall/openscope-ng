import { test, expect, vi } from 'vitest';
import TimeKeeper from '../../src/assets/scripts/client/engine/TimeKeeper';

afterEach(() => {
    TimeKeeper.reset();
});

test('throws when attempting to instantiate', (t) => {
    expect(() => new TimeKeeper()).toThrow();
});

test('#deltaTime is the product of #_frameDeltaTime and #_simulationRate', (t) => {
    TimeKeeper._frameDeltaTime = 33;
    TimeKeeper._simulationRate = 1;

    expect(TimeKeeper.deltaTime === 33).toBe(true);
});

test('#deltaTime returns a max value of 100', (t) => {
    TimeKeeper._frameDeltaTime = 33;
    TimeKeeper._simulationRate = 10;

    expect(TimeKeeper.deltaTime === 100).toBe(true);
});

test.skip('#accumulatedDeltaTime is the sum of each deltaTime value from instantiation to now', (t) => {
    const deltaValues = [];

    deltaValues.push(TimeKeeper.deltaTime);

    TimeKeeper.update();
    deltaValues.push(TimeKeeper.deltaTime);

    TimeKeeper.update();
    deltaValues.push(TimeKeeper.deltaTime);

    TimeKeeper.update();
    deltaValues.push(TimeKeeper.deltaTime);

    const sum = deltaValues.reduce((accumulator, item) => accumulator + item, 0);

    expect(sum === TimeKeeper.accumulatedDeltaTime).toBe(true);
});

test.skip('#accumulatedDeltaTime is the sum of each deltaTime value from instantiation to now offset by timewarp', (t) => {
    const deltaValues = [];

    deltaValues.push(TimeKeeper.deltaTime);

    TimeKeeper.update();
    deltaValues.push(TimeKeeper.deltaTime);

    TimeKeeper.update();
    deltaValues.push(TimeKeeper.deltaTime);

    TimeKeeper._simulationRate = 5;

    TimeKeeper.update();
    deltaValues.push(TimeKeeper.deltaTime);

    const sum = deltaValues.reduce((accumulator, item) => accumulator + item, 0);

    expect(sum === TimeKeeper.accumulatedDeltaTime).toBe(true);
});

test('.getDeltaTimeForGameStateAndTimewarp() returns 0 when #isPaused is true', (t) => {
    const result = TimeKeeper.getDeltaTimeForGameStateAndTimewarp(true);

    expect(result === 0).toBe(true);
});

test('.getDeltaTimeForGameStateAndTimewarp() returns 0 when #deltaTime > 1 and #timewarp is 1', (t) => {
    TimeKeeper._frameDeltaTime = 2;
    TimeKeeper._simulationRate = 1;

    const result = TimeKeeper.getDeltaTimeForGameStateAndTimewarp(false);

    expect(result === 0).toBe(true);
});

test('.getDeltaTimeForGameStateAndTimewarp() returns #deltaTime when if conditions are not met', (t) => {
    const result = TimeKeeper.getDeltaTimeForGameStateAndTimewarp(false);

    expect(result === TimeKeeper.deltaTime).toBe(true);
});

test('.saveDeltaTimeBeforeFutureTrackCalculation() ', (t) => {
    TimeKeeper._frameDeltaTime = 3;

    TimeKeeper.saveDeltaTimeBeforeFutureTrackCalculation();

    expect(TimeKeeper._futureTrackDeltaTimeCache === 3).toBe(true);
    expect(TimeKeeper._frameDeltaTime === 5).toBe(true);
});

test('.restoreDeltaTimeAfterFutureTrackCalculation() ', (t) => {
    TimeKeeper._frameDeltaTime = 5;
    TimeKeeper._futureTrackDeltaTimeCache = 3;

    TimeKeeper.restoreDeltaTimeAfterFutureTrackCalculation();

    expect(TimeKeeper._futureTrackDeltaTimeCache === -1).toBe(true);
    expect(TimeKeeper._frameDeltaTime === 3).toBe(true);
});

test('.setPause() does not update #_isPaused when nextPause is the same value', (t) => {
    TimeKeeper._isPaused = false;
    TimeKeeper.setPause(false);

    expect(TimeKeeper._isPaused).toBe(false);
});

test('.setPause() updates #_isPaused when nextPause is a different value', (t) => {
    TimeKeeper._isPaused = false;
    TimeKeeper.setPause(true);

    expect(TimeKeeper._isPaused).toBe(true);
});

test('.update() increments #_elapsedFrameCount by 1', (t) => {
    expect(TimeKeeper._elapsedFrameCount === 0).toBe(true);

    TimeKeeper.update();

    expect(TimeKeeper._elapsedFrameCount === 1).toBe(true);
});

test('.update() resets #_frameStartTimestamp to #currentTime when elapsed time is > frameDelay', (t) => {
    TimeKeeper._frameStartTimestamp = 10;
    TimeKeeper.update();

    expect(TimeKeeper._frameStartTimestamp === TimeKeeper._previousFrameTimestamp).toBe(true);
});

test('.update() recalculates the #_frameStep value based on the current #_simulationRate value', (t) => {
    TimeKeeper._simulationRate = 1;
    TimeKeeper.update();

    expect(TimeKeeper._frameStep === 30).toBe(true);

    TimeKeeper._simulationRate = 2;
    TimeKeeper.update();

    expect(TimeKeeper._frameStep === 27).toBe(true);

    TimeKeeper._simulationRate = 5;
    TimeKeeper.update();

    expect(TimeKeeper._frameStep === 17).toBe(true);

    TimeKeeper._simulationRate = 25;
    TimeKeeper.update();

    expect(TimeKeeper._frameStep === 1).toBe(true);

    TimeKeeper._simulationRate = 50;
    TimeKeeper.update();

    expect(TimeKeeper._frameStep === 1).toBe(true);
});

test('.updateTimescale() only accepts positive numbers', (t) => {
    TimeKeeper._simulationRate = 1;

    TimeKeeper.updateSimulationRate(-3);

    expect(TimeKeeper._simulationRate === 1).toBe(true);
});

test('.updateTimescale() updates #timescale value', (t) => {
    TimeKeeper._simulationRate = 1;

    TimeKeeper.updateSimulationRate(3);

    expect(TimeKeeper._simulationRate === 3).toBe(true);
});

test('._isReturningFromPauseAndNotFutureTrack() returns false when #_frameDeltaTime is > than 1 and #_simulationRate is 1', (t) => {
    TimeKeeper._frameDeltaTime = 0.5;
    TimeKeeper._simulationRate = 1;
    TimeKeeper._futureTrackDeltaTimeCache = -1;

    expect(TimeKeeper._isReturningFromPauseAndNotFutureTrack()).toBe(false);
});

test('._isReturningFromPauseAndNotFutureTrack() returns false #_simulationRate is not === 1', (t) => {
    TimeKeeper._frameDeltaTime = 0.5;
    TimeKeeper._simulationRate = 2;
    TimeKeeper._futureTrackDeltaTimeCache = -1;

    expect(TimeKeeper._isReturningFromPauseAndNotFutureTrack()).toBe(false);
});

test('._isReturningFromPauseAndNotFutureTrack() returns false #_futureTrackDeltaTimeCache is not === -1', (t) => {
    TimeKeeper._frameDeltaTime = 0.5;
    TimeKeeper._simulationRate = 1;
    TimeKeeper._futureTrackDeltaTimeCache = 5;

    expect(TimeKeeper._isReturningFromPauseAndNotFutureTrack()).toBe(false);
});

test('._isReturningFromPauseAndNotFutureTrack() returns true only when all three conditions are met', (t) => {
    TimeKeeper._frameDeltaTime = 2;
    TimeKeeper._simulationRate = 1;
    TimeKeeper._futureTrackDeltaTimeCache = -1;

    expect(TimeKeeper._isReturningFromPauseAndNotFutureTrack()).toBe(true);
});
