import { Xml } from '../importer/Scraper';
import { IParser } from '../importer/Parser';
import { DocumentVotingEvaluator } from '../parser/evaluator/DocumentVotingEvaluator';

export = Documents_Parser;

namespace Documents_Parser {
    /**
     * This parser gets all potention fraction votings from a "Plenarprotokoll" of the german Bundestag.
     */
    export class ProtocolVotingParser implements IParser<Xml>{
        public parse(content: Xml, callback: (json: JSON[]) => void): void {
            let readableStream = content.openStream();
            
            let votingEvaluator = new DocumentVotingEvaluator(readableStream);
            
            votingEvaluator.getPotentialVotings(votingsAsJson => callback(votingsAsJson));
        }
    }
}