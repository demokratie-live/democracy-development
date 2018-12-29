import { DocumentVotingEvaluator } from '../src/evaluator/DocumentEvaluator';
import fs = require('fs');
import { assert } from 'chai';
import 'mocha';
import { Validator } from 'jsonschema';

const srcFileName = 'test/data/Plenarprotokoll_19_46.xml';
const votingsJsonSchemaFileName = 'test/schemas/votings.schema.json';

// Generated on: https://www.jsonschema.net/
const votingsJsonSchmema = JSON.parse(fs.readFileSync(votingsJsonSchemaFileName, "utf8"));

describe('Check voting evaluator', () => {

  it('votings should never be empty', (done) => {
    let votingsEvaluator = new DocumentVotingEvaluator(srcFileName);
    
    votingsEvaluator.getPotentialVotings(votingsAsJson => {
      for (const voting of votingsAsJson) {
        assert.isNotNull(JSON.stringify(voting));
      }

      done();
    });
  });

  it('votings should match specified json schema', (done) => {
    let votingsEvaluator = new DocumentVotingEvaluator(srcFileName);
    
    votingsEvaluator.getPotentialVotings(votingsAsJson => {
      for (const voting of votingsAsJson) {
        let validator = new Validator();

        let validatorResult = validator.validate(voting, votingsJsonSchmema);

        assert.isTrue(validatorResult.valid, JSON.stringify(validatorResult.errors, null, 2));
      }

      done();
    });
  });
});