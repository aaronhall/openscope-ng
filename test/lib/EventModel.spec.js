import { test, expect, vi } from 'vitest';

import EventModel from '../../src/assets/scripts/client/lib/EventModel';

const eventNameMock = 'click';
const observerMock = function doSomething() {
    return true;
};
const anonymousObserverMock = function() {
    return true;
};

test('does not thow when called to instantiate', () => {
    expect(() => new EventModel()).not.toThrow();
});

test('.addObserver() returns early when an observer exists in #observers', () => {
    const model = new EventModel(eventNameMock);
    model.observers.push(observerMock);

    model.addObserver(observerMock);

    expect(model.observers.length === 1).toBe(true);
});

test('.addObserver() adds an observer to #observers', () => {
    const model = new EventModel(eventNameMock);

    model.addObserver(observerMock);

    expect(model.observers.length === 1).toBe(true);
});

test('.removeObserver() returns early when an observer does not exist in #observers', () => {
    const model = new EventModel(eventNameMock);
    model.observers.push(anonymousObserverMock);

    model.removeObserver(observerMock);

    expect(model.observers.length === 1).toBe(true);
});

test('.removeObserver() removes an observer from #observers', () => {
    const model = new EventModel(eventNameMock);
    model.observers.push(observerMock);
    model.observers.push(anonymousObserverMock);

    model.removeObserver(observerMock);

    expect(model.observers.length === 1).toBe(true);
});
