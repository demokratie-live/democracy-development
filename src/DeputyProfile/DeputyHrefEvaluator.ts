import xpath = require('xpath');
import { DocumentEvaluater } from '@democracy-deutschland/scapacra'

export = Evaluator;

namespace Evaluator {
    /**
     * Evaluates all href attributes from html list.
     */
    export class DeputyHrefEvaluator extends DocumentEvaluater {

        /**
         * Finds all href links from the HTML website.
         */
        public getSources(): Promise<any[]> {
            return this.evaluate("//a[@class='bt-open-in-overlay']/@href");
        }

        protected getValueFromSelectedNode(node: xpath.SelectedValue): any {
            let attr = <Attr>node;
            return attr.value;
        }

        // Ignore HTML parse errors (like &nbsp;)
        protected xmlDOMErrorCallback(msg: String) {
            return;
        }
    }
}