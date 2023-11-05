import { DocumentEvaluater } from '@democracy-deutschland/scapacra';

/**
 * Evaluates all potential votings from an Bundestag-Plenarprotokoll.
 * The underlying algorithm is only an heuristic. So the finding of all votings is not guaranteed.
 */
export class DocumentVotingEvaluator extends DocumentEvaluater {
  private Keywords: string[] = [
    'stimmt dafür?',
    'stimmt dagegen?',
    'enthält sich?',
    'Gegenstimmen?',
    'Enthaltungen?',
    'Hand heben',
    'zu erheben',
  ];

  /**
   * Searching for potential votings from an Bundestag-Plenarprotokoll.
   * The underlying algorithm is only an heuristic. So the finding of all votings is not guaranteed.
   *
   * @param callback
   */
  public async getPotentialVotings(): Promise<Element[]> {
    const result = await this.evaluate('//tagesordnungspunkt[p[' + this.getExpression() + ']]');
    return result || [];
  }

  private getExpression(): string {
    const xPathContainsExpressions = this.createXPathContainsExpressions(this.Keywords);

    return xPathContainsExpressions.join(' or ');
  }

  private createXPathContainsExpressions(keywords: string[]): string[] {
    let expressions: string[] = [];
    for (const keyword of keywords) {
      expressions = expressions.concat("contains(., '" + keyword + "')");
    }
    return expressions;
  }
}
