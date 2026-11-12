import { Request, Response } from 'express';
import { fetchPdfAsBase64, getBeschlusstextFromPdf } from './utils';
import { log } from './logger';

export const getBeschlusstext = async (req: Request, res: Response) => {
  const { pdfUrl, title, drucksachen } = req.query as {
    pdfUrl?: string;
    title?: string;
    drucksachen?: string | string[];
  };
  log.info('getBeschlusstext start');

  if (!pdfUrl || typeof pdfUrl !== 'string') {
    return res.status(400).json({ message: 'pdfUrl muss angegeben werden' });
  }

  if (!title || typeof title !== 'string') {
    return res.status(400).json({ message: 'title muss angegeben werden' });
  }

  const documentNumbers = ([] as string[]).concat(drucksachen ?? []).filter(Boolean);

  try {
    const pdf = await fetchPdfAsBase64(pdfUrl);
    const text = await getBeschlusstextFromPdf({ pdf, title, drucksachen: documentNumbers });
    log.info('getBeschlusstext end');
    return res.json({ pdfUrl, text });
  } catch (error) {
    log.error(`getBeschlusstext failed: ${(error as Error).message}`);
    return res.status(500).json({ message: 'KI-Anfrage fehlgeschlagen' });
  }
};
