import { test, expect, vi } from 'vitest';
import sinon from 'sinon';
import AircraftModel from '../../src/assets/scripts/client/aircraft/AircraftModel';
import UiController from '../../src/assets/scripts/client/ui/UiController';
import GameController, { GAME_EVENTS } from '../../src/assets/scripts/client/game/GameController';
import ScoreController from '../../src/assets/scripts/client/game/ScoreController';
import { ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK } from '../aircraft/_mocks/aircraftMocks';

let sandbox; // using the sinon sandbox ensures stubs are restored after each test

/* eslint-disable no-unused-vars, no-undef */
beforeEach(() => {
    sandbox = sinon.createSandbox();
});

afterEach(() => {
    sandbox.restore();
});
/* eslint-enable no-unused-vars, no-undef */

test('._penalizeLocalizerInterceptAltitude() records an event and notifies the user of their error when above the glideslope', () => {
    const scoreController = new ScoreController();
    const aircraftModel = new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK);
    const uiControllerUiLogStub = sandbox.stub(UiController, 'ui_log');
    const gameControllerRecordEventStub = sandbox.stub(GameController, 'events_recordNew');
    const expectedLogMessage = `${aircraftModel.getCallsign()} intercepted localizer above glideslope`;

    sandbox.stub(aircraftModel, 'isAboveGlidepath').returns(true);
    scoreController._penalizeLocalizerInterceptAltitude(aircraftModel);

    expect(uiControllerUiLogStub.calledWithExactly(expectedLogMessage, true)).toBe(true);
    expect(gameControllerRecordEventStub.calledWithExactly(GAME_EVENTS.LOCALIZER_INTERCEPT_ABOVE_GLIDESLOPE)).toBe(true);

    uiControllerUiLogStub.restore();
    gameControllerRecordEventStub.restore();
});

test('._penalizeLocalizerInterceptAltitude() does not record an event when at or below glideslope', () => {
    const scoreController = new ScoreController();
    const aircraftModel = new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK);
    const uiControllerUiLogSpy = sandbox.spy(UiController, 'ui_log');
    const gameControllerRecordEventSpy = sandbox.spy(GameController, 'events_recordNew');

    sandbox.stub(aircraftModel, 'isAboveGlidepath').returns(false);
    scoreController._penalizeLocalizerInterceptAltitude(aircraftModel);

    expect(uiControllerUiLogSpy.notCalled).toBe(true);
    expect(gameControllerRecordEventSpy.notCalled).toBe(true);

    uiControllerUiLogSpy.restore();
    gameControllerRecordEventSpy.restore();
});

test('._penalizeLocalizerInterceptAngle() records an event and notifies the user of their error', () => {
    const scoreController = new ScoreController();
    const aircraftModel = new AircraftModel(ARRIVAL_AIRCRAFT_INIT_PROPS_MOCK);
    const uiControllerUiLogStub = sandbox.stub(UiController, 'ui_log');
    const gameControllerRecordEventStub = sandbox.stub(GameController, 'events_recordNew');
    const expectedLogMessage = `${aircraftModel.getCallsign()} approach course intercept angle was greater than 30 degrees`;
    const result = scoreController._penalizeLocalizerInterceptAngle(aircraftModel);

    expect(typeof result === 'undefined').toBe(true);
    expect(uiControllerUiLogStub.calledWithExactly(expectedLogMessage, true)).toBe(true);
    expect(gameControllerRecordEventStub.calledWithExactly(GAME_EVENTS.ILLEGAL_APPROACH_CLEARANCE)).toBe(true);
});
