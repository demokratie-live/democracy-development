import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { useRecoilState } from 'recoil';

import Card from '@/components/molecules/Card';
import Empty from '@/components/molecules/Empty';
import Loading from '@/components/molecules/Loading';
import { searchTermState } from '@/components/state/states';
import { Meta } from '@/layout/Meta';
import { SEARCH_PROCEDURES } from '@/queries/search-procedures';
import { Main } from '@/templates/Main';
import { AppConfig } from '@/utils/AppConfig';

export default function Top100Page() {
  const router = useRouter();
  const [searchTerm] = useRecoilState(searchTermState);

  const { loading, data, error } = useQuery(SEARCH_PROCEDURES, {
    variables: {
      term: searchTerm ?? null,
      period: 20,
    },
    context: {
      // Requests get debounced together if they share the same debounceKey.
      // Requests without a debounce key are passed to the next link unchanged.
      debounceKey: 'search',
      debounceTimeout: 1000,
    },
  });

  const isEmpty =
    error || data?.searchProceduresAutocomplete?.procedures?.length <= 0;

  return (
    <Main
      meta={
        <Meta
          title="Suche"
          description=""
          canonical={`${AppConfig.url}${router?.asPath}`}
        />
      }
    >
      <div className="mb-20">
        <div className="bg-gray-200">
          <div className="mx-auto max-w-7xl px-4 pb-7 pt-28 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              Suche
            </h1>
            <h2 className="max-w-xl text-base font-medium leading-5 text-gray-700">
              {`Wir suchen nach "${searchTerm === '' ? '?' : searchTerm}"`}
            </h2>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 pb-7 sm:px-6 lg:px-8">
          <div
            className={`
            ${
              !isEmpty &&
              !loading &&
              !error &&
              'grid gap-5 3xl:grid-cols-4 sm:grid-cols-2 lg:grid-cols-3'
            }
             mt-6 h-full w-full max-w-md sm:max-w-none mx-auto`}
          >
            {!error && loading && <Loading />}
            {!error &&
              !isEmpty &&
              !loading &&
              data?.searchProceduresAutocomplete?.procedures.map(
                (item: { procedureId: any }) => (
                  <Card item={item as any} key={item.procedureId} />
                )
              )}
            {!loading && isEmpty && <Empty />}
          </div>
        </div>
      </div>
    </Main>
  );
}
