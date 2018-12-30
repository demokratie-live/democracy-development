import xpath = require('xpath');
import { DocumentEvaluater } from './DocumentEvaluator'

export = Documents_Parser_Evaluator;

namespace Documents_Parser_Evaluator {
    /**
     * Evaluates all href attributes from html list.
     */
    export class WebsiteHrefEvaluator extends DocumentEvaluater {

        /**
         * Finds all href links from the HTML website.
         */
        public getSources(callback: (resultAsJson: any[]) => void) {
            this.evaluate("//a[@class='bt-link-dokument']/@href", callback);
        }

        protected getValueFromSelectedNode(node: xpath.SelectedValue): any {
            let attr = <Attr>node;
            return attr.value;
        }
    }
}