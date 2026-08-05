import { JSDOM } from 'jsdom';

const { window } = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'http://localhost/',
});

Object.defineProperty(window, 'localStorage', {
    value: globalThis.localStorage,
});

globalThis.window = window;
globalThis.document = window.document;
