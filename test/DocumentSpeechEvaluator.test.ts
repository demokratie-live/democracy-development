import { DocumentSpeechEvaluator } from '../src/evaluator/DocumentEvaluator';
import fs = require('fs');
import { assert } from 'chai';
import 'mocha';
import { Validator } from 'jsonschema';


const srcFileName = 'test/data/Plenarprotokoll_19_46.xml';
const speechesJsonSchemaFileName = 'test/schemas/speeches.schema.json';

// Generated on: https://www.jsonschema.net/
const speechesJsonSchmema = JSON.parse(fs.readFileSync(speechesJsonSchemaFileName, "utf8"));

describe('Check speeches evaluator', () => {

  it('speeches should never be empty', (done) => {
    let speechEvaluator = new DocumentSpeechEvaluator(srcFileName);
    
    speechEvaluator.getSpeeches(speechesAsJson => {
      for (const speech of speechesAsJson) {
        assert.isNotNull(JSON.stringify(speech));
      }

      done();
    });
  });

  it('speeches should match specified json schema', (done) => {
    let speechEvaluator = new DocumentSpeechEvaluator(srcFileName);
    
    speechEvaluator.getSpeeches(speechesAsJson => {
      for (const speech of speechesAsJson) {
        let validator = new Validator();

        let validatorResult = validator.validate(speech, speechesJsonSchmema);

        assert.isTrue(validatorResult.valid, JSON.stringify(validatorResult.errors, null, 2));
      }

      done();
    });
  });
});