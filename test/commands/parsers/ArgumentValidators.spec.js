/* eslint-disable arrow-parens, max-len, import/no-extraneous-dependencies */
import { test, expect, vi } from 'vitest';

import {
    zeroArgumentsValidator,
    singleArgumentValidator,
    zeroOrOneArgumentValidator,
    oneOrTwoArgumentValidator,
    oneToThreeArgumentsValidator,
    oneOrThreeArgumentsValidator,
    altitudeValidator,
    fixValidator,
    headingValidator,
    holdValidator,
    isValidCourseString,
    squawkValidator,
    optionalAltitudeValidator,
    crossingValidator,
} from '../../../src/assets/scripts/client/commands/parsers/argumentValidators';

// TODO: import ERROR_MESSAGE and use actual values to test against

test('.zeroArgumentsValidator() returns a string when passed the wrong number of arguments', () => {
    let result = zeroArgumentsValidator();
    expect(typeof result === 'undefined').toBe(true);

    result = zeroArgumentsValidator([]);
    expect(typeof result === 'undefined').toBe(true);

    result = zeroArgumentsValidator(['', '']);
    expect(result === 'Invalid argument length. Expected exactly zero arguments').toBe(true);
});

test('.singleArgumentValidator() returns a string when passed the wrong number of arguments', () => {
    let result = singleArgumentValidator(['']);
    expect(typeof result === 'undefined').toBe(true);

    result = singleArgumentValidator();
    expect(result === 'Invalid argument length. Expected exactly one argument').toBe(true);

    result = singleArgumentValidator([]);
    expect(result === 'Invalid argument length. Expected exactly one argument').toBe(true);

    result = singleArgumentValidator(['', '']);
    expect(result === 'Invalid argument length. Expected exactly one argument').toBe(true);
});

test('.zeroOrOneArgumentValidator() returns a string when passed the wrong number of arguments', () => {
    let result = zeroOrOneArgumentValidator();
    expect(typeof result === 'undefined').toBe(true);

    result = zeroOrOneArgumentValidator(['']);
    expect(typeof result === 'undefined').toBe(true);

    result = zeroOrOneArgumentValidator(['', '']);
    expect(result === 'Invalid argument length. Expected zero or one argument').toBe(true);
});

test('.oneOrTwoArgumentValidator() returns a string when passed the wrong number of arguments', () => {
    let result = oneOrTwoArgumentValidator(['']);
    expect(typeof result === 'undefined').toBe(true);

    result = oneOrTwoArgumentValidator(['', '']);
    expect(typeof result === 'undefined').toBe(true);

    result = oneOrTwoArgumentValidator();
    expect(result === 'Invalid argument length. Expected one or two arguments').toBe(true);

    result = oneOrTwoArgumentValidator(['', '', '']);
    expect(result === 'Invalid argument length. Expected one or two arguments').toBe(true);
});

test('.oneToThreeArgumentsValidator() returns a string when passed the wrong number of arguments', () => {
    let result = oneToThreeArgumentsValidator(['']);
    expect(typeof result === 'undefined').toBe(true);

    result = oneToThreeArgumentsValidator(['', '']);
    expect(typeof result === 'undefined').toBe(true);

    result = oneToThreeArgumentsValidator(['', '', '']);
    expect(typeof result === 'undefined').toBe(true);

    result = oneToThreeArgumentsValidator();
    expect(result === 'Invalid argument length. Expected one, two, or three arguments').toBe(true);

    result = oneToThreeArgumentsValidator(['', '', '', '']);
    expect(result === 'Invalid argument length. Expected one, two, or three arguments').toBe(true);
});

test('.oneOrThreeArgumentValidator() returns a string when passed the wrong number of arguments', () => {
    let result = oneOrThreeArgumentsValidator(['']);
    expect(typeof result === 'undefined').toBe(true);

    result = oneOrThreeArgumentsValidator(['', '', '']);
    expect(typeof result === 'undefined').toBe(true);

    result = oneOrThreeArgumentsValidator();
    expect(result === 'Invalid argument length. Expected one or three arguments').toBe(true);

    result = oneOrThreeArgumentsValidator(['', '', '', '']);
    expect(result === 'Invalid argument length. Expected one or three arguments').toBe(true);
});

test('.altitudeValidator() returns undefined when passed a valid altitude', () => {
    let result = altitudeValidator(['100']);
    expect(typeof result === 'undefined').toBe(true);

    result = altitudeValidator(['300']);
    expect(typeof result === 'undefined').toBe(true);

    result = altitudeValidator(['aa']);
    expect(result === 'Invalid argument. Altitude must be a number').toBe(true);
});

test('.altitudeValidator() returns a string when passed the wrong number of arguments', () => {
    let result = altitudeValidator(['100', 'expedite']);
    expect(typeof result === 'undefined').toBe(true);

    result = altitudeValidator();
    expect(result === 'Invalid argument length. Expected one or two arguments').toBe(true);

    result = altitudeValidator([]);
    expect(result === 'Invalid argument length. Expected one or two arguments').toBe(true);

    result = altitudeValidator(['', '', '']);
    expect(result === 'Invalid argument length. Expected one or two arguments').toBe(true);
});

test('.altitudeValidator() returns a string when passed anything other than expedite or ex as the second argument', () => {
    let result = altitudeValidator(['100', 'expedite']);
    expect(typeof result === 'undefined').toBe(true);

    result = altitudeValidator(['100', 'ex']);
    expect(typeof result === 'undefined').toBe(true);

    result = altitudeValidator(['100', '']);
    expect(
        result === 'Invalid argument. Altitude accepts only "expedite" or "ex" as a second argument'
    ).toBe(true);
});

test('.optionalAltitudeValidator() returns undefined when no value is passed', () => {
    const result = optionalAltitudeValidator([]);
    expect(typeof result === 'undefined').toBe(true);
});

test('.optionalAltitudeValidator() returns undefined when passed a valid altitude', () => {
    let result = optionalAltitudeValidator(['100']);
    expect(typeof result === 'undefined').toBe(true);

    result = optionalAltitudeValidator(['300']);
    expect(typeof result === 'undefined').toBe(true);

    result = optionalAltitudeValidator(['aa']);
    expect(result === 'Invalid argument. Altitude must be a number').toBe(true);
});

test('.optionalAltitudeValidator() returns a string when passed the wrong number of arguments', () => {
    let result = optionalAltitudeValidator(['100', 'expedite']);
    expect(result === 'Invalid argument length. Expected zero or one argument').toBe(true);

    result = optionalAltitudeValidator(['', '', '']);
    expect(result === 'Invalid argument length. Expected zero or one argument').toBe(true);
});

test('.fixValidator() returns undefined when it receives at least one valid argument', () => {
    let result = fixValidator(['one']);
    expect(typeof result === 'undefined').toBe(true);

    result = fixValidator(['one', 'two', 'th33', '4F1o']);
    expect(typeof result === 'undefined').toBe(true);

    expect(fixValidator([]) === 'Invalid argument length. Expected one or more arguments').toBe(
        true
    );
});

test('.fixValidator() returns a string when passed anything other than a string', () => {
    expect(fixValidator([42, '', '']) === 'Invalid argument. Must be a string').toBe(true);
    expect(fixValidator(['', false, '']) === 'Invalid argument. Must be a string').toBe(true);
    expect(fixValidator([42, false, '', {}]) === 'Invalid argument. Must be a string').toBe(true);
});

test('.headingValidator() returns a string when passed the wrong number of arguments', () => {
    let result = headingValidator(['042']);
    expect(result).toBe(undefined);

    result = headingValidator(['l', '42']);
    expect(result).toBe(undefined);

    result = headingValidator();
    expect(result).toBe('Invalid argument length. Expected one or two arguments');

    result = headingValidator([]);
    expect(result).toBe('Invalid argument length. Expected one or two arguments');

    result = headingValidator(['l', '42', 'threeve']);
    expect(result).toBe('Invalid argument length. Expected one or two arguments');
});

test('.headingValidator() returns a string when passed the wrong type of arguments', () => {
    expect(headingValidator(['threeve'])).toBe(
        'Invalid argument. Heading must be between 001 and 360'
    );
    expect(headingValidator(['42', '42'])).toBe(
        "Invalid argument. Expected one of 'left / l / right / r' as the first argument when passed three arguments"
    );
    expect(headingValidator(['l', 'threeve'])).toBe('Invalid argument. Heading must be a number');
    expect(headingValidator(['42', '42'])).toBe(
        "Invalid argument. Expected one of 'left / l / right / r' as the first argument when passed three arguments"
    );
    expect(headingValidator(['l', 'threeve'])).toBe('Invalid argument. Heading must be a number');
    expect(headingValidator(['000'])).toBe('Invalid argument. Heading must be between 001 and 360');
    expect(headingValidator(['361'])).toBe('Invalid argument. Heading must be between 001 and 360');
    expect(headingValidator(['l', '000'])).toBe(
        'Invalid argument. Heading must be between 001 and 360'
    );
    expect(headingValidator(['l', '361'])).toBe(
        'Invalid argument. Heading must be between 001 and 360'
    );
    expect(headingValidator(['l', '0'])).toBe(
        'Invalid argument. Incremental heading must be positive'
    );
    expect(headingValidator(['l', '-9'])).toBe(
        'Invalid argument. Incremental heading must be positive'
    );
});

test('.headingValidator() returns undefined when passed a number as a single argument', () => {
    const result = headingValidator(['042']);
    expect(result).toBe(undefined);
});

test('.headingValidator() returns undefined when passed a string and a number as arguments', () => {
    expect(headingValidator(['l', '2'])).toBe(undefined);
    expect(headingValidator(['l', '42'])).toBe(undefined);
    expect(headingValidator(['l', '042'])).toBe(undefined);
});

test('.holdValidator() returns a string when passed the wrong number of arguments', () => {
    const result = holdValidator(['', 'left', 1, '', '']);
    expect(result === 'Invalid argument length. Expected zero to four arguments').toBe(true);
});

test('.holdValidator() returns undefined when passed zero arguments', () => {
    let result = holdValidator();
    expect(typeof result === 'undefined').toBe(true);

    result = holdValidator([]);
    expect(typeof result === 'undefined').toBe(true);
});

test('.holdValidator() returns a string when passed the wrong type of arguments', () => {
    expect(holdValidator([false]) === 'Invalid argument. Must be a string').toBe(true);
    expect(
        holdValidator([false, '42', '1min', '090']) === 'Invalid argument. Must be a string'
    ).toBe(true);
    expect(
        holdValidator(['42', false, '1min', '090']) === 'Invalid argument. Must be a string'
    ).toBe(true);
    expect(
        holdValidator(['42', 'left', false, '090']) === 'Invalid argument. Must be a string'
    ).toBe(true);
    expect(
        holdValidator(['42', 'left', '1min', false]) === 'Invalid argument. Must be a string'
    ).toBe(true);
});

test('.holdValidator() returns undefined when passed a string as an argument', () => {
    const result = holdValidator(['']);
    expect(typeof result === 'undefined').toBe(true);
});

test('.holdValidator() returns undefined when two strings as arguments', () => {
    let result = holdValidator(['dumba', '1min']);
    expect(typeof result === 'undefined').toBe(true);

    result = holdValidator(['1nm', '1min']);
    expect(typeof result === 'undefined').toBe(true);

    result = holdValidator(['l', 'dumba']);
    expect(typeof result === 'undefined').toBe(true);

    result = holdValidator(['090', 'dumba']);
    expect(typeof result === 'undefined').toBe(true);
});

test('.holdValidator() returns undefined when passed three strings as arguments', () => {
    let result = holdValidator(['dumba', 'left', '1min']);
    expect(typeof result === 'undefined').toBe(true);

    result = holdValidator(['dumba', 'right', '1nm']);
    expect(typeof result === 'undefined').toBe(true);

    result = holdValidator(['dumba', 'right', '1min']);
    expect(typeof result === 'undefined').toBe(true);

    result = holdValidator(['dumba', 'right', '1nm']);
    expect(typeof result === 'undefined').toBe(true);

    result = holdValidator(['dumba', 'right', '090']);
    expect(typeof result === 'undefined').toBe(true);

    result = holdValidator(['dumba', '1min', '090']);
    expect(typeof result === 'undefined').toBe(true);

    result = holdValidator(['dumba', '1nm', '090']);
    expect(typeof result === 'undefined').toBe(true);
});

test('.holdValidator() returns undefined when passed four strings as arguments', () => {
    let result = holdValidator(['dumba', 'left', '1min', '090']);
    expect(typeof result === 'undefined').toBe(true);

    result = holdValidator(['dumba', 'right', '1nm', '090']);
    expect(typeof result === 'undefined').toBe(true);

    result = holdValidator(['dumba', 'right', '1min', '090']);
    expect(typeof result === 'undefined').toBe(true);

    result = holdValidator(['dumba', 'right', '1nm', '090']);
    expect(typeof result === 'undefined').toBe(true);
});

test('.isValidCourseString() returns true when passed a 3 digit course', () => {
    expect(isValidCourseString('001')).toBe(true);
    expect(isValidCourseString('090')).toBe(true);
    expect(isValidCourseString('360')).toBe(true);
});

test('.isValidCourseString() returns false when passed an invalid course', () => {
    expect(isValidCourseString('000')).toBe(false);
    expect(isValidCourseString('1min')).toBe(false);
    expect(isValidCourseString('5')).toBe(false);
    expect(isValidCourseString('50')).toBe(false);
    expect(isValidCourseString('370')).toBe(false);
    expect(isValidCourseString('-10')).toBe(false);
    expect(isValidCourseString('1000')).toBe(false);
});

test('.squawkValidator() returns undefined when passed a valid squawk', () => {
    let result = squawkValidator(['1111']);
    expect(typeof result === 'undefined').toBe(true);

    result = squawkValidator(['1234']);
    expect(typeof result === 'undefined').toBe(true);
});

test('.squawkValidator() returns a string when passed the wrong number of arguments', () => {
    let result = squawkValidator();
    expect(result === 'Invalid argument length. Expected exactly one argument').toBe(true);

    result = squawkValidator([]);
    expect(result === 'Invalid argument length. Expected exactly one argument').toBe(true);

    result = squawkValidator(['', '']);
    expect(result === 'Invalid argument length. Expected exactly one argument').toBe(true);
});

test('.squawkValidator() returns string when passed invalid squawk', () => {
    let result = squawkValidator(['8888']);
    expect(result === "Invalid argument. Expected '0000'-'7777' for the transponder code.").toBe(
        true
    );

    result = squawkValidator(['111']);
    expect(result === "Invalid argument. Expected '0000'-'7777' for the transponder code.").toBe(
        true
    );

    result = squawkValidator(['1181']);
    expect(result === "Invalid argument. Expected '0000'-'7777' for the transponder code.").toBe(
        true
    );

    result = squawkValidator(['11711']);
    expect(result === "Invalid argument. Expected '0000'-'7777' for the transponder code.").toBe(
        true
    );

    result = squawkValidator(['1a11']);
    expect(result === "Invalid argument. Expected '0000'-'7777' for the transponder code.").toBe(
        true
    );
});

test('.crossingValidator() returns a string when passed the wrong number of arguments', () => {
    let result = crossingValidator();
    expect(result === 'Invalid argument length. Expected two or three arguments').toBe(true);

    result = crossingValidator([]);
    expect(result === 'Invalid argument length. Expected two or three arguments').toBe(true);

    result = crossingValidator(['', '', '', '', '']);
    expect(result === 'Invalid argument length. Expected two or three arguments').toBe(true);
});

test('.crossingValidator() returns undefined when passed valid arguments', () => {
    let result = crossingValidator(['LEMDY', 'a50', 's210']);
    expect(typeof result === 'undefined').toBe(true);

    result = crossingValidator(['BLUB', 'a100', 's250']);
    expect(typeof result === 'undefined').toBe(true);
});

test('.crossingValidator() returns an error when fixname is not a string', () => {
    let result = crossingValidator([50, 'a70', 's210']);
    expect(result === 'Invalid argument. Must be a string').toBe(true);

    result = crossingValidator([{}, 'a70', 's210']);
    expect(result === 'Invalid argument. Must be a string').toBe(true);

    result = crossingValidator([[], 'a70', 's210']);
    expect(result === 'Invalid argument. Must be a string').toBe(true);
});

test('.crossingValidator() returns an error when altitude is not a number', () => {
    let result = crossingValidator(['LEMDY', 'xx', 's210']);
    expect(result === 'Invalid argument. Altitude must be a number').toBe(true);

    result = crossingValidator(['LEMDY', '', 's210']);
    expect(result === 'Invalid argument. Altitude must be a number').toBe(true);

    result = crossingValidator(['LEMDY', [], 's210']);
    expect(result === 'Invalid argument. Altitude must be a number').toBe(true);

    result = crossingValidator(['LEMDY', {}, 's210']);
    expect(result === 'Invalid argument. Altitude must be a number').toBe(true);
});

test('.crossingValidator() returns an error when speed is not a number', () => {
    let result = crossingValidator(['LEMDY', 'a70', 'xx']);
    expect(result === 'Invalid argument. Speed must be a number').toBe(true);

    result = crossingValidator(['LEMDY', 'a70', '']);
    expect(result === 'Invalid argument. Speed must be a number').toBe(true);

    result = crossingValidator(['LEMDY', 'a70', []]);
    expect(result === 'Invalid argument. Speed must be a number').toBe(true);

    result = crossingValidator(['LEMDY', 'a70', {}]);
    expect(result === 'Invalid argument. Speed must be a number').toBe(true);
});
