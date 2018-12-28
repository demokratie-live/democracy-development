import xpath = require('xpath');
import xdom = require('xmldom');
import fs = require('fs');
import readline = require('readline');
import xml2js = require('xml2js');

export = bt_Documents_evaluator;

namespace bt_Documents_evaluator {
    /**
     * Evaluates a xPath-Expression to a xml document and returning the matching content as JSON.
     */
    export class DocumentEvaluater {
        private readableStream: NodeJS.ReadableStream;

        /**
         * Evaluates a xPath-Expression to a xml document and returning the matching content as JSON.
         * 
         * @param fileName 
         */
        constructor(fileName: string) {
            this.readableStream = fs.createReadStream(fileName);
        }

        public evaluate(xPathExpression: string, callback: (speechAsJson: any[]) => void) {
            this.removeXmlHeader(this.readableStream, xml => {
                let parser = new xdom.DOMParser();
                let doc = parser.parseFromString(xml);

                let nodes = xpath.select(xPathExpression, doc);

                let speeches: any[] = [];
                for (const node of nodes) {
                    xml2js.parseString(
                        node,
                        {
                            explicitRoot: false,
                            explicitArray: false,
                            mergeAttrs: true
                        },
                        (err: any, result: any) => {
                            speeches = speeches.concat(result);
                        }
                    );
                }

                callback(speeches);
            });
        }

        /**
         * Removes the stylesheet definition and doctype declarion from the xml document to
         * garentee a proper xPath evaluation.   
         */
        private removeXmlHeader(stream: NodeJS.ReadableStream, callback: (xml: string) => void): void {
            var rl = readline.createInterface(stream);
            var lineCount = 0;

            let output: string;

            rl.on('line', (line) => {
                if (lineCount > 2) {
                    output += line + '\n';
                }
                lineCount++;
            }).on('close', () => {
                callback(output);
            });
        }
    }

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
        public getPotentialVotings(callback: (speechAsJson: any[]) => void) {
            this.evaluate("//tagesordnungspunkt[p[" + this.getExpression() + "]]", callback);
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