/* eslint-disable arrow-parens, max-len, import/no-extraneous-dependencies */
import { test, expect, vi } from 'vitest';

import AircraftCommandModel from '../../../src/assets/scripts/client/commands/aircraftCommand/AircraftCommandModel';


test('does not thow when instantiated without parameters', () => {
    expect(() => new AircraftCommandModel()).not.toThrow();
});

// test('#parsedArgs returns a string if the arg is a string', () => {
//     const model = new AircraftCommandModel('heading');
//     model.args.push('right');
//
//     expect(typeof model.parsedArgs[0] === 'string').toBe(true);
// });
//
// test('#parsedArgs returns a number if the arg is a number', () => {
//     const model = new AircraftCommandModel('heading');
//     model.args.push('180');
//
//     expect(typeof model.parsedArgs[0] === 'number').toBe(true);
// });
//
// test('#parsedArgs returns a string padded by 0 if original arg is padded by 0', () => {
//     const model = new AircraftCommandModel('heading');
//     model.args.push('090');
//
//     expect(model.parsedArgs[0] === '090').toBe(true);
// });
