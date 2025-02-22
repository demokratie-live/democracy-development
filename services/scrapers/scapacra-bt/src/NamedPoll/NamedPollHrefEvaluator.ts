import { DocumentEvaluater } from '@democracy-deutschland/scapacra';
import { SelectedValue } from 'xpath';

export class NamedPollHrefEvaluator extends DocumentEvaluater<string> {
  /**
   * Finds all href links from the HTML website.
   */
  public async getSources(): Promise<string[]> {
    const sources = await this.evaluate("//a[@class='bt-link-dokument']/@href");
    return sources || [];
  }

  protected async getValueFromSelectedNode(node: SelectedValue): Promise<string> {
    const attr = node as Attr;
    return attr.value;
  }

  // Ignore HTML parse errors (like &nbsp;)
  protected xmlDOMErrorCallback(): void {
    return;
  }
}
