import { test, expect, vi } from 'vitest';

import { getRadioCardinalDirectionNameForHeading } from '../../../src/assets/scripts/client/utilities/radioUtilities';

const headingMock = -1.62476729292438;

// TODO: quick and dirty test to verify functionality. this test file should be added to with more
// cases and better descriptions

test('.getRadioCardinalDirectionNameForHeading() returns a cardinal direction', () => {
    expect(getRadioCardinalDirectionNameForHeading(headingMock) === 'east').toBe(true);
});
