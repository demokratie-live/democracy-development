import { createClient } from 'graphqurl'; // @ts-ignore
import { uploadProcedures } from './mutations'
import { downloadProcedures } from './queries'
import cleanDeep from 'clean-deep'
import fetch from 'cross-fetch';
import fs from 'fs'
import path from "path"

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
    let { data: { procedures } } = await bundestagIoClient.query({ query: downloadProcedures })
    procedures = cleanDeep(procedures)
    console.log(JSON.stringify(procedures, null, 2))
    const { data: { addProcedure } } = await dGraphClient.query(
      {
        query: uploadProcedures,
        variables: { procedures }
      }
    )
    console.log(JSON.stringify(addProcedure, null, 2))
  } catch(err) {
    console.error(err)
  }
}

importDumps()
