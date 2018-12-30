import * as fs from 'fs';

import { DocumentSpeechEvaluator } from './parser/evaluator/DocumentSpeechEvaluator';
import { DocumentVotingEvaluator } from './parser/evaluator/DocumentVotingEvaluator';

const srcFileName = 'test/data/Plenarprotokoll_19_46.xml';

let xmlReadStream = fs.createReadStream(srcFileName);

// Evaluates all speeches from the given Plenarprotokoll
let speechEvaluator = new DocumentSpeechEvaluator(xmlReadStream);
speechEvaluator.getSpeeches(speechesAsJson => {
    for (const speech of speechesAsJson) {
        fs.writeFileSync('out/speeches/' + speech.id + '.json', JSON.stringify(speech));
    }
});

// Evaluates all potential votings from the given Plenarprotokoll
let votingEvaluator = new DocumentVotingEvaluator(xmlReadStream);
votingEvaluator.getPotentialVotings(votingsAsJson => {
    for (const voting of votingsAsJson) {
        fs.writeFileSync('out/votings/' + voting["top-id"] + '.json', JSON.stringify(voting));
    }
});