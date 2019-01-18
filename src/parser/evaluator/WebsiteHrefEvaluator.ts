import xpath = require('xpath');
import { DocumentEvaluater } from '@democracy-deutschland/scapacra'

export = Documents_Parser_Evaluator;

namespace Documents_Parser_Evaluator {
    /**
     * Evaluates all href attributes from html list.
     */
    export class WebsiteHrefEvaluator extends DocumentEvaluater {

        /**
         * Finds all href links from the HTML website.
         */
        public getSources(): Promise<any[]> {
            return this.evaluate("//a[@class='bt-link-dokument']/@href");
        }

        protected getValueFromSelectedNode(node: xpath.SelectedValue): any {
            let attr = <Attr>node;
            return attr.value;
        }
    }
}