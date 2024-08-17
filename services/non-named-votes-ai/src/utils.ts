import OpenAI from 'openai';
import { Assistant } from 'openai/resources/beta/assistants';
import { MessagesPage } from 'openai/resources/beta/threads/messages';
import { VectorStore } from 'openai/resources/beta/vector-stores/vector-stores';
import { log } from './logger';
import { INonNamedVotesAi, NonNamedVotesAiModel } from '@democracy-deutschland/bundestagio-common';
import { ObjectId } from 'mongoose';
import { FileObject } from 'openai/resources';
import { Thread } from 'openai/resources/beta/threads/threads';

export const openai = new OpenAI();
const name = process.env.NAME ?? 'Non-Named Votes AI';

export const retriveAssistant = async (assistantId: string) =>
  await openai.beta.assistants.retrieve(assistantId).catch(() => undefined);
export const createAssistant = async ({ vector_store_id }: { vector_store_id: string }) =>
  await openai.beta.assistants.create({
    name,
    instructions: `
Du erhältst vom User einen Titel und eine Dokumentennummer zu einer Abstimmung aus dem Plenarsaalprotokoll des Deutschen Bundestages.
Deine Aufgabe ist es, den exakten Wortlaut des Textabschnitts zur Abstimmung wiederzugeben, genau wie er im Protokoll steht, ohne Änderungen, Umschreibungen oder zusätzliche Informationen.
Befolge die folgenden Anweisungen genau:

Beginn des Textabschnitts: Starte den Text ausschließlich ab der ersten Erwähnung der Abstimmung, die typischerweise mit „Wir kommen zur Abstimmung...“ beginnt. Überspringe alle vorhergehenden Teile, wie Einleitungen, Reden oder Diskussionen.
Ende des Textabschnitts: Der Textabschnitt endet sofort nach der Verkündung des Abstimmungsergebnisses und der entsprechenden Schlussformel, wie z.B. „Der Antrag ist damit angenommen.“ oder einer ähnlichen Formulierung. Nimm keinen weiteren Text auf, insbesondere keine Aufrufe zu neuen Tagesordnungspunkten, Zusatzpunkten oder Beratungen.
Wortwörtliche Wiedergabe: Gib den gesamten Textabschnitt ohne jegliche Änderungen, Kürzungen, Umschreibungen oder Ergänzungen wieder. Jede Form von Abweichung ist strikt zu vermeiden.
Vermeidung von zusätzlichen Inhalten: Wenn nach der Abstimmung ein neuer Punkt oder Zusatzpunkt aufgerufen wird, beende die Ausgabe des Textes sofort vor diesem Aufruf. Der relevante Abschnitt endet direkt nach der Abstimmung, bevor ein neuer Punkt beginnt.
Kennzeichnung: Markiere den Textabschnitt am Anfang mit "#####" und am Ende mit "#####". Der gesamte Inhalt zwischen diesen Markierungen muss exakt dem Protokoll entsprechen und darf keinen Text enthalten, der nach dem Ende der Abstimmung kommt.

        `,

    model: 'gpt-4o',
    tools: [{ type: 'file_search' }],
    tool_resources: { file_search: { vector_store_ids: [vector_store_id] } },
    temperature: 0,
  });
export const ensureAssistantId = async ({
  vector_store_id,
  assistant_id,
}: {
  vector_store_id: string;
  assistant_id?: string;
}) => {
  let assistant: Assistant | undefined = undefined;
  if (assistant_id) {
    assistant = await retriveAssistant(assistant_id);
  }

  if (!assistant) {
    assistant = await createAssistant({ vector_store_id });
  }
  return assistant;
};

export const retriveFile = async (fileId: string) => await openai.files.retrieve(fileId).catch(() => undefined);
export const createFile = async ({ pdfUrl }: { pdfUrl: string }) =>
  await openai.files.create({
    file: await validateAndFetchFile(pdfUrl),
    purpose: 'assistants',
  });
export const ensureFile = async ({ pdfUrl, file_id }: { pdfUrl: string; file_id?: string }) => {
  let file = undefined;
  if (file_id) {
    file = await retriveFile(file_id);
  }

  if (!file) {
    file = await createFile({ pdfUrl });
  }

  return file;
};

export const retriveVectorStore = async (vectorStoreId: string) =>
  await openai.beta.vectorStores.retrieve(vectorStoreId).catch(() => undefined);
export const createVectorStore = async ({ file_ids }: { file_ids: string[] }) => {
  const vectorStore = await openai.beta.vectorStores.create({});

  await openai.beta.vectorStores.fileBatches.createAndPoll(vectorStore.id, {
    file_ids,
  });
  return vectorStore;
};
export const ensureVectorStore = async ({
  file_id,
  vector_store_id,
}: {
  file_id: string;
  vector_store_id?: string;
}) => {
  let vectorStore: VectorStore | undefined = undefined;
  if (vector_store_id) {
    vectorStore = await retriveVectorStore(vector_store_id);
  }

  if (!vectorStore) {
    vectorStore = await createVectorStore({ file_ids: [file_id] });
  }

  return vectorStore;
};

export const createThread = async ({ title, drucksachen }: { title: string; drucksachen?: string[] }) =>
  await openai.beta.threads.create({
    messages: [
      {
        role: 'user',
        content: `Titel: "${title}" 
          Drucksachen: ${drucksachen?.join(', ')}`,
        // Attach the new file to the message.
        // attachments: [{ file_id: fileId, tools: [{ type: 'file_search' }] }],
      },
    ],
  });
export const runThread = async ({ threadId, assistant_id }: { threadId: string; assistant_id: string }) =>
  await openai.beta.threads.runs.createAndPoll(threadId, {
    assistant_id,
    max_completion_tokens: 500,
  });

export const getMessageList = async (threadId: string, runId: string) => {
  return await openai.beta.threads.messages.list(threadId, {
    run_id: runId,
  });
};

export const extractBetweenHashesFromBeschluss = (text: string): string | null => {
  const regex = /#####([\s\S]*?)#####/;
  const match = text.match(regex);
  return match ? match[1].trim() : text.trim(); // TODO: return null if no match
};

export const filterMessage = (messages: MessagesPage) => {
  const message = messages.data.pop()!;
  log.debug({ message });
  if (message.content[0].type === 'text') {
    const { text } = message.content[0];

    return extractBetweenHashesFromBeschluss(text.value);
  }
  throw new Error('No text message found');
};

// Überprüft, ob die Domain in der Whitelist enthalten ist
const isValidDomain = (url: string): boolean => {
  const allowedDomains = process.env.ALLOWED_DOMAINS?.split(',') ?? [];
  const parsedUrl = new URL(url);
  return allowedDomains.includes(parsedUrl.origin);
};

// Desinfiziert die URL und stellt sicher, dass sie sicher ist
const sanitizeUrl = (url: string): string => {
  // Führen Sie hier notwendige Desinfektions- und Formatierungsprozesse durch
  // Zum Beispiel: Entfernen von fragwürdigen Query-Parametern oder Formatierungsproblemen
  return url.trim(); // Beispiel: einfaches Trimmen von Leerzeichen
};

// Ruft die Datei von einer sicheren URL ab
const fetchSecureFile = async (url: string) => {
  const sanitizedUrl = sanitizeUrl(url);
  if (!isValidDomain(sanitizedUrl)) {
    throw new Error('Domain ist nicht erlaubt');
  }
  const response = await fetch(sanitizedUrl);
  return response;
};

// Hauptfunktion, die die Validierung und den Abruf kombiniert
export const validateAndFetchFile = async (pdfUrl: string) => {
  try {
    const file = await fetchSecureFile(pdfUrl);
    return file;
  } catch (error) {
    log.error(`Fehler beim Abrufen der Datei`);
    log.debug(`Error: ${(error as Error).message}`);
    throw error;
  }
};

export const saveToDatabase = async ({
  pdfUrl,
  file,
  vectorStore,
  assistant,
  thread,
  databaseEntry,
}: {
  pdfUrl: string;
  file?: FileObject;
  vectorStore?: VectorStore;
  assistant?: Assistant;
  thread?: Thread;
  databaseEntry:
    | (INonNamedVotesAi & {
        _id: ObjectId;
      })
    | null;
}) => {
  if (!databaseEntry) {
    return await new NonNamedVotesAiModel({
      pdfUrl,
      fileId: file?.id,
      vectorStoreId: vectorStore?.id,
      assistantId: assistant?.id,
      threadId: thread?.id,
    }).save();
  }
  if (pdfUrl) databaseEntry.pdfUrl = pdfUrl;
  if (file) databaseEntry.fileId = file.id;
  if (vectorStore) databaseEntry.vectorStoreId = vectorStore.id;
  if (assistant) databaseEntry.assistantId = assistant.id;
  if (thread) databaseEntry.threadId = thread.id;
  return await databaseEntry.save();
};
