import { test, expect, vi } from 'vitest';

import { distance2d } from '../../src/assets/scripts/client/math/distance';

const ORIGIN = [0, 0];
const POINT = [58.974562189814314, -36.040010227108745];

test('.distance2d() returns a distance to a point', () => {
    const result = distance2d(ORIGIN, POINT);
    const expectedResult = 69.11498623779346;

    expect(result === expectedResult).toBe(true);
});
