import { test, expect, vi } from 'vitest';

import RunwayRelationshipModel from '../../../src/assets/scripts/client/airport/runway/RunwayRelationshipModel';
import { runwayModel07lFixture, runwayModel07rFixture } from '../../fixtures/runwayFixtures';

test('throws when passed invalid parameters', () => {
    expect(() => new RunwayRelationshipModel()).toThrow();
    expect(() => new RunwayRelationshipModel(runwayModel07lFixture, null)).toThrow();
    expect(() => new RunwayRelationshipModel(null, runwayModel07rFixture)).toThrow();
});

test('does not throws when passed valid parameters', () => {
    expect(
        () => new RunwayRelationshipModel(runwayModel07lFixture, runwayModel07rFixture)
    ).not.toThrow();
});

test('.calculateSeparationMinimums() returns 5.556 when #lateral_dist is <= 2500', () => {
    const model = new RunwayRelationshipModel(runwayModel07lFixture, runwayModel07rFixture);
    const result = model.calculateSeparationMinimums();

    expect(result === 5.556).toBe(true);
});

test('.calculateSeparationMinimums() returns 1.852 when #lateral_dist is between 2500 and 3600', () => {
    const model = new RunwayRelationshipModel(runwayModel07lFixture, runwayModel07rFixture);
    model.lateral_dist = 1;
    const result = model.calculateSeparationMinimums();

    expect(result === 1.852).toBe(true);
});

test('.calculateSeparationMinimums() returns 2.778 when #lateral_dist is between 3601 and 8300', () => {
    const model = new RunwayRelationshipModel(runwayModel07lFixture, runwayModel07rFixture);
    model.lateral_dist = 1.1;
    const result = model.calculateSeparationMinimums();

    expect(result === 2.778).toBe(true);
});

test('.calculateSeparationMinimums() returns 3.704 when #lateral_dist is between 8301 and 9000', () => {
    const model = new RunwayRelationshipModel(runwayModel07lFixture, runwayModel07rFixture);
    model.lateral_dist = 2.6;
    const result = model.calculateSeparationMinimums();

    expect(result === 3.704).toBe(true);
});

test('.calculateSeparationMinimums() returns 5.556 when #lateral_dist is grerater than 9001', () => {
    const model = new RunwayRelationshipModel(runwayModel07lFixture, runwayModel07rFixture);
    model.lateral_dist = 5;
    const result = model.calculateSeparationMinimums();

    expect(result === 5.556).toBe(true);
});
