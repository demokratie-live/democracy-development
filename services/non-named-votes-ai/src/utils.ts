import OpenAI from 'openai';
import { Assistant } from 'openai/resources/beta/assistants';
import { MessagesPage } from 'openai/resources/beta/threads/messages';
import { VectorStore } from 'openai/resources/beta/vector-stores/vector-stores';
import { log } from './logger';
import { INonNamedVotesAi, NonNamedVotesAiModel } from '@democracy-deutschland/bundestagio-common';
import { ObjectId } from 'mongoose';
import { FileObject } from 'openai/resources';
import { Thread } from 'openai/resources/beta/threads/threads';

const openai = new OpenAI();
const name = process.env.NAME ?? 'Non-Named Votes AI';

export const retriveAssistant = async (assistantId: string) => await openai.beta.assistants.retrieve(assistantId);
export const createAssistant = async ({ vector_store_id }: { vector_store_id: string }) =>
  await openai.beta.assistants.create({
    name,
    instructions: `
        Du erhältst vom User einen Titel und eine Dokumentennummer zu einer Abstimmung aus dem Plenarsaalprotokoll des Deutschen Bundestages. Deine Aufgabe ist es, den exakten Wortlaut des Textabschnitts zur Abstimmung, inklusive der namentlichen Nennung der Parteien und ihres Abstimmungsverhaltens, wie er im Protokoll steht, wiederzugeben. Füge keine zusätzlichen Informationen oder Erklärungen hinzu. Gib den Textabschnitt wortwörtlich und vollständig so zurück, wie er im Dokument erscheint.
        Setze am anfang des Textes ein "#####" und am Ende ein "#####" um den Textabschnitt zu kennzeichnen.
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

export const retriveFile = async (fileId: string) => await openai.files.retrieve(fileId);
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
  await openai.beta.vectorStores.retrieve(vectorStoreId);
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
  });

export const getMessageList = async (threadId: string, runId: string) => {
  return await openai.beta.threads.messages.list(threadId, {
    run_id: runId,
  });
};

export const extractBetweenHashesFromBeschluss = (text: string): string | null => {
  const regex = /#####([\s\S]*?)#####/;
  const match = text.match(regex);
  return match ? match[1].trim() : null;
};

export const filterMessage = (messages: MessagesPage) => {
  const message = messages.data.pop()!;
  if (message.content[0].type === 'text') {
    const { text } = message.content[0];

    return extractBetweenHashesFromBeschluss(text.value);
    return text.value;
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
