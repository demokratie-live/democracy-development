import { DocumentEvaluater } from 'scapacra'

export = Documents_Parser_Evaluator;

namespace Documents_Parser_Evaluator {
    /**
     * Evaluates all potential votings from an Bundestag-Plenarprotokoll.
     * The underlying algorithm is only an heuristic. So the finding of all votings is not garanteed.
     */
    export class DocumentVotingEvaluator extends DocumentEvaluater {
        private Keywords: string[] = [
            "stimmt dafür?",
            "stimmt dagegen?",
            "enthält sich?",
            "Gegenstimmen?",
            "Enthaltungen?",
            "Hand heben",
            "zu erheben"
        ];

        /**
         * Searching for potential votings from an Bundestag-Plenarprotokoll.
         * The underlying algorithm is only an heuristic. So the finding of all votings is not garanteed.
         *
         * @param callback 
         */
        public getPotentialVotings(): Promise<any[]> {
            return this.evaluate("//tagesordnungspunkt[p[" + this.getExpression() + "]]");
        }

        private getExpression(): string {
            let xPathContainsExpressions = this.createXPathContainsExpressions(this.Keywords);

            return xPathContainsExpressions.join(" or ");
        }

        private createXPathContainsExpressions(keywords: string[]): string[] {
            let expressions: string[] = [];
            for (const keyword of keywords) {
                expressions = expressions.concat("contains(., '" + keyword + "')");
            }
            return expressions;
        }
    }
}