import { Xml } from '../browser/PlenarProtocolBrowser';
import { IParser } from '../importer/Parser';
import { DocumentSpeechEvaluator } from '../parser/evaluator/DocumentSpeechEvaluator';

export = Documents_Parser;

namespace Documents_Parser {
    /**
     * This parser gets all speeches from a "Plenarprotokoll" of the german Bundestag.
     */
    export class ProtocolSpeechesParser implements IParser<Xml>{
        public parse(content: Xml, callback: (json: JSON[]) => void): void {
            let readableStream = content.openStream();
            
            let speechEvaluator = new DocumentSpeechEvaluator(readableStream);
            
            speechEvaluator.getSpeeches(speechesAsJson => callback(speechesAsJson));
        }
    }
}