import fs = require('fs');
import 'mocha';

import { assert } from 'chai';
import { WebsiteHrefEvaluator } from './WebsiteHrefEvaluator';

const srcFileName = 'test/data/Plenarprotokoll_list.htm';
const urlRegex = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

describe('Check website href evaluator', () => {
    it('links should never be empty', async () => {
        let xmlReadStream = fs.createReadStream(srcFileName);
        let evaluator = new WebsiteHrefEvaluator(xmlReadStream);

        let resultAsJson = await evaluator.getSources();
        
        for (const result of resultAsJson) {
            assert.isNotNull(result);
        }
    });

    it('links should be a valid URL', async () => {
        let xmlReadStream = fs.createReadStream(srcFileName);
        let evaluator = new WebsiteHrefEvaluator(xmlReadStream);

        let resultAsJson = await evaluator.getSources();
        
        for (const result of resultAsJson) {
            assert.match(result, urlRegex);
        }
    });
});