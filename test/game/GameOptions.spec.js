import { test, expect, vi } from 'vitest';
import sinon from 'sinon';
import _isNil from 'lodash/isNil';
import GameOptions from '../../src/assets/scripts/client/game/GameOptions';
import EventBus from '../../src/assets/scripts/client/lib/EventBus';
import { GAME_OPTION_LIST_MOCK } from './_mocks/gameOptionMocks';

test('does not throw on instantiation', () => {
    expect(() => new GameOptions()).not.toThrow();
});

test('sets #_options on instantiation', () => {
    const expectedResult = [
        'theme',
        'towerController',
        'controlMethod',
        'drawIlsDistanceSeparator',
        'ptlLengths',
        'drawProjectedPaths',
        'softCeiling',
        'mouseClickDrag',
        'rangeRings',
        'measureToolPath',
    ];

    const model = new GameOptions();
    const result = Object.keys(model._options);

    expect(result).toEqual(expectedResult);
});

test('.addGameOptions() calls .addOption() for each available option', () => {
    const model = new GameOptions();
    const expectedResult = Object.keys(model._options).length;
    const addOptionSpy = sinon.spy(model, 'addOption');

    model.addGameOptions();

    expect(addOptionSpy.callCount === expectedResult).toBe(true);
});

test('.addOption() calls .buildStorageName()', () => {
    const storageNameMock = 'threeve';
    const model = new GameOptions();
    const buildStorageNameSpy = sinon.spy(model, 'buildStorageName');

    model.buildStorageName(storageNameMock);

    expect(buildStorageNameSpy.calledWithExactly(storageNameMock)).toBe(true);
});

test('.addOption() adds option to #_options and creates new property from option.name', () => {
    const optionKeyMock = 'threeve';
    const optionValueMock = '$texas';
    const model = new GameOptions();
    model._options = {};
    model.addOption(GAME_OPTION_LIST_MOCK[0]);

    expect(_isNil(model._options[optionKeyMock])).toBe(false);
    expect(_isNil(model[optionKeyMock])).toBe(false);
    expect(model[optionKeyMock] === optionValueMock).toBe(true);
});

test('.addOption() populates this[OPTION_KEY] with stored value when one exists in localStorage', () => {
    const expectedResult = 'ruff';
    const optionKeyMock = 'threeve';
    const optionStorageKeyMock = 'zlsa.atc.option.threeve';
    const model = new GameOptions();

    model._options = {};
    global.localStorage.setItem(optionStorageKeyMock, 'ruff');

    model.addOption(GAME_OPTION_LIST_MOCK[0]);

    expect(model[optionKeyMock] === expectedResult).toBe(true);
});

test('.setOptionByName() creates a localStorage item with the correct value', () => {
    const expectedResult = 'bow wow';
    const optionNameMock = 'threeve';
    const storageKeyMock = 'zlsa.atc.option.threeve';
    const model = new GameOptions();

    model.addOption(GAME_OPTION_LIST_MOCK[0]);
    model.setOptionByName(optionNameMock, expectedResult);

    expect(typeof global.localStorage.getItem(storageKeyMock) === 'undefined').toBe(false);
    expect(global.localStorage.getItem(storageKeyMock) === expectedResult).toBe(true);
});

test('.setOptionByName() calls EventBus.trigger() when #onChangeEventHandler() is not null', () => {
    EventBus.trigger = sinon.stub();
    const optionValueMock = 'bow wow';
    const optionNameMock = 'threeve';
    const model = new GameOptions();

    model.addOption(GAME_OPTION_LIST_MOCK[0]);
    model.setOptionByName(optionNameMock, optionValueMock);

    expect(EventBus.trigger.callCount === 1).toBe(true);
    expect(
        EventBus.trigger.calledWithExactly(
            GAME_OPTION_LIST_MOCK[0].onChangeEventHandler,
            optionValueMock
        )
    ).toBe(true);

    EventBus.trigger = sinon.restore();
});

test('.setOptionByName() does not call EventBus.trigger() when #onChangeEventHandler() is null', () => {
    EventBus.trigger = sinon.stub();
    const optionValueMock = 'bow wow';
    const optionNameMock = 'number';
    const model = new GameOptions();

    model.addOption(GAME_OPTION_LIST_MOCK[1]);
    model.setOptionByName(optionNameMock, optionValueMock);

    expect(EventBus.trigger.callCount === 0).toBe(true);

    EventBus.trigger = sinon.restore();
});

test('.buildStorageName() returns a string used for localStorage', () => {
    const expectedResult = 'zlsa.atc.option.threeve';
    const model = new GameOptions();
    const result = model.buildStorageName('threeve');

    expect(result === expectedResult).toBe(true);
});
