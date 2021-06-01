import { Logger } from "tslog";
import { createClient } from 'graphqurl'; // @ts-ignore
import queries from './queries'
import mutations from './mutations'
import cleanDeep from 'clean-deep'
import fetch from 'cross-fetch';
import fs from 'fs'
import path from "path"

const log: Logger = new Logger({ name: "dgraph-migration" });

const BUNDESTAG_IO_ENDPOINT = 'http://localhost:3100'
const DGRAPH_ENDPOINT = 'http://localhost:8080'
const schema = fs.readFileSync(path.resolve(__dirname, 'schema.graphql'))

async function importDumps() {
  const bundestagIoClient = createClient({
    endpoint: BUNDESTAG_IO_ENDPOINT,
    headers: {
      'content-type': 'application/json'
    }
  });
  const dGraphClient = createClient({
    endpoint: `${DGRAPH_ENDPOINT}/graphql`,
    headers: {
      'content-type': 'application/json'
    }
  });
  try {
    await fetch(`${DGRAPH_ENDPOINT}/admin/schema`, { method: 'POST', body: schema })
    log.info('GraphQL Schema added')

    let { data: { procedures } } = await bundestagIoClient.query({ query: queries.procedures })
    log.info(`${procedures.length} procedures downloaded`)
    procedures = cleanDeep(procedures)
    const { data: { addProcedure } } = await dGraphClient.query(
      {
        query: mutations.procedures,
        variables: { procedures }
      }
    )
    log.info(`${addProcedure.procedure.length} procedures uploaded, ${addProcedure.numUids} numUids`)

    let { data: { deputies } } = await bundestagIoClient.query({ query: queries.deputies })
    log.info(`${deputies.length} deputies downloaded`)
    procedures = cleanDeep(procedures)
    const { data: { addDeputy } } = await dGraphClient.query(
      {
        query: mutations.deputies,
        variables: { deputies }
      }
    )
    log.info(`${addDeputy.deputy.length} deputies uploaded, ${addDeputy.numUids} numUids`)
  } catch(err) {
    console.error(err)
  }
}

importDumps()
