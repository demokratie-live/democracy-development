import { Xml } from '../browser/PlenarProtocolBrowser';
import { IDataPackage, IParser } from 'scapacra';
import { DocumentSpeechEvaluator } from '../parser/evaluator/DocumentSpeechEvaluator';

export = Documents_Parser;

namespace Documents_Parser {
    /**
     * This parser gets all speeches from a "Plenarprotokoll" of the german Bundestag.
     */
    export class ProtocolSpeechesParser implements IParser<Xml>{
        public async parse(data: IDataPackage<Xml>): Promise<IDataPackage<JSON>[]> {
            let readableStream = data.data.openStream();
            
            let speechEvaluator = new DocumentSpeechEvaluator(readableStream);
            
            let speeches = await speechEvaluator.getSpeeches();

            return speeches.map(speech => {
                return {
                    metadata: data.metadata,
                    data: speech
                }
            });
        }
    }
}