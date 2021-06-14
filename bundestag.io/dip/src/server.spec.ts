/** @jest-environment setup-polly-jest/jest-environment-node */
import { setupPolly } from 'setup-polly-jest';
import supertest from 'supertest'
import createServer from './server'


const context = setupPolly({
  adapters: [require('@pollyjs/adapter-node-http')],
  persister: require('@pollyjs/persister-fs'),
  persisterOptions: {
    fs: {
      recordingsDir: '__recordings__'
    }
  },
});

const DIP_API_KEY='N64VhW8.yChkBUIJeosGojQ7CSR2xwLf3Qy7Apw464'
const { app } = createServer({ DIP_API_KEY, DIP_API_ENDPOINT: 'https://search.dip.bundestag.de' })

const request = supertest(app)

const gql = String.raw

const runQuery = async ({ query, variables}: {query: string, variables?: object}) => {
  const res = await request.post('/').send({query, variables}).set('Accept', 'application/json').expect(200)
  return JSON.parse(res.text)
}


describe('Query', () => {
  beforeEach(() => {
    context.polly.server
    .any()
    .filter((req: any) => /^127.0.0.1:[0-9]+$/.test(req.headers.host))
    .passthrough();
  })

  describe('procedure', () => {
    const query = gql`
    query($procedureId: ID!) {
      procedure(id: $procedureId) {
        abstract
        procedureId
        currentStatus
        type
        period
        title
        date
        subjectGroups
        tags
        gestOrderNumber
        legalValidity
        importantDocuments {
          editor
          number
          type
          url
        }
        plenums{
          editor
          number
          link
          pages
        }
      }
    }
    `

    it('returns gestOrderNumber', async () => {
      const variables = { procedureId: "275933" }
      await expect(runQuery({query, variables})).resolves.toMatchObject({
        data: {
          procedure: {
            abstract: expect.stringContaining("Verbesserung der Verfügbarkeit barrierefreier Produkte und Dienstleistungen der Informations- und Kommunikationstechnologien"),
            procedureId: "275933",
            currentStatus: "Verabschiedet",
            type: "Vorgang",
            period: 19,
            title: expect.stringContaining("Gesetz zur Umsetzung der Richtlinie (EU) 2019/882"),
            date: "2021-06-11",
            gestOrderNumber: "G053",
          }
        }
      })
    })

    it('returns legalValidity', async () => {
      const variables = { procedureId: "155381" }
      await expect(runQuery({query, variables})).resolves.toMatchObject({
        data: {
          procedure: {
            procedureId: "155381",
            currentStatus: "Verkündet",
            type: "Vorgang",
            period: 12,
            title: "Gesetz zu dem Europa-Abkommen vom 4. Oktober 1993 zur Gründung einer Assoziation zwischen den Europäischen Gemeinschaften sowie ihren Mitgliedstaaten und der Slowakischen Republik (G-SIG: 12020791)",
            date: "1994-07-08",
            gestOrderNumber: "XE017",
            legalValidity: [
              '21.10.1994',
              '01.02.1995 (nach Artikel 123 Abs. 2)'
            ]
          }
        }
      })
    })
  })
})
