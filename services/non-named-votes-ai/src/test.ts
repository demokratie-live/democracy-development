import { log } from './logger';
import { createThread, ensureAssistantId, ensureFile, filterMessage, getMessageList, runThread } from './utils';

let assistantId = 'asst_lK6r9ApD1ZYNvqwEOkleXmfd';
let fileId = 'file-pEo6HmgAFFGlMvmMKLYeSiEF';
const vector_store_ids = ['vs_i8KmJXDEtEdUyomai5oCavfz'];

export const getBeschlusstext = async (pdfUrl: string, title: string, drucksachen: string[]) => {
  const assistant = await ensureAssistantId({ vector_store_id: vector_store_ids[0], assistant_id: assistantId });
  assistantId = assistant.id;

  fileId = await ensureFile({ pdfUrl, file_id: fileId }).then((file) => file.id);

  const thread = await createThread({ title, drucksachen });
  log.debug('thread id', thread.id);

  log.debug(thread.tool_resources?.file_search);

  const run = await runThread({ threadId: thread.id, assistant_id: assistantId });

  const messages = await getMessageList(thread.id, run.id);

  log.debug(filterMessage(messages));
};
