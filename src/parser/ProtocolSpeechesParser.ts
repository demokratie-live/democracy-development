import { Xml } from '../browser/PlenarProtocolBrowser';
import { IParser } from 'scapacra';
import { DocumentSpeechEvaluator } from '../parser/evaluator/DocumentSpeechEvaluator';

export = Documents_Parser;

namespace Documents_Parser {
    /**
     * This parser gets all speeches from a "Plenarprotokoll" of the german Bundestag.
     */
    export class ProtocolSpeechesParser implements IParser<Xml>{
        public async parse(content: Xml): Promise<JSON[]> {
            let readableStream = content.openStream();
            
            let speechEvaluator = new DocumentSpeechEvaluator(readableStream);
            
            return await speechEvaluator.getSpeeches();
        }
    }
}