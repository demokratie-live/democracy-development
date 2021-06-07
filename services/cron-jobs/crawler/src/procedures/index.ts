import { DIP_API_KEY, DIP_API_ENDPOINT } from '../config';
import {
  ProcedureModel,
} from "@democracy-deutschland/bundestagio-common";
import { createLogger, format, transports }from 'winston'

const { transform } = require('node-json-transform')

const logger = createLogger({
  level: 'info',
  format: format.json(),
  transports: [
    new transports.Console(),
  ]
});

const headers = {
  'Authorization': `ApiKey ${DIP_API_KEY}`
}

const mapping = {
  item: {
      abstract: 'abstract',
      procedureId: 'id',
      currentStatus: "beratungsstand",
      type: 'typ',
      period: "wahlperiode",
      title: "titel",
  }
}

import fetch from 'cross-fetch';
export default async function importProcedures() {
  try {
    const url = `//${DIP_API_ENDPOINT}/api/v1/vorgang`
    const res = await fetch(url, { headers });
    const { documents } = await res.json()
    const procedures = transform(documents, mapping)
    await ProcedureModel.insertMany(procedures)
  } catch(err) {
    logger.error(err)
  }
}
