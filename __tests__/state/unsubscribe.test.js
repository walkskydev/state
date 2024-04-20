import { describe, it } from 'mocha';
import { assert } from 'chai';
import State from '../../src/index.js';

import {mutations as m, initial, mutations} from './mocks.js';


describe('subscribe & unsubscribe', () => {
    const mutations = {...m};

    const state = new State({...initial});
    const values = state.getState();

    const stringFieldCb = () => {values.stringField; mutations.stringField += 1}
    const arrayFieldCb = () => {values.arrayField; mutations.arrayField += 1}
    const objectFieldCb = () => {values.objectField; mutations.objectField += 1}
    const booleanFieldCb = () => {values.booleanField; mutations.booleanField += 1}
    const numberFieldCb = () => {values.numberField; mutations.numberField += 1}
    const allCb = () => {
        values.stringField;
        values.arrayField;
        values.objectField;
        values.booleanField;
        values.numberField;

        mutations.stringField +=  1;
        mutations.numberField +=  1;
        mutations.booleanField +=  1;
        mutations.arrayField +=  1;
        mutations.objectField +=  1;
    }

    const unsubscribeString = state.subscribe(stringFieldCb);
    const unsubscribeArray = state.subscribe(arrayFieldCb);
    const unsubscribeObject = state.subscribe(objectFieldCb);
    const unsubscribeBoolean = state.subscribe(booleanFieldCb);
    const unsubscribeNumber = state.subscribe(numberFieldCb);
    const unsubscribeAll = state.subscribe(allCb);

    it('subscription to multiple fields should run all effected callbacks', () => {

        assert.deepEqual(mutations, {
            stringField: 2,
            arrayField: 2,
            objectField: 2,
            booleanField: 2,
            numberField: 2,
        });

        state.setState({
            numberField: 100
        })





    });



})