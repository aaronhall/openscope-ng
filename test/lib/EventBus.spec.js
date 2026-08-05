import { test, expect, vi } from 'vitest';

import EventBus from '../../src/assets/scripts/client/lib/EventBus';

const eventNameMock = 'click';
const callbackMock = function doSomething(v) {
    return v + 1;
};
const anonymousCallbackMock = function (v) {
    return v + 1;
};

afterEach(() => {
    EventBus.destroy();
});

test('throws when attempting to instantiate', (t) => {
    expect(() => new EventBus()).toThrow();
});

test('.on() adds an eventName with a callback to #_events', (t) => {
    EventBus.on(eventNameMock, callbackMock);

    expect(typeof EventBus._events[eventNameMock] !== 'undefined').toBe(true);
});

test('.on() adds an additional callback to #_events when an eventName already exists', (t) => {
    EventBus.on(eventNameMock, callbackMock);
    EventBus.on(eventNameMock, anonymousCallbackMock);

    expect(EventBus._events[eventNameMock].observers.length === 2).toBe(true);
});

test('.off() returns early when passed an eventName that doesnt exist in the list', (t) => {
    EventBus.on(eventNameMock, callbackMock);
    EventBus.on(eventNameMock, anonymousCallbackMock);

    EventBus.off('threeve', callbackMock);

    expect(EventBus._events.click.observers.length === 2).toBe(true);
});

test('.off() removes an observer from an eventName', (t) => {
    EventBus.on(eventNameMock, callbackMock);
    EventBus.on(eventNameMock, anonymousCallbackMock);

    EventBus.off(eventNameMock, callbackMock);

    expect(EventBus._events.click.observers.length === 1).toBe(true);
});

test('.off() removes the event from #_events when no other observers exist', (t) => {
    EventBus.on(eventNameMock, callbackMock);

    EventBus.off(eventNameMock, callbackMock);

    expect(typeof EventBus._events.click === 'undefined').toBe(true);
});

test('.trigger() does not throw when an event does not exist', (t) => {
    expect(() => EventBus.trigger(eventNameMock, 11, 3)).not.toThrow();
});

test('.trigger() calls each observer with #args', (t) => {
    let val = 0;
    const triggerFnMock = (plus, minus = 0) => {
        val += plus;
        val -= minus;
    };
    EventBus.on(eventNameMock, triggerFnMock);

    EventBus.trigger(eventNameMock, 11, 3);

    expect(val === 8).toBe(true);
});
