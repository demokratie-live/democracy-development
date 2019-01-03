import xdom = require('xmldom');
import xml2js = require('xml2js');
import xpath = require('xpath');
import readline = require('readline');

export = Documents_Evaluator;

namespace Documents_Evaluator {
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

        public async evaluate(xPathExpression: string): Promise<any[]> {
            let xml = await this.removeXmlHeader(this.readableStream);

            let parser = new xdom.DOMParser();
            let doc = parser.parseFromString(xml);

            let nodes = xpath.select(xPathExpression, doc);

            let elements: any[] = [];
            for (const node of nodes) {
                let value = await this.getValueFromSelectedNode(node);
                elements = elements.concat(value);
            }

            return elements;
        }

        protected getValueFromSelectedNode(node: xpath.SelectedValue): Promise<any> {
            return new Promise((resolve, reject) => {
                xml2js.parseString(node, this.xml2jsOptions, (err: any, result: any) => {
                    if (err == null) {
                        resolve(result);
                    } else {
                        reject(err);
                    }
                });
            });       
        }

        /**
         * Removes the stylesheet definition and doctype declarion from the xml document to
         * garentee a proper xPath evaluation.   
         */
        private async removeXmlHeader(stream: NodeJS.ReadableStream): Promise<string> {
            return new Promise((resolve) => {
                var rl = readline.createInterface(stream);
                let output: string;

                rl.on('line', (line) => {
                    let isDeclarationHeader = line.match(/^\<(\?|\!).*$/);

                    if (isDeclarationHeader == null) {
                        output += line + '\n';
                    }
                }).on('close', () => {
                    resolve(output);
                });
            });
        }
    }
}