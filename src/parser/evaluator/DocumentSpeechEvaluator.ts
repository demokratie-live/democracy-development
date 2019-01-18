import { DocumentEvaluater } from '@democracy-deutschland/scapacra'

export = Documents_Parser_Evaluator;

namespace Documents_Parser_Evaluator {
    /**
     * Evaluates all speeches from an Bundestag-Plenarprotokoll.
     */
    export class DocumentSpeechEvaluator extends DocumentEvaluater {

        /**
         * Finds all speeches from the given Bundestag-Plenarprotokoll.
         */
        public getSpeeches(): Promise<any[]> {
            return this.evaluate("//tagesordnungspunkt/rede");
        }
    }
}