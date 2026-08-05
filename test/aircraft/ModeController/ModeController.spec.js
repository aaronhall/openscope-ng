import { test, expect, vi } from 'vitest';

import ModeController from '../../../src/assets/scripts/client/aircraft/ModeControl/ModeController';
import {
    MCP_MODE,
    MCP_MODE_NAME,
    MCP_FIELD_NAME,
} from '../../../src/assets/scripts/client/aircraft/ModeControl/modeControlConstants';

const headingOrCourseMock = 3.141592653589793;

test('does not throw when instantiated without parameters', () => {
    expect(() => new ModeController()).not.toThrow();
});

test('does not throw when instantiated with parameters', () => {
    expect(() => new ModeController()).not.toThrow();
    expect(() => new ModeController()).not.toThrow();
});

test('#isEnabled is false on instantiation', () => {
    const mcp = new ModeController();

    expect(mcp.isEnabled).toBe(false);
});

test('.#headingInDegrees returns a whole number', () => {
    const mcp = new ModeController();

    mcp.heading = 3.839724354387525;

    expect(mcp.headingInDegrees === 220).toBe(true);
});

test('.enable() sets #isEnabled to true', () => {
    const mcp = new ModeController();

    mcp.enable();

    expect(mcp.isEnabled).toBe(true);
});

test('.enable() does not change #isEnabled when #isEnabled is true', () => {
    const mcp = new ModeController();

    mcp.isEnabled = true;
    mcp.enable();

    expect(mcp.isEnabled).toBe(true);
});

test('.disable() sets #isEnabled to false', () => {
    const mcp = new ModeController();

    mcp.disable();

    expect(mcp.isEnabled).toBe(false);
});

test('.disable() does not change #isEnabled when #isEnabled is false', () => {
    const mcp = new ModeController();

    mcp.isEnabled = false;
    mcp.disable();

    expect(mcp.isEnabled).toBe(false);
});

test('.initializeForAirborneFlight() sets MCP for arrival descending via STAR which ends still above the airspace ceiling', () => {
    const mcp = new ModeController();
    const bottomAltitudeMock = 15000;
    const airspaceCeilingMock = 12000;
    const currentAltitudeMock = 21000;
    const currentHeadingMock = Math.PI;
    const currentSpeedMock = 290;

    mcp.initializeForAirborneFlight(
        bottomAltitudeMock,
        airspaceCeilingMock,
        currentAltitudeMock,
        currentHeadingMock,
        currentSpeedMock
    );

    expect(mcp.altitude === airspaceCeilingMock).toBe(true);
    expect(mcp.altitudeMode === MCP_MODE.ALTITUDE.VNAV).toBe(true);
    expect(mcp.heading === currentHeadingMock).toBe(true);
    expect(mcp.headingMode === MCP_MODE.HEADING.LNAV).toBe(true);
    expect(mcp.speed === currentSpeedMock).toBe(true);
    expect(mcp.speedMode === MCP_MODE.SPEED.VNAV).toBe(true);
});

test('.initializeForAirborneFlight() sets MCP for arrival descending via STAR which ends below the airspace ceiling', () => {
    const mcp = new ModeController();
    const bottomAltitudeMock = 6000;
    const airspaceCeilingMock = 12000;
    const currentAltitudeMock = 21000;
    const currentHeadingMock = Math.PI;
    const currentSpeedMock = 290;

    mcp.initializeForAirborneFlight(
        bottomAltitudeMock,
        airspaceCeilingMock,
        currentAltitudeMock,
        currentHeadingMock,
        currentSpeedMock
    );

    expect(mcp.altitude === bottomAltitudeMock).toBe(true);
    expect(mcp.altitudeMode === MCP_MODE.ALTITUDE.VNAV).toBe(true);
    expect(mcp.heading === currentHeadingMock).toBe(true);
    expect(mcp.headingMode === MCP_MODE.HEADING.LNAV).toBe(true);
    expect(mcp.speed === currentSpeedMock).toBe(true);
    expect(mcp.speedMode === MCP_MODE.SPEED.VNAV).toBe(true);
});

test('.initializeForAirborneFlight() sets MCP for arrival descending from above airspace ceiling (not via STAR)', () => {
    const mcp = new ModeController();
    const bottomAltitudeMock = -1;
    const airspaceCeilingMock = 12000;
    const currentAltitudeMock = 21000;
    const currentHeadingMock = Math.PI;
    const currentSpeedMock = 290;

    mcp.initializeForAirborneFlight(
        bottomAltitudeMock,
        airspaceCeilingMock,
        currentAltitudeMock,
        currentHeadingMock,
        currentSpeedMock
    );

    expect(mcp.altitude === airspaceCeilingMock).toBe(true);
    expect(mcp.altitudeMode === MCP_MODE.ALTITUDE.HOLD).toBe(true);
    expect(mcp.heading === currentHeadingMock).toBe(true);
    expect(mcp.headingMode === MCP_MODE.HEADING.LNAV).toBe(true);
    expect(mcp.speed === currentSpeedMock).toBe(true);
    expect(mcp.speedMode === MCP_MODE.SPEED.VNAV).toBe(true);
});

test('.initializeForAirborneFlight() sets MCP for arrival spawning below airspace ceiling ', () => {
    const mcp = new ModeController();
    const bottomAltitudeMock = -1;
    const airspaceCeilingMock = 12000;
    const currentAltitudeMock = 9000;
    const currentHeadingMock = Math.PI;
    const currentSpeedMock = 290;

    mcp.initializeForAirborneFlight(
        bottomAltitudeMock,
        airspaceCeilingMock,
        currentAltitudeMock,
        currentHeadingMock,
        currentSpeedMock
    );

    expect(mcp.altitude === currentAltitudeMock).toBe(true);
    expect(mcp.altitudeMode === MCP_MODE.ALTITUDE.HOLD).toBe(true);
    expect(mcp.heading === currentHeadingMock).toBe(true);
    expect(mcp.headingMode === MCP_MODE.HEADING.LNAV).toBe(true);
    expect(mcp.speed === currentSpeedMock).toBe(true);
    expect(mcp.speedMode === MCP_MODE.SPEED.VNAV).toBe(true);
});

test('._setModeSelectorMode() sets modeSelector to the specified mode', () => {
    const mcp = new ModeController();

    mcp._setModeSelectorMode(MCP_MODE_NAME.SPEED, MCP_MODE.SPEED.VNAV);

    expect(mcp.speedMode === MCP_MODE.SPEED.VNAV).toBe(true);
});

test('._setFieldValue() sets field to the specified value', () => {
    const speedMock = 325;
    const mcp = new ModeController();

    mcp._setFieldValue(MCP_FIELD_NAME.SPEED, speedMock);

    expect(mcp.speed === speedMock).toBe(true);
});

test('.setAltitudeApproach() sets altitude mode to approach', () => {
    const mcp = new ModeController();

    mcp.setAltitudeApproach();

    expect(mcp.altitudeMode === MCP_MODE.ALTITUDE.APPROACH).toBe(true);
});

test('.setAltitudeHold() sets altitude mode to hold', () => {
    const mcp = new ModeController();

    mcp.setAltitudeHold();

    expect(mcp.altitudeMode === MCP_MODE.ALTITUDE.HOLD).toBe(true);
});

test('.setAltitudeVnav() sets altitude mode to VNAV', () => {
    const mcp = new ModeController();

    mcp.setAltitudeVnav();

    expect(mcp.altitudeMode === MCP_MODE.ALTITUDE.VNAV).toBe(true);
});

test('.setAltitudeFieldValue() sets the value of the altitude field', () => {
    const altitudeMock = 5500;
    const mcp = new ModeController();

    mcp.setAltitudeFieldValue(altitudeMock);

    expect(mcp.altitude === altitudeMock).toBe(true);
});

test('.setCourseFieldValue() sets the value of the course field', () => {
    const mcp = new ModeController();

    mcp.setCourseFieldValue(headingOrCourseMock);

    expect(mcp.course === headingOrCourseMock).toBe(true);
});

test('.setHeadingHold() sets the heading mode to hold', () => {
    const mcp = new ModeController();

    mcp.setHeadingHold();

    expect(mcp.headingMode === MCP_MODE.HEADING.HOLD).toBe(true);
});

test('.setHeadingLnav() sets the heading mode to LNAV', () => {
    const mcp = new ModeController();

    mcp.setHeadingLnav();

    expect(mcp.headingMode === MCP_MODE.HEADING.LNAV).toBe(true);
});

test('.setHeadingVorLoc() sets the heading mode to VOR_LOC', () => {
    const mcp = new ModeController();

    mcp.setHeadingVorLoc();

    expect(mcp.headingMode === MCP_MODE.HEADING.VOR_LOC).toBe(true);
});

test('.setHeadingFieldValue() sets the value of the heading field', () => {
    const mcp = new ModeController();

    mcp.setHeadingFieldValue(headingOrCourseMock);

    expect(mcp.heading === headingOrCourseMock).toBe(true);
});

test('.setSpeedHold() sets the heading mode to hold', () => {
    const mcp = new ModeController();

    mcp.setSpeedHold();

    expect(mcp.speedMode === MCP_MODE.SPEED.HOLD).toBe(true);
});

test('.setSpeedN1() sets the heading mode to N1', () => {
    const mcp = new ModeController();

    mcp.setSpeedN1();

    expect(mcp.speedMode === MCP_MODE.SPEED.N1).toBe(true);
});

test('.setSpeedVnav() sets the heading mode to VNAV', () => {
    const mcp = new ModeController();

    mcp.setSpeedVnav();

    expect(mcp.speedMode === MCP_MODE.SPEED.VNAV).toBe(true);
});
