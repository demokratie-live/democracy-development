import { DIP_GRAPHQL_ENDPOINT } from '../config';
import {
  ProcedureModel,
} from "@democracy-deutschland/bundestagio-common";
import { createLogger, format, transports }from 'winston'

const logger = createLogger({
  level: 'info',
  format: format.json(),
  transports: [
    new transports.Console(),
  ]
});

const gql = String.raw
const procedureQuery = gql`
query {
  procedures {
    abstract
    procedureId
    currentStatus
    type
    period
    title
    date
    subjectGroups
    tags
  }
}
`

async function graphql({query, variables}: { query: String, variables?: object }) {
  const response = await fetch(DIP_GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  return response.json()
}

import fetch from 'cross-fetch';
export default async function importProcedures() {
  try {
    const { data: { procedures } } = await graphql({ query: procedureQuery });
    await ProcedureModel.insertMany(procedures)
  } catch(err) {
    logger.error(err)
  }
}
