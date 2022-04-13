import { useQuery } from '@apollo/client';
import { PaperClipIcon } from '@heroicons/react/outline';
import dayjs from 'dayjs';
import { sortBy } from 'lodash-es';
import { useRouter } from 'next/router';

import Loading from '@/components/molecules/Loading';
import { Meta } from '@/layout/Meta';
import { GET_PROCEDURE_DETAILS } from '@/queries/get-procedure-details';
import { Main } from '@/templates/Main';

export default function DetailsPage() {
  const router = useRouter();

  const [, id] = router.query.details ?? ([null, null] as any);

  const { loading, data } = useQuery(GET_PROCEDURE_DETAILS, {
    variables: {
      id,
    },
  });

  return (
    <Main
      meta={
        <Meta
          title={data?.procedure?.title ?? 'Democracy'}
          description={
            data?.procedure?.sessionTOPHeading ??
            data?.procedure?.abstract ??
            data?.procedure?.title ??
            'Democracy'
          }
        />
      }
    >
      <div>
        {loading || !data ? (
          <Loading />
        ) : (
          <>
            <div className="border-b border-gray-300 bg-gray-200">
              <div className="mx-auto max-w-7xl px-4 pb-7 pt-28 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-gray-900">
                  {data.procedure.title}
                </h1>
                <p className="max-w-xl pt-2 text-sm leading-5 text-gray-600">
                  {data.procedure.sessionTOPHeading}
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-7xl px-4 pb-7 sm:px-6 lg:px-8">
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
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
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
                    <div className="sm:col-span-2 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-800">
                        Dokumente
                      </dt>
                      <dd className="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">
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
                                  <div className="ml-2 flex flex-col">
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
