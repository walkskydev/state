import { describe, it } from 'mocha';
import { assert } from 'chai';
import State from '../../index.js';

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

    it('subscriber to multiple fields should run all effected callbacks', () => {

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


        // number fire 2 subscribers now: All & number
        assert.deepEqual(mutations, {
            stringField: 3,
            arrayField: 3,
            objectField: 3,
            booleanField: 3,
            numberField: 4 // allCb & numbCb
        });


    });

    it('after unsubscribe listener should not execute again', () => {
        unsubscribeString();
        state.setState({stringField: 'banana'})

        assert.deepEqual(mutations, {
            stringField: 4, // allCb
            arrayField: 4,
            objectField: 4,
            booleanField: 4,
            numberField: 5
        })

        state.setState({arrayField: ['pinaple']})

        assert.deepEqual(mutations, {
            stringField: 5, // arrayCb
            arrayField: 6, // allCb & arrayCb
            objectField: 5,
            booleanField: 5,
            numberField:6
        })

    })

    it('should unsubscribe all listeners except all dependencies listener', () => {
            unsubscribeArray();
            unsubscribeObject();
            unsubscribeBoolean();
            unsubscribeNumber();

            state.setState({
                stringField: 'new value',
                arrayField: ['new value'],
                objectField: { innerField1: 'new value' },
                booleanField: false,
                numberField: 99
            });

            assert.deepEqual(mutations, {
                stringField: 6,
                arrayField: 7,
                objectField: 6,
                booleanField: 6,
                numberField: 7
            });
        });


    it('All subscribers should be removed', () => {
        unsubscribeAll()
        state.setState({arrayField: []});

        assert.deepEqual(mutations, {
                stringField: 6,
                arrayField: 7,
                objectField: 6,
                booleanField: 6,
                numberField: 7
            });

    })

    it('should not execute any callback after all subscribers are removed', () => {
        state.setState({stringField: 'new value'});
        state.setState({arrayField: ['new value']});
        state.setState({objectField: { innerField1: 'new value' }});
        state.setState({booleanField: false});
        state.setState({numberField: 99});

        assert.deepEqual(mutations, {
            stringField: 6,
            arrayField: 7,
            objectField: 6,
            booleanField: 6,
            numberField: 7
        });
    });

    it("same callback can subscribe again", () => {
        const unsubscribeString2 = state.subscribe(stringFieldCb);

        // stringFieldCb executed on init
        assert.deepEqual(mutations, {
            stringField: 7, //stringFieldCb
            arrayField: 7,
            objectField: 6,
            booleanField: 6,
            numberField: 7
        });

        state.setState({stringField: 'new value 1'});

        assert.deepEqual(mutations, {
            stringField: 8,
            arrayField: 7,
            objectField: 6,
            booleanField: 6,
            numberField: 7
        });

        unsubscribeString2();
    })
})