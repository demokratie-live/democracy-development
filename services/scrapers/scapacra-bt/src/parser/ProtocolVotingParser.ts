import { Xml } from '../browser/PlenarProtocolBrowser';
import { IParser } from '../importer/Parser';
import { DocumentVotingEvaluator } from '../parser/evaluator/DocumentVotingEvaluator';

export = Documents_Parser;

namespace Documents_Parser {
    /**
     * This parser gets all potention fraction votings from a "Plenarprotokoll" of the german Bundestag.
     */
    export class ProtocolVotingParser implements IParser<Xml>{
        public async parse(content: Xml): Promise<JSON[]> {
            let readableStream = content.openStream();
            
            let votingEvaluator = new DocumentVotingEvaluator(readableStream);
            
            return await votingEvaluator.getPotentialVotings();
        }
    }
}