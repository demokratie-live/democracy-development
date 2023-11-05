import { DocumentEvaluater } from '@democracy-deutschland/scapacra';

/**
 * Evaluates all speeches from an Bundestag-Plenarprotokoll.
 */
export class DocumentSpeechEvaluator extends DocumentEvaluater {
  /**
   * Finds all speeches from the given Bundestag-Plenarprotokoll.
   */
  public async getSpeeches(): Promise<Node[]> {
    const speeches = await this.evaluate('//tagesordnungspunkt/rede');
    return speeches || [];
  }
}
