import { DocumentEvaluater } from 'scapacra'

export = Documents_Parser_Evaluator;

namespace Documents_Parser_Evaluator {
    /**
     * Evaluates all potential votings from an Bundestag-Plenarprotokoll.
     * The underlying algorithm is only an heuristic. So the finding of all votings is not garanteed.
     */
    export class DeputyProfileEvaluator extends DocumentEvaluater {

        public getName(): Promise<any[]> {
            return this.evaluate("//h3/value()");
        }
    }
}