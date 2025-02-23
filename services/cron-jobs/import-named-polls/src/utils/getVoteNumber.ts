/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElementHandle } from 'playwright';

export const getVoteNumber = async (
  type: 'ja' | 'nein' | 'enthalten' | 'na',
  { votesElement }: { votesElement: ElementHandle },
) => {
  const voteElement = await votesElement.$(`.bt-legend-${type}`);
  const voteText = (await voteElement?.textContent()) || '0';
  return Number(voteText.replace(/\D/g, '').trim());
};
