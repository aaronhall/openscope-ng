/* eslint-disable import/no-extraneous-dependencies, arrow-parens */
import { test, expect, vi } from 'vitest';

import {
    calcTurnRadiusByBankAngle,
    calcTurnRadiusByTurnRate,
    calcTurnInitiationDistanceNm,
    bearingToPoint,
    fixRadialDist,
    calculateCrosswindAngle,
} from '../../src/assets/scripts/client/math/flightMath';

test('calcTurnRadiusByBankAngle() returns a turn radius based on speed and bank angle', () => {
    const speed = 190;
    const bankAngle = 0.523599;
    const expectedResult = 0.9139236691657421;
    const result = calcTurnRadiusByBankAngle(speed, bankAngle);

    expect(result === expectedResult).toBe(true);
});

test('calcTurnRadiusByTurnRate() returns a turn radius based on speed and turn rate', () => {
    const speed = 190;
    const turnRate = 0.0523598776;
    const expectedResult = 1.0079813054753546;
    const result = calcTurnRadiusByTurnRate(speed, turnRate);

    expect(result === expectedResult).toBe(true);
});

test('calcTurnInitiationDistanceNm() returns the distance required for a turn', () => {
    const speedA = 190;
    const speedB = 500;
    const turnRate = 0.0523598776;

    expect(calcTurnInitiationDistanceNm(speedA, turnRate, 0.26420086153126987)).toBe(
        0.1339347496990795
    );
    expect(calcTurnInitiationDistanceNm(speedA, turnRate, Math.PI * 0.5)).toBe(1.0079813054753544);
    expect(calcTurnInitiationDistanceNm(speedA, turnRate, Math.PI * 0.75)).toBe(2.4334821382971388);

    expect(calcTurnInitiationDistanceNm(speedB, turnRate, 0.26420086153126987)).toBe(
        0.35245986762915654
    );
    expect(calcTurnInitiationDistanceNm(speedB, turnRate, Math.PI * 0.5)).toBe(2.65258238282988);
    expect(calcTurnInitiationDistanceNm(speedB, turnRate, Math.PI * 0.75)).toBe(6.403900363939838);
});

test('bearingToPoint() returns the bearing from one point to another', () => {
    const positionStart = [-99.76521626690608, -148.0266530993096];
    const positionEnd = [-87.64380662924125, -129.57471627889475];
    const expectedResult = 0.5812231343277809;
    const result = bearingToPoint(positionStart, positionEnd);

    expect(result === expectedResult).toBe(true);
});

test('.calculateCrosswindAngle() returns a number that represents the crosswind angle', () => {
    const expectedResult = 0.4720489082412385;
    const runwayAngleMock = 3.3676754461462877;
    const windAngleMock = 3.839724354387525;
    const result = calculateCrosswindAngle(runwayAngleMock, windAngleMock);

    expect(result === expectedResult).toBe(true);
});
