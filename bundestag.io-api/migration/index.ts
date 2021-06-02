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
const limit = 99999999
const chunkSize = 100

const sliceIntoChunks = (arr: any[], chunkSize: number) => {
    const res = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        const chunk = arr.slice(i, i + chunkSize);
        res.push(chunk);
    }
    return res;
}

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

const migrateType = async (types: string, queries: object, mutations: object) => {
    const downloadQuery = queries[types]
    const uploadMutation = mutations[types]
    log.info(`Migrating ${types} ...`)
    let { data: { downloaded } } = await bundestagIoClient.query({ query: downloadQuery, variables: { limit } })
    log.info(`${downloaded.length} entries downloaded`)
    downloaded = cleanDeep(downloaded, {
      emptyArrays: false
    })
    for (const chunk of sliceIntoChunks(downloaded, chunkSize)) {
      const { data: { uploaded  } } = await dGraphClient.query(
        {
          query: uploadMutation,
          variables: { entries: chunk }
        }
      )
      log.info(`${uploaded.entries.length} entries uploaded, ${uploaded.numUids} numUids`)
    }
}

async function importDumps() {
  try {
    await fetch(`${DGRAPH_ENDPOINT}/admin/schema`, { method: 'POST', body: schema })
    log.info('GraphQL Schema added')

    await migrateType('namedPolls', queries, mutations)
    await migrateType('conferenceWeekDetails', queries, mutations)
    await migrateType('deputies', queries, mutations)
    await migrateType('procedures', queries, mutations)
  } catch(err) {
    console.error(err)
    if(err.errors) err.errors.forEach((e: any) => console.error(e))
  }
}

importDumps()
