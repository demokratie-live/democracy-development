import { PaperClipIcon } from '@heroicons/react/outline';
import dayjs from 'dayjs';
import { sortBy, truncate } from 'lodash-es';

import ChartPair from '@/components/molecules/ChartPair';
import Loading from '@/components/molecules/Loading';
import { Meta } from '@/layout/Meta';
import { GET_PROCEDURE_DETAILS } from '@/queries/get-procedure-details';
import { Main } from '@/templates/Main';
import { AppConfig } from '@/utils/AppConfig';
import getClient from '@/utils/Client';

export default function DetailsPage({ data, resolvedUrl }: any) {
  return (
    <Main
      meta={
        <Meta
          title={truncate(data?.procedure?.title ?? 'Democracy', {
            length: 60,
          })}
          description={truncate(
            data?.procedure?.sessionTOPHeading ??
              data?.procedure?.abstract ??
              data?.procedure?.title ??
              'Democracy',
            { length: 150 }
          )}
          canonical={`${AppConfig.url}${resolvedUrl}`}
        />
      }
    >
      <div>
        {!data ? (
          <Loading />
        ) : (
          <>
            <div className="border-b border-gray-300 bg-gray-200">
              <div className="mx-auto max-w-7xl px-4 pb-7 pt-28 text-center sm:px-6 lg:px-8">
                <ChartPair
                  item={data.procedure}
                  className="mb-12 flex w-full items-center justify-center space-x-6"
                  large={true}
                />
                <h1 className="mx-auto max-w-3xl text-2xl font-semibold leading-7 tracking-tight text-gray-900">
                  {data.procedure.title}
                </h1>
                <h2 className="mx-auto max-w-3xl pt-2 text-sm leading-5 text-gray-600">
                  {data.procedure.sessionTOPHeading}
                </h2>
              </div>
            </div>
            <div className="mx-auto max-w-5xl px-4 pb-7 sm:px-6 lg:px-8">
              {/* <div className="hyphens-auto prose py-10">
                {data.procedure.abstract}
              </div> */}

              <div className="mt-10 overflow-hidden border bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Details
                  </h3>
                  {/* <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Personal details and application.
                  </p> */}
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3">
                    <div className="sm:col-span-1 ">
                      <dt className="text-sm font-medium text-gray-800">Typ</dt>
                      <dd className="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">
                        {data.procedure.type}
                      </dd>
                    </div>
                    <div className="sm:col-span-1 ">
                      <dt className="text-sm font-medium text-gray-800">
                        Vorgang
                      </dt>
                      <dd className="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">
                        {data.procedure.procedureId}
                      </dd>
                    </div>
                    <div className="sm:col-span-1 ">
                      <dt className="text-sm font-medium text-gray-800">
                        Sachgebiete
                      </dt>
                      <dd className="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">
                        {data.procedure.subjectGroups.join(', ')}
                      </dd>
                    </div>
                    <div className="sm:col-span-1 ">
                      <dt className="text-sm font-medium text-gray-800">
                        erstellt man
                      </dt>
                      <dd className="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">
                        {dayjs(data.procedure.submissionDate).format(
                          'DD.MM.YYYY'
                        )}
                      </dd>
                    </div>
                    <div className="sm:col-span-1 ">
                      <dt className="text-sm font-medium text-gray-800">
                        Abstimmung
                      </dt>
                      <dd className="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">
                        {dayjs(data.procedure.voteDate).format('DD.MM.YYYY')}
                      </dd>
                    </div>
                    <div className="sm:col-span-1 ">
                      <dt className="text-sm font-medium text-gray-800">
                        Aktueller Stand
                      </dt>
                      <dd className="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">
                        {data.procedure.currentStatus}
                      </dd>
                    </div>
                    {data.procedure.abstract && (
                      <div className="sm:col-span-2 ">
                        <dt className="text-sm font-medium text-gray-800">
                          Inhalt
                        </dt>
                        <dd className="prose mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">
                          {data.procedure.abstract}
                        </dd>
                      </div>
                    )}
                    <hr className="my-5 border-dashed sm:col-span-3" />
                    <div className="sm:col-span-3 sm:grid sm:grid-cols-3 sm:gap-4 md:col-span-3">
                      <dt className="text-sm font-medium text-gray-800">
                        Dokumente
                      </dt>
                      <dd className="mt-1 text-sm text-gray-700 sm:col-span-3 sm:mt-0">
                        <ul
                          role="list"
                          className="divide-y divide-gray-200 rounded-md border border-gray-200"
                        >
                          {sortBy(data.procedure.importantDocuments, [
                            /*  'number',
                            'url', */
                          ]).map((document) => (
                            <li key={document.number} className="">
                              <a
                                href={document.url}
                                target="_blank"
                                className="flex items-center justify-between py-3 pl-3 pr-4 text-sm"
                                rel="noreferrer"
                              >
                                <div className="flex w-0 flex-1 items-start">
                                  <PaperClipIcon
                                    className="h-5 w-5 shrink-0 text-gray-400"
                                    aria-hidden="true"
                                  />
                                  <div className="ml-2 flex w-full flex-col !pr-8">
                                    <span className="truncate font-medium">
                                      {document.type}
                                    </span>
                                    <small className="truncate text-gray-700">
                                      {document.editor}&nbsp;{document.number}
                                    </small>
                                  </div>
                                </div>
                                <div className="ml-4 shrink-0 font-medium text-ci-blue-darker hover:text-ci-blue-darker">
                                  Öffnen
                                </div>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Main>
  );
}

export async function getServerSideProps({ res, query, resolvedUrl }: any) {
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=86400, stale-while-revalidate=60'
  );

  const [, id] = query.details ?? ([null, null] as any);

  const client = getClient();
  const { data } = await client.query({
    query: GET_PROCEDURE_DETAILS,
    variables: {
      id,
    },
  });

  return {
    props: {
      id,
      data,
      resolvedUrl,
    },
  };
}
