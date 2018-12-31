import * as fs from 'fs';
import { URL } from 'url';

import { DocumentSpeechEvaluator } from './parser/evaluator/DocumentSpeechEvaluator';
import { DocumentVotingEvaluator } from './parser/evaluator/DocumentVotingEvaluator';
import { ProposedDecisionBrowser } from '../src/browser/ProposedDecisionBrowser';

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

async function foo() {
    let browser = new ProposedDecisionBrowser({maxCount: 5});
    browser.setUrl(new URL("https://www.bundestag.de"));
    for (const pdf of browser) {
        await pdf.then(result => {
            var rstream = result.openStream();
            var wstream = fs.createWriteStream(`out/proposedDecisions/${Date.now()}.pdf`);
            rstream.pipe(wstream);
        });
    }
}

foo().then( c => { console.log( c ); } );