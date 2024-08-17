import { NonNamedVotesAiModel } from '@democracy-deutschland/bundestagio-common';
import { Request, Response } from 'express';
import { openai } from './utils';

export const deleteAll = async (req: Request, res: Response) => {
  await NonNamedVotesAiModel.deleteMany({});
  await openai.beta.assistants.list().then(async (assistants) => {
    for (const assistant of assistants.data) {
      await openai.beta.assistants.del(assistant.id);
    }
  });
  await openai.beta.vectorStores.list().then(async (vectorStores) => {
    for (const vectorStore of vectorStores.data) {
      await openai.beta.vectorStores.del(vectorStore.id);
    }
  });
  await openai.files.list().then(async (files) => {
    for (const file of files.data) {
      await openai.files.del(file.id);
    }
  });

  return res.json({ message: 'deleted all' });
};
