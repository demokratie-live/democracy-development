import Evaluator = require("./evaluator/DocumentEvaluator");
import fs = require('fs');

const srcFileName = 'data/Plenarprotokoll_19_46.xml';

// Evaluates all speeches from the given Plenarprotokoll
let speechEvaluator = new Evaluator.DocumentSpeechEvaluator(srcFileName);
speechEvaluator.getSpeeches(speechesAsJson =>{
    for (const speech of speechesAsJson) {      
        fs.writeFileSync('speeches/' + speech.id + '.json', JSON.stringify(speech));
    }
});

// Evaluates all potential votings from the given Plenarprotokoll
let votingEvaluator = new Evaluator.DocumentVotingEvaluator(srcFileName);
votingEvaluator.getPotentialVotings(votingsAsJson =>{
    for (const voting of votingsAsJson) { 
        fs.writeFileSync('votings/' + voting["top-id"] + '.json', JSON.stringify(voting));
    }
});