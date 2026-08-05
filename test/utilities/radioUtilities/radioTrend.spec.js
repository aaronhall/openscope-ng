import { test, expect, vi } from 'vitest';

import {
    radio_trend
} from '../../../src/assets/scripts/client/utilities/radioUtilities';

test('.radio_trend() returns `descend and maintain` when measured > target', () => {
    expect(radio_trend('altitude', 1, 0) === 'descend and maintain').toBe(true);
});

test('.radio_trend() returns `climb and maintain` when measured < target', () => {
    expect(radio_trend('altitude', 0, 1) === 'climb and maintain').toBe(true);
});

test('.radio_trend() returns `maintain` when measured === target', () => {
    expect(radio_trend('altitude', 0, 0) === 'maintain').toBe(true);
});

test('.radio_trend() returns `reduce speed to` when measured > target', () => {
    expect(radio_trend('speed', 1, 0) === 'reduce speed to').toBe(true);
});

test('.radio_trend() returns `increase spped to` when measured < target', () => {
    expect(radio_trend('speed', 0, 1) === 'increase speed to').toBe(true);
});

test('.radio_trend() returns `maintain present speed of` when measured === target', () => {
    expect(radio_trend('speed', 0, 0) === 'maintain present speed of').toBe(true);
});
