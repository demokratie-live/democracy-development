/* eslint-disable @typescript-eslint/no-explicit-any */
export const getVoteNumber = (
  type: 'ja' | 'nein' | 'enthalten' | 'na',
  { votesElement, $ }: { votesElement: any; $: any },
) =>
  Number(
    $(votesElement.find(`.bt-legend-${type}`))
      .text()
      .replace(/\D/g, '')
      .trim(),
  );
