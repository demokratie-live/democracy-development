import { DocumentEvaluater } from './DocumentEvaluator'

export = Documents_Parser_Evaluator;

namespace Documents_Parser_Evaluator {
    /**
     * Evaluates all speeches from an Bundestag-Plenarprotokoll.
     */
    export class DocumentSpeechEvaluator extends DocumentEvaluater {

        /**
         * Finds all speeches from the given Bundestag-Plenarprotokoll.
         */
        public getSpeeches(callback: (speechAsJson: any[]) => void) {
            this.evaluate("//tagesordnungspunkt/rede", callback);
        }
    }
}