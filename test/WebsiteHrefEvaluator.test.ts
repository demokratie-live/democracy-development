import fs = require('fs');
import 'mocha';

import { assert } from 'chai';
import { WebsiteHrefEvaluator } from '../src/parser/evaluator/WebsiteHrefEvaluator';

const srcFileName = 'test/data/Plenarprotokoll_list.htm';
const urlRegex = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

describe('Check website href evaluator', () => {
    it('links should never be empty', (done) => {
        let xmlReadStream = fs.createReadStream(srcFileName);
        let evaluator = new WebsiteHrefEvaluator(xmlReadStream);

        evaluator.getSources(resultAsJson => {
            for (const result of resultAsJson) {
                assert.isNotNull(result);
            }

            done();
        });
    });

    it('links should be a valid URL', (done) => {
        let xmlReadStream = fs.createReadStream(srcFileName);
        let evaluator = new WebsiteHrefEvaluator(xmlReadStream);

        evaluator.getSources(resultAsJson => {
            for (const result of resultAsJson) {
                assert.match(result, urlRegex);
            }

            done();
        });
    });
});