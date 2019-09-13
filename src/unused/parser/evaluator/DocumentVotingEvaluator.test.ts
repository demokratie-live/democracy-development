import { DocumentVotingEvaluator } from './DocumentVotingEvaluator';
import fs = require('fs');
import { assert } from 'chai';
import 'mocha';
import { Validator } from 'jsonschema';

const srcFileName = 'test/data/Plenarprotokoll_19_46.xml';
const votingsJsonSchemaFileName = 'test/schemas/votings.schema.json';

// Generated on: https://www.jsonschema.net/
const votingsJsonSchmema = JSON.parse(fs.readFileSync(votingsJsonSchemaFileName, "utf8"));

describe('Check voting evaluator', () => {
    it('votings should never be empty', async () => {
        let xmlReadStream = fs.createReadStream(srcFileName);
        let votingsEvaluator = new DocumentVotingEvaluator(xmlReadStream);

        let votingsAsJson = await votingsEvaluator.getPotentialVotings();

        for (const voting of votingsAsJson) {
            assert.isNotNull(JSON.stringify(voting));
        }
    });

    it('votings should match specified json schema', async () => {
        let xmlReadStream = fs.createReadStream(srcFileName);
        let votingsEvaluator = new DocumentVotingEvaluator(xmlReadStream);

        let votingsAsJson = await votingsEvaluator.getPotentialVotings();
        assert.isNotEmpty(votingsAsJson);

        for (const voting of votingsAsJson) {
            let validator = new Validator();

            let validatorResult = validator.validate(voting, votingsJsonSchmema);

            assert.isTrue(validatorResult.valid, JSON.stringify(validatorResult.errors, null, 2));
        }
    });
});