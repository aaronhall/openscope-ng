import { test, expect, vi } from 'vitest';
import sinon from 'sinon';
import CanvasStageModel from '../../src/assets/scripts/client/canvas/CanvasStageModel';
import { SCALE } from '../../src/assets/scripts/client/constants/canvasConstants';

beforeEach(() => {
    CanvasStageModel._init();
});

afterEach(() => {
    CanvasStageModel.reset();
});

test('throws when called to instantiate', () => {
    expect(() => new CanvasStageModel()).toThrow();
});

test('.translatePixelsToKilometers() divides pixels by scale', () => {
    const expectedResult = 12.5;
    const pixelValueMock = 100;
    const result = CanvasStageModel.translatePixelsToKilometers(pixelValueMock);

    expect(result === expectedResult).toBe(true);
});

test('.calculateCanvasPositionFromPagePosition() returns an [x, y] array with precise canvas coordinate values', () => {
    const pagePositionMock = [533.6571116862411, 529.6559736409592];
    const expectedCanvasPosition = [213.65711168624114, -289.65597364095925];
    const canvasPosition = CanvasStageModel.calculateCanvasPositionFromPagePosition(
        ...pagePositionMock
    );

    expect(canvasPosition).toEqual(expectedCanvasPosition);
});

test('.calculateRelativePositionFromCanvasPosition() returns an [x, y] array of kilometers offset from the airport', () => {
    const canvasPositionMock = [533.6571116862411, -529.6559736409592];
    const expectedResult = [66.70713896078014, -66.2069967051199];
    const result = CanvasStageModel.calculateRelativePositionFromCanvasPosition(
        ...canvasPositionMock
    );

    expect(result).toEqual(expectedResult);
});

test('.calculatePreciseCanvasPositionFromRelativePosition() returns an [x, y] array with precise canvas coordinate values', () => {
    const expectedResult = [533.6571116862411, -529.6559736409592];
    const positionMock = [66.70713896078014, 66.2069967051199];
    const result =
        CanvasStageModel.calculatePreciseCanvasPositionFromRelativePosition(positionMock);

    expect(result).toEqual(expectedResult);
});

test('.calculateRoundedCanvasPositionFromRelativePosition() returns an [x, y] array and rounded canvas coordinate values', () => {
    const expectedResult = [534, -530];
    const positionMock = [66.70713896078014, 66.2069967051199];
    const result =
        CanvasStageModel.calculateRoundedCanvasPositionFromRelativePosition(positionMock);

    expect(result).toEqual(expectedResult);
});

test('._translateKilometersToPixels() multiplies kilometers by scale', () => {
    const expectedResult = 100;
    const kilometerValueMock = 12.5;
    const result = CanvasStageModel._translateKilometersToPixels(kilometerValueMock);

    expect(result === expectedResult).toBe(true);
});

test('.updatePan() calls _eventBus.trigger()', () => {
    const updatePanSpy = sinon.spy(CanvasStageModel, 'updatePan');

    CanvasStageModel.updatePan(1, 1);

    expect(updatePanSpy.calledOnce).toBe(true);
});

test('.zoomOut() increases #_scale by SCALE.CHANGE_FACTOR', () => {
    const previousScale = CanvasStageModel._scale;

    CanvasStageModel.zoomOut();

    const result = CanvasStageModel._scale / previousScale;

    expect(result === SCALE.CHANGE_FACTOR).toBe(true);
});

test('.zoomOut() resets #_scale to #_scaleMin when #_scale is < #scaleMin', () => {
    CanvasStageModel._scale = 0.5;
    CanvasStageModel.zoomOut();

    expect(CanvasStageModel._scale === CanvasStageModel._scaleMin).toBe(true);
});

test('.zoomOut() calls ._storeZoomLevel()', () => {
    const _storeZoomLevelSpy = sinon.spy(CanvasStageModel, '_storeZoomLevel');

    CanvasStageModel.zoomOut();

    expect(_storeZoomLevelSpy.calledOnce).toBe(true);

    _storeZoomLevelSpy.restore();
});

test('.zoomOut() calls ._eventBus.trigger()', () => {
    const _eventBusTrigger = sinon.spy(CanvasStageModel._eventBus, 'trigger');

    CanvasStageModel.zoomOut();

    expect(_eventBusTrigger.callCount === 2).toBe(true);

    _eventBusTrigger.restore();
});

test('.zoomIn() increases #_scale by SCALE.CHANGE_FACTOR', () => {
    CanvasStageModel._scale = 50;
    const previousScale = CanvasStageModel._scale;

    CanvasStageModel.zoomIn();

    const result = previousScale / CanvasStageModel._scale;

    expect(result === SCALE.CHANGE_FACTOR).toBe(true);
});

test('.zoomIn() resets #_scale to #_scaleMax when #_scale is > #scaleMax', () => {
    CanvasStageModel._scale = 999999;
    CanvasStageModel.zoomIn();

    expect(CanvasStageModel._scale === CanvasStageModel._scaleMax).toBe(true);
});

test('.zoomIn() calls ._storeZoomLevel()', () => {
    const _storeZoomLevelSpy = sinon.spy(CanvasStageModel, '_storeZoomLevel');

    CanvasStageModel.zoomIn();

    expect(_storeZoomLevelSpy.calledOnce).toBe(true);

    _storeZoomLevelSpy.restore();
});

test('.zoomIn() calls ._eventBus.trigger()', () => {
    const _eventBusTrigger = sinon.spy(CanvasStageModel._eventBus, 'trigger');

    CanvasStageModel.zoomIn();

    expect(_eventBusTrigger.callCount === 2).toBe(true);

    _eventBusTrigger.restore();
});
