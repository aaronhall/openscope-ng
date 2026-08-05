import { test, expect, vi } from 'vitest';

import { tau, distanceToPoint } from '../../src/assets/scripts/client/math/circle';

test('.tau() returns PI * 2', () => {
    const result = tau();
    const expectedResult = Math.PI * 2;

    expect(result === expectedResult).toBe(true);
});

test('.distanceToPoint() returns the distance between two lat/long coordinates in kilometers', () => {
    const latitudeAMock = 36.080056;
    const longitudeAMock = -115.15225;
    const latitudeBMock = 36.080056;
    const longitudeBMock = -115.14661;
    const expectedResult = 0.5068508706893402;
    const result = distanceToPoint(latitudeAMock, longitudeAMock, latitudeBMock, longitudeBMock);

    expect(result === expectedResult).toBe(true);
});
