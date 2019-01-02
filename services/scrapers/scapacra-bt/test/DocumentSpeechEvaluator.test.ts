import { DocumentSpeechEvaluator } from '../src/parser/evaluator/DocumentSpeechEvaluator';
import fs = require('fs');
import { assert } from 'chai';
import 'mocha';
import { Validator } from 'jsonschema';


const srcFileName = 'test/data/Plenarprotokoll_19_46.xml';
const speechesJsonSchemaFileName = 'test/schemas/speeches.schema.json';

// Generated on: https://www.jsonschema.net/
const speechesJsonSchmema = JSON.parse(fs.readFileSync(speechesJsonSchemaFileName, "utf8"));

describe('Check speeches evaluator', () => {
    it('speeches should never be empty', async () => {
        let xmlReadStream = fs.createReadStream(srcFileName);
        let speechEvaluator = new DocumentSpeechEvaluator(xmlReadStream);

        let speechesAsJson = await speechEvaluator.getSpeeches();
    
        for (const speech of speechesAsJson) {
            assert.isNotNull(JSON.stringify(speech));
        }
    });

    it('speeches should match specified json schema', async () => {
        let xmlReadStream = fs.createReadStream(srcFileName);
        let speechEvaluator = new DocumentSpeechEvaluator(xmlReadStream);

        let speechesAsJson = await speechEvaluator.getSpeeches();
    
        assert.isNotEmpty(speechesAsJson);

        for (const speech of speechesAsJson) {
            let validator = new Validator();

            let validatorResult = validator.validate(speech, speechesJsonSchmema);

            assert.isTrue(validatorResult.valid, JSON.stringify(validatorResult.errors, null, 2));
        }
    });
});