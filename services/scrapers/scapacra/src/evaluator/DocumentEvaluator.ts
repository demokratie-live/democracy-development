import { DOMParser } from 'xmldom';
import { parseString } from 'xml2js';
import * as xpath from 'xpath';
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
      mergeAttrs: true,
    };

    /**
     * Evaluates a xPath-Expression to a xml document and returning the matching content as JSON.
     *
     * @param readableStream Stream of the xml document.
     */
    constructor(readableStream: NodeJS.ReadableStream) {
      this.readableStream = readableStream;
    }

    protected xmlDOMErrorCallback(msg: string): void {
      console.log(`[xmldom error]: ${msg}`);
    }
    protected xmlDOMFatalErrorCallback(msg: string): void {
      console.log(`[xmldom error]: ${msg}`);
    }
    protected xmlDOMWarningCallback(msg: string): void {
      console.log(`[xmldom warning]: ${msg}`);
    }

    public async evaluate(xPathExpression: string): Promise<any[] | undefined> {
      const xml = await this.removeXmlHeader(this.readableStream);

      const parser = new DOMParser({
        /**
         * locator is always need for error position info
         */
        locator: {},
        /**
         * you can override the errorHandler for xml parser
         * @link http://www.saxproject.org/apidoc/org/xml/sax/ErrorHandler.html
         */
        errorHandler: {
          warning: this.xmlDOMWarningCallback,
          error: this.xmlDOMErrorCallback,
          fatalError: this.xmlDOMFatalErrorCallback,
        },
      });
      const doc = parser.parseFromString(xml);

      const nodes = xpath.select(xPathExpression, doc) as any[];

      let elements: any[] = [];
      if (nodes) {
        for (const node of nodes) {
          const value = await this.getValueFromSelectedNode(node);
          elements = elements.concat(value);
        }

        return elements;
      }
    }

    protected getValueFromSelectedNode(node: xpath.SelectedValue): Promise<any> {
      return new Promise((resolve, reject) => {
        if (node == null) {
          return resolve(null);
        }

        parseString(node, this.xml2jsOptions, (err: any, result: any) => {
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
        const rl = readline.createInterface(stream);
        let output: string;

        rl.on('line', (line) => {
          const isDeclarationHeader = line.match(/^\<(\?|\!).*$/);

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
