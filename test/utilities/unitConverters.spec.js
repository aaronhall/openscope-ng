/* eslint-disable arrow-parens, max-len, import/no-extraneous-dependencies*/
import { test, expect, vi } from 'vitest';

import {
    UNIT_CONVERSION_CONSTANTS,
    km,
    nm,
    m_ft,
    km_ft,
    ft_km,
    kn_ms,
    heading_to_string,
    radiansToDegrees,
    degreesToRadians,
    convertMinutesToSeconds,
    parseCoordinate,
    parseElevation,
} from '../../src/assets/scripts/client/utilities/unitConverters';

test('.km() converts kilometers to nautical miles', () => {
    const result = km(10);
    const expectedResult = 10 * UNIT_CONVERSION_CONSTANTS.NM_KM;

    expect(result === expectedResult).toBe(true);
});

test('.km() sets a default for the nm parameter', () => {
    const result = km();
    const expectedResult = 0 * UNIT_CONVERSION_CONSTANTS.NM_KM;

    expect(result === expectedResult).toBe(true);
});

test('.nm() converts nautical miles to kilometers', () => {
    const result = nm(10);
    const expectedResult = 10 / UNIT_CONVERSION_CONSTANTS.NM_KM;

    expect(result === expectedResult).toBe(true);
});

test('.nm() sets a default for the km parameter', () => {
    const result = nm();
    const expectedResult = 0 / UNIT_CONVERSION_CONSTANTS.NM_KM;

    expect(result === expectedResult).toBe(true);
});

test('.m_ft() converts meters to feet', () => {
    const result = m_ft(10);
    const expectedResult = 10 / UNIT_CONVERSION_CONSTANTS.M_FT;

    expect(result === expectedResult).toBe(true);
});

test('.km_ft() converts kilometers to feet', () => {
    const result = km_ft(10);
    const expectedResult = 10 / UNIT_CONVERSION_CONSTANTS.KM_FT;

    expect(result === expectedResult).toBe(true);
});

test('.km_ft() sets a default for the km parameter', () => {
    const result = km_ft();
    const expectedResult = 0 / UNIT_CONVERSION_CONSTANTS.KM_FT;

    expect(result === expectedResult).toBe(true);
});

test('.ft_km() converts feet to kilometers', () => {
    const result = ft_km(10);
    const expectedResult = 10 * UNIT_CONVERSION_CONSTANTS.KM_FT;

    expect(result === expectedResult).toBe(true);
});

test('.ft_km() sets a default for the ft parameter', () => {
    const result = ft_km();
    const expectedResult = 0 * UNIT_CONVERSION_CONSTANTS.KM_FT;

    expect(result === expectedResult).toBe(true);
});

test('.kn_ms() converts knots to m/s', () => {
    const speed = 190;
    const expectedResult = speed * UNIT_CONVERSION_CONSTANTS.KN_MS;
    const result = kn_ms(speed);

    expect(result === expectedResult).toBe(true);
});

test('.heading_to_string() converts a heading in radians to a degree heading that has a leading zero', () => {
    const headingMock = 0.698132;
    const expectedResult = '040';
    const result = heading_to_string(headingMock);

    expect(result === expectedResult).toBe(true);
});

test('.heading_to_string() converts a heading in radians to a degree heading', () => {
    const headingMock = -1.6302807335875378;
    const expectedResult = '267';
    const result = heading_to_string(headingMock);

    expect(result === expectedResult).toBe(true);
});

test('.radiansToDegrees() converts radians to degrees', () => {
    const result = radiansToDegrees(2.1467549799530254);
    const expectedResult = 123;

    expect(result === expectedResult).toBe(true);
});

test('.degreesToRadians() converts degrees to radians', () => {
    const result = degreesToRadians(123);
    const expectedResult = 2.1467549799530254;

    expect(result === expectedResult).toBe(true);
});

test('.convertMinutesToSeconds() converts minutes to seconds', () => {
    const result = convertMinutesToSeconds(10);
    const expectedResult = 10 * 60;

    expect(result === expectedResult).toBe(true);
});

test('.parseCoordinate() should accept a lat/long coordinate and convet it to decimal notation', () => {
    const latitudeMock = 'N35d57m50.000';
    const longitudeMock = 'W115d51m15.000';

    expect(parseCoordinate(latitudeMock) === 35.96388888888889).toBe(true);
    expect(parseCoordinate(longitudeMock) === -115.85416666666666).toBe(true);
});

test('.parseElevation() should parse a string elevation into an elevation in feet', () => {
    expect(parseElevation('5.5m') === 5.5).toBe(false);
    expect(parseElevation('-23m') === -23).toBe(false);

    expect(parseElevation('13.3ft') === 13.3).toBe(true);
    expect(parseElevation('13ft') === 13).toBe(true);
    expect(parseElevation(13) === 13).toBe(true);
    expect(parseElevation('5.5m') === 18.04461942257218).toBe(true);
    expect(parseElevation(5.5) === 5.5).toBe(true);
    expect(parseElevation('-11ft') === -11).toBe(true);
    expect(parseElevation('-23m') === -75.45931758530183).toBe(true);
    expect(parseElevation(Infinity) === Infinity).toBe(true);
    expect(parseElevation(-Infinity) === -Infinity).toBe(true);
    expect(parseElevation('Infinity') === Infinity).toBe(true);
    expect(parseElevation('-Infinity') === -Infinity).toBe(true);
});
