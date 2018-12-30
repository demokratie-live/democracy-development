import xpath = require('xpath');
import xdom = require('xmldom');
import readline = require('readline');
import xml2js = require('xml2js');

export = Documents_Parser_Evaluator;

namespace Documents_Parser_Evaluator {
    /**
     * Evaluates a xPath-Expression to a xml document and returning the matching content as JSON.
     */
    export class DocumentEvaluater {
        private readableStream: NodeJS.ReadableStream;

        private xml2jsOptions = {
            explicitRoot: false,
            explicitArray: false,
            mergeAttrs: true
        };

        /**
         * Evaluates a xPath-Expression to a xml document and returning the matching content as JSON.
         * 
         * @param readableStream Stream of the xml document. 
         */
        constructor(readableStream: NodeJS.ReadableStream) {
            this.readableStream = readableStream;
        }

        public evaluate(xPathExpression: string, callback: (elementsAsJson: any[]) => void) {
            this.removeXmlHeader(this.readableStream, xml => {
                let parser = new xdom.DOMParser();
                let doc = parser.parseFromString(xml);

                let nodes = xpath.select(xPathExpression, doc);

                let elements: any[] = [];
                for (const node of nodes) {    
                    elements = elements.concat(this.getValueFromSelectedNode(node));
                }

                callback(elements);
            });
        }

        protected getValueFromSelectedNode(node: xpath.SelectedValue): any {
            let value: any; 
            xml2js.parseString(node, this.xml2jsOptions, (err: any, result: any) => value = result);
            return value;            
        }

        /**
         * Removes the stylesheet definition and doctype declarion from the xml document to
         * garentee a proper xPath evaluation.   
         */
        private removeXmlHeader(stream: NodeJS.ReadableStream, callback: (xml: string) => void): void {
            var rl = readline.createInterface(stream);
            let output: string;

            rl.on('line', (line) => {
                let isDeclarationHeader = line.match(/^\<(\?|\!).*$/);

                if (isDeclarationHeader == null) {
                    output += line + '\n';
                }
            }).on('close', () => {
                callback(output);
            });
        }
    }
}