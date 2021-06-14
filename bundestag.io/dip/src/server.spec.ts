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
const query = gql`
query {
  procedure(id: "275933") {
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

const runQuery = async ({ query, variables}: {query: string, variables?: object}) => {
  const res = await request.post('/').send({query, variables}).set('Accept', 'application/json').expect(200)
  return JSON.parse(res.text)
}


describe('app', () => {
  beforeEach(() => {
    context.polly.server
    .any()
    .filter((req: any) => /^127.0.0.1:[0-9]+$/.test(req.headers.host))
    .passthrough();
  })

  it('returns 200', async () => {
    await expect(runQuery({query})).resolves.toMatchObject({
      data: {
        procedure: {
          abstract: expect.stringContaining("Verbesserung der Verfügbarkeit barrierefreier Produkte und Dienstleistungen der Informations- und Kommunikationstechnologien"),
          procedureId: "275933",
          currentStatus: "Verabschiedet",
          type: "Vorgang",
          period: 19,
          title: expect.stringContaining("Gesetz zur Umsetzung der Richtlinie (EU) 2019/882"),
          date: "2021-06-11",
          subjectGroups: [
            "Gesellschaftspolitik, soziale Gruppen",
            "Medien, Kommunikation und Informationstechnik",
            "Wirtschaft"
          ],
          tags: [
            "Automat",
            "Barrierefreiheit",
            "Barrierefreiheitsstärkungsgesetz",
            "Dienstleistung",
            "Elektronischer Handel",
            "Europäischer Binnenmarkt",
            "Gesetz zur Umsetzung der Richtlinie (EU) 2019/882 des Europäischen Parlaments und des Rates über die Barrierefreiheitsanforderungen für Produkte und Dienstleistungen und zur Änderung anderer Gesetze",
            "Informations- und Kommunikationstechnik",
            "Innerstaatliche Umsetzung von EU-Recht",
            "Jugendarbeitsschutz",
            "Jugendarbeitsschutzgesetz",
            "Online-Dienst",
            "Personenverkehr",
            "Produkt",
            "Richtlinie der EU",
            "Teilhabe behinderter Menschen",
            "Telekommunikationsdienst"
          ],
          gestOrderNumber: "G053",
          importantDocuments: [
            expect.any(Object),
            expect.any(Object),
            expect.any(Object),
            expect.any(Object),
            expect.any(Object),
            expect.any(Object),
            expect.any(Object),
            expect.any(Object),
            expect.any(Object),
          ],
          "plenums": [
            expect.any(Object),
            expect.any(Object),
            expect.any(Object),
            expect.any(Object),
            expect.any(Object),
          ],
        }
      }
    })
  })
})
