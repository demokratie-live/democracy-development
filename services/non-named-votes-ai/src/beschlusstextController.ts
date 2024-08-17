import { Request, Response } from 'express';
import { NonNamedVotesAiModel } from '@democracy-deutschland/bundestagio-common';
import {
  createThread,
  ensureAssistantId,
  ensureFile,
  ensureVectorStore,
  filterMessage,
  getMessageList,
  runThread,
  saveToDatabase,
} from './utils';
import { log } from './logger';

export const getBeschlusstext = async (req: Request, res: Response) => {
  const { pdfUrl, title, drucksachen } = req.query as { pdfUrl: string; title: string; drucksachen?: string[] };
  log.info('getBeschlusstext start');
  log.debug(`getBeschlusstext: ${pdfUrl}, ${title}, ${drucksachen}`);

  if (!pdfUrl || typeof pdfUrl !== 'string') {
    return res.status(400).json({ message: 'pdfUrl muss angegeben werden' });
  }

  if (!title || typeof title !== 'string') {
    return res.status(400).json({ message: 'title muss angegeben werden' });
  }

  let databaseEntry = await NonNamedVotesAiModel.findOne({ pdfUrl: pdfUrl });
  log.debug({ databaseEntry });

  // Ensure OpenAi Objects exist
  const file = await ensureFile({ pdfUrl: pdfUrl as string, file_id: databaseEntry?.fileId });
  log.debug({ file });
  databaseEntry = await saveToDatabase({ pdfUrl, file, databaseEntry });
  const vectorStore = await ensureVectorStore({ file_id: file.id, vector_store_id: databaseEntry?.vectorStoreId });
  log.debug({ vectorStore });
  databaseEntry = await saveToDatabase({ pdfUrl, file, vectorStore, databaseEntry });
  const assistant = await ensureAssistantId({
    vector_store_id: vectorStore.id,
    assistant_id: databaseEntry?.assistantId,
  });
  log.debug({ assistant });
  databaseEntry = await saveToDatabase({ pdfUrl, file, vectorStore, assistant, databaseEntry });
  const thread = await createThread({ title, drucksachen });
  log.debug({ thread });
  databaseEntry = await saveToDatabase({ pdfUrl, file, vectorStore, assistant, thread, databaseEntry });

  // Run
  const run = await runThread({ assistant_id: assistant.id, threadId: thread.id });
  log.debug({ run });
  if (run.status === 'failed') {
    log.error('OpenAI failed');
    return res.status(500).json({ message: 'OpenAI failed' });
  }
  const messages = await getMessageList(thread.id, run.id);
  log.debug({ messages });
  const message = await filterMessage(messages);
  log.debug({ message });

  const beschlusstext = {
    pdfUrl,
    text: message,
  };
  log.debug({ beschlusstext });

  log.info('getBeschlusstext end');
  log.debug(`getBeschlusstext: ${pdfUrl}, ${title}, ${drucksachen} -> ${beschlusstext.text}`);
  return res.json(beschlusstext);
};
