/** @jest-environment setup-polly-jest/jest-environment-node */
import { setupPolly } from 'setup-polly-jest';
import supertest from 'supertest'
import createServer from './server'
import NodeHTTPAdapter from '@pollyjs/adapter-node-http'
import FSPersister from '@pollyjs/persister-fs'


const context = setupPolly({
  adapters: [NodeHTTPAdapter],
  persister: FSPersister,
  persisterOptions: {
    fs: {
      recordingsDir: '__recordings__'
    }
  },
});

const randomObjects = (n: number) => Array.from(Array(n).keys()).map(() => expect.any(Object))

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

    context.polly.server
    .any()
    .on('beforePersist', (_req, recording) => {
      recording.request.headers = []
    });
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
        history {
          assignment
          initiator
          findSpot
          findSpotUrl
          decision {
            page
            tenor
            document
            type
            comment
            foundation
            majority
          }
          date
        }
      }
    }
    `

    it('returns gestOrderNumber', async () => {
      const variables = { procedureId: "275933" }
      await expect(runQuery({query, variables})).resolves.toMatchObject({
        data: {
          procedure: {
            procedureId: '275933',
            period: 19,
            date: '2021-06-11',
            gestOrderNumber: 'G053',
          }
        }
      })
    })

    it('returns legalValidity', async () => {
      const variables = { procedureId: '155381' }
      await expect(runQuery({query, variables})).resolves.toMatchObject({
        data: {
          procedure: {
            procedureId: "155381",
            period: 12,
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

    describe('history', () => {
      it('returns assignment+initiator', async () => {
        const variables = { procedureId: '234344' }
        await expect(runQuery({query, variables})).resolves.toMatchObject({
          data: {
            procedure: {
              procedureId: "234344",
              history: [
                expect.objectContaining({ assignment: 'BT', initiator: "Antrag,  Urheber : Bundesregierung" }),
                expect.objectContaining({ assignment: 'BT', initiator: "Beratung" }),
                expect.objectContaining({ assignment: 'BT', initiator: "Beschlussempfehlung und Bericht,  Urheber : Auswärtiger Ausschuss" }),
                expect.objectContaining({ assignment: 'BT', initiator: "Bericht gemäß § 96 Geschäftsordnung BT,  Urheber : Haushaltsausschuss" }),
                expect.objectContaining({ assignment: 'BT', initiator: "Beratung" }),
              ]
            }
          }
        })
      })

      it('returns findSpot+findSpotUrl', async () => {
        const variables = { procedureId: '234344' }
        await expect(runQuery({query, variables})).resolves.toMatchObject({
          data: {
            procedure: {
              procedureId: "234344",
              history: [
                expect.objectContaining({ findSpot: '11.04.2018 - BT-Drucksache 19/1596', findSpotUrl: 'https://dserver.bundestag.de/btd/19/015/1901596.pdf' }),
                expect.objectContaining({ findSpot: '19.04.2018 - BT-Plenarprotokoll 19/26, S. 2377C - 2385A', findSpotUrl: 'https://dserver.bundestag.de/btp/19/19026.pdf#P.2377' }),
                expect.objectContaining({ findSpot: '24.04.2018 - BT-Drucksache 19/1833', findSpotUrl: 'https://dserver.bundestag.de/btd/19/018/1901833.pdf' }),
                expect.objectContaining({ findSpot: '25.04.2018 - BT-Drucksache 19/1879', findSpotUrl: 'https://dserver.bundestag.de/btd/19/018/1901879.pdf' }),
                expect.objectContaining({ findSpot: '26.04.2018 - BT-Plenarprotokoll 19/29, S. 2723D - 2732C', findSpotUrl: 'https://dserver.bundestag.de/btp/19/19029.pdf#P.2723' }),
              ]
            }
          }
        })
      })

      it('returns date', async () => {
        const variables = { procedureId: '234344' }
        await expect(runQuery({query, variables})).resolves.toMatchObject({
          data: {
            procedure: {
              procedureId: "234344",
              history: [
                expect.objectContaining({ date: '2018-04-11T00:00:00.000Z' }),
                expect.objectContaining({ date: '2018-04-19T00:00:00.000Z' }),
                expect.objectContaining({ date: '2018-04-24T00:00:00.000Z' }),
                expect.objectContaining({ date: '2018-04-25T00:00:00.000Z' }),
                expect.objectContaining({ date: '2018-04-26T00:00:00.000Z' }),
              ]
            }
          }
        })
      })

      describe('decision', () => {
        it('returns page+tenor+document+type+comment', async () => {
          const variables = { procedureId: '234344' }
          await expect(runQuery({query, variables})).resolves.toMatchObject({
            data: {
              procedure: {
                procedureId: "234344",
                history: [
                  expect.any(Object),
                  expect.objectContaining({ decision: [
                    expect.objectContaining({
                      page: '2385A',
                      tenor: 'Überweisung',
                      document: '19/1596',
                    })
                  ]}),
                  expect.any(Object),
                  expect.any(Object),
                  expect.objectContaining({ decision: [
                    expect.objectContaining({
                      page: '2736B',
                      tenor: 'Annahme der Vorlage',
                      document: '19/1596',
                      type: 'Namentliche Abstimmung',
                      comment: '531:78:35'
                    })
                  ]}),
                ]
              }
            }
          })
        })

        it('returns foundation', async () => {
          const variables = { procedureId: '233294' }
          await expect(runQuery({query, variables})).resolves.toMatchObject({
            data: {
              procedure: {
                procedureId: "233294",
                history: [
                  expect.any(Object),
                  expect.objectContaining({ decision: [
                    expect.objectContaining({
                      page: '75B',
                      tenor: 'erneute Einbringung; Bestellung eines Beauftragten',
                      document: '81/18',
                      foundation: 'Art. 76 Abs. 1 GG'
                    })
                  ]}),
                  expect.any(Object),
                  expect.any(Object),
                ]
              }
            }
          })
        })

        it('returns majority', async () => {
          const variables = { procedureId: '44236' }
          await expect(runQuery({query, variables})).resolves.toMatchObject({
            data: {
              procedure: {
                procedureId: "44236",
                history: [
                  expect.any(Object),
                  expect.any(Object),
                  expect.any(Object),
                  expect.any(Object),
                  expect.objectContaining({ decision: [
                    expect.objectContaining({
                      page: '21480A',
                      tenor: 'Annahme der Vorlage',
                      document: '17/9392',
                      type: 'Namentliche Abstimmung',
                      comment: '510:0:66',
                      majority: 'Zweidrittelmehrheit',
                    })
                  ]}),
                  expect.any(Object),
                  expect.objectContaining({ decision: [
                    expect.objectContaining({
                      page: '256C',
                      tenor: 'Zustimmung',
                      document: '289/12',
                      type: 'Abstimmung durch Aufruf der Länder',
                      foundation: 'Art. 79 Abs. 2 GG'
                    })
                  ]}),
                  expect.any(Object),
                ]
              }
            }
          })
        })
      })
    })
  })

  describe('procedures', () => {
    const query = gql`
      query($cursor: String, $offset: Int, $limit: Int, $filter: ProcedureFilter) {
        procedures(cursor: $cursor, offset: $offset, limit: $limit, filter: $filter) {
          edges {
            node {
              procedureId
            }
          }
          totalCount
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `
    describe('filter', () => {
      describe('before+after', () => {
        it('filters by date', async () => {
          const variables = { filter: { after: '1980-01-01', before: '1980-01-10'  } }
          const { data: { procedures: { edges } } } = await runQuery({query, variables})
          expect(edges).toHaveLength(17)
        })
      })
     })

    describe('pagination', () => {
      describe('limit', () => {
        it('returns less items', async () => {
          const variables = { limit: 50 }
          const { data: { procedures: { edges } } } = await runQuery({query, variables})
          expect(edges).toHaveLength(50)
          expect(edges).toMatchObject([
            expect.objectContaining({ node: { procedureId: '279259' } }),
            expect.objectContaining({ node: { procedureId: '279258' } }),
            expect.objectContaining({ node: { procedureId: '279257' } }),
            ...randomObjects(47)
          ])
        })

        it('limit must be divisible of 50', async () => {
          const variables = { limit: 3 }
          await expect(runQuery({query, variables})).resolves.toMatchObject({
            data: { procedures: null },
            errors: [
              expect.objectContaining({ message: 'DIP has a fixed page size of 50. Make sure your limt is a multiple of 50 to avoid inconsistencies with cursor based pagination.' })
            ]
          })
        })

        describe('limit > 50', () => {
          it('fetches DIP API multiple times to get remaining items', async () => {
            const variables = { limit: 100 }
            const { data: { procedures: { edges } } } = await runQuery({query, variables})
            const idSet = new Set(edges.map((edge: { node: { procedureId: number} }) => edge.node.procedureId))
            expect(edges).toHaveLength(100)
            expect(idSet.size).toEqual(100)
          })

          it('returns less items if result set is smaller', async () => {
            const variables = { limit: 100, filter: { before: '1970-01-01' } }
            const { data: { procedures: { edges } } } = await runQuery({query, variables})
            const idSet = new Set(edges.map((edge: { node: { procedureId: number} }) => edge.node.procedureId))
            expect(edges).toHaveLength(2)
            expect(idSet.size).toEqual(2)
          })
        })
      })

      describe('offset', () => {
        it('skips items', async () => {
          let { data: { procedures: { edges } } } = await runQuery({query, variables: {
            filter: { after: '2021-06-14', before: '2021-06-18'  }, limit: 50
          }});
          expect(edges).toHaveLength(50)
          expect(edges).toMatchObject([
            expect.objectContaining({ node: { procedureId: '279259' } }),
            expect.objectContaining({ node: { procedureId: '279258' } }),
            expect.objectContaining({ node: { procedureId: '279257' } }),
            ...randomObjects(47)
          ]);

          ({ data: { procedures: { edges } } } = await runQuery({query, variables: {
            filter: { after: '2021-06-14', before: '2021-06-18'  }, offset: 2, limit: 50
          }}));
          expect(edges).toHaveLength(50)
          expect(edges).toMatchObject([
            expect.objectContaining({ node: { procedureId: '279257' } }),
            expect.objectContaining({ node: { procedureId: '278875' } }),
            expect.objectContaining({ node: { procedureId: '278700' } }),
            ...randomObjects(47)
          ])
        })
      })

      describe('cursor', () => {
        it('is passed to DIP API', async () => {
          const variables = { limit: 50, cursor: 'AoJwwI7Ri/oCLlZvcmdhbmctMjc3NTM4' }
          const { data: { procedures: { edges } } } = await runQuery({query, variables})
          expect(edges).toHaveLength(50)
          expect(edges).toMatchObject([
            expect.objectContaining({ node: { procedureId: '277500' } }),
            expect.objectContaining({ node: { procedureId: '276884' } }),
            expect.objectContaining({ node: { procedureId: '274784' } }),
            ...randomObjects(47)
          ])
        })
      })
    })

    describe('pageInfo', () => {
      it('maps to numFound', async () => {
        const variables = { before: '2021-06-18' }
        await expect(runQuery({query, variables})).resolves.toMatchObject({
          data: {
            procedures: {
              totalCount: 277499,
            }
          }
        })
      })
    })

    describe('pageInfo', () => {
      it('hasNextPage indicates if there are more entries', async () => {
        const variables = { filter: { before: '1970-01-01' } }
        await expect(runQuery({query, variables})).resolves.toMatchObject({
          data: {
            procedures: {
              pageInfo: {
                endCursor: "AoJwwIPJ6zMuVm9yZ2FuZy0yMDk5NjU=",
                hasNextPage: false,
              }
            }
          }
        })
      })
    })
  })
})
