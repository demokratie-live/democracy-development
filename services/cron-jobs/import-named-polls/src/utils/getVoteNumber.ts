import { Cheerio, CheerioAPI, Element } from 'cheerio';

export const getVoteNumber = (
  type: 'ja' | 'nein' | 'enthalten' | 'na',
  { votesElement, $ }: { votesElement: Cheerio<Element>; $: CheerioAPI },
) =>
  Number(
    $(votesElement.find(`.bt-legend-${type}`))
      .text()
      .replace(/\D/g, '')
      .trim(),
  );
