import Anthropic from '@anthropic-ai/sdk';
import { log } from './logger';

const anthropic = new Anthropic();
const model = process.env.ANTHROPIC_MODEL ?? 'claude-opus-5-5';

const instructions = `
Du erhältst ein Plenarprotokoll des Deutschen Bundestages als PDF sowie vom User einen Titel und Drucksachennummern zu einer Abstimmung.
Deine Aufgabe ist es, den exakten Wortlaut des Textabschnitts zur Abstimmung wiederzugeben, genau wie er im Protokoll steht, ohne Änderungen, Umschreibungen oder zusätzliche Informationen.
Befolge die folgenden Anweisungen genau:

Beginn des Textabschnitts: Starte den Text ausschließlich ab der ersten Erwähnung der Abstimmung, die typischerweise mit „Wir kommen zur Abstimmung...“ beginnt. Überspringe alle vorhergehenden Teile, wie Einleitungen, Reden oder Diskussionen.
Ende des Textabschnitts: Der Textabschnitt endet sofort nach der Verkündung des Abstimmungsergebnisses und der entsprechenden Schlussformel, wie z.B. „Der Antrag ist damit angenommen.“ oder einer ähnlichen Formulierung. Nimm keinen weiteren Text auf, insbesondere keine Aufrufe zu neuen Tagesordnungspunkten, Zusatzpunkten oder Beratungen.
Wortwörtliche Wiedergabe: Gib den gesamten Textabschnitt ohne jegliche Änderungen, Kürzungen, Umschreibungen oder Ergänzungen wieder. Jede Form von Abweichung ist strikt zu vermeiden.
Kennzeichnung: Markiere den Textabschnitt am Anfang mit "#####" und am Ende mit "#####". Der gesamte Inhalt zwischen diesen Markierungen muss exakt dem Protokoll entsprechen.
Wenn du die Abstimmung im Protokoll nicht findest, antworte nur mit "#####NICHT GEFUNDEN#####".
`;

export const extractBetweenHashesFromBeschluss = (text: string): string => {
  const match = text.match(/#####([\s\S]*?)#####/);
  return match ? match[1].trim() : text.trim();
};

export const getBeschlusstextFromPdf = async ({
  pdf,
  title,
  drucksachen,
}: {
  pdf: string;
  title: string;
  drucksachen: string[];
}) => {
  const stream = anthropic.beta.messages.stream({
    model,
    max_tokens: 16000,
    output_config: { effort: 'medium' },
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system: instructions,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: pdf },
            // several votes of one session use the same protocol
            cache_control: { type: 'ephemeral', ttl: '1h' },
          },
          {
            type: 'text',
            text: `Titel: "${title}"\nDrucksachen: ${drucksachen.length ? drucksachen.join(', ') : 'unbekannt'}`,
          },
        ],
      },
    ],
  });
  const message = await stream.finalMessage();
  log.info({ model: message.model, stop_reason: message.stop_reason, usage: message.usage }, 'claude usage');

  if (message.stop_reason === 'refusal') {
    throw new Error('Claude refused the request');
  }
  const text = message.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('');
  if (!text) {
    throw new Error(`No text in Claude response (stop_reason: ${message.stop_reason})`);
  }
  return extractBetweenHashesFromBeschluss(text);
};

// Überprüft, ob die Domain in der Whitelist enthalten ist
const isValidDomain = (url: string): boolean => {
  const allowedDomains = process.env.ALLOWED_DOMAINS?.split(',') ?? [];
  const parsedUrl = new URL(url);
  return allowedDomains.includes(parsedUrl.origin);
};

// Lädt das PDF von einer erlaubten Domain und gibt es base64-kodiert zurück
export const fetchPdfAsBase64 = async (pdfUrl: string) => {
  const url = pdfUrl.trim();
  if (!isValidDomain(url)) {
    throw new Error('Domain ist nicht erlaubt');
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`PDF konnte nicht geladen werden (${response.status})`);
  }
  return Buffer.from(await response.arrayBuffer()).toString('base64');
};
