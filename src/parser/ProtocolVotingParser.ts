import { Xml } from '../browser/PlenarProtocolBrowser';
import { IDataPackage, IParser } from 'scapacra';
import { DocumentVotingEvaluator } from '../parser/evaluator/DocumentVotingEvaluator';

export = Documents_Parser;

namespace Documents_Parser {
    /**
     * This parser gets all potention fraction votings from a "Plenarprotokoll" of the german Bundestag.
     */
    export class ProtocolVotingParser implements IParser<Xml>{
        public async parse(data: IDataPackage<Xml>): Promise<IDataPackage<JSON>[]> {
            let readableStream = data.data.openStream();

            let votingEvaluator = new DocumentVotingEvaluator(readableStream);

            let votings = await votingEvaluator.getPotentialVotings();

            return votings.map(voting => {
                return {
                    metadata: data.metadata,
                    data: voting
                }
            });
        }
    }
}