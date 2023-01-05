import { useState } from 'react';

import { useQuery } from '@apollo/client';
import { uniqBy } from 'lodash-es';
import { useRouter } from 'next/router';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import { useRecoilState, useRecoilValue } from 'recoil';

import Card from '@/components/molecules/Card';
import Empty from '@/components/molecules/Empty';
import Filters from '@/components/molecules/Filters';
import Loading from '@/components/molecules/Loading';
import {
  filterForSubjectState,
  filterForTypeState,
  filterState,
} from '@/components/state/states';
import { config } from '@/config/constants';
import { Meta } from '@/layout/Meta';
import { GET_PROCEDURES } from '@/queries/get-procedures';
import { Main } from '@/templates/Main';
import { AppConfig } from '@/utils/AppConfig';

interface Props {
  listTypes: string[];
  title: string;
  description: string;
}

export default function FilteredPage({ listTypes, title, description }: Props) {
  const router = useRouter();
  const filters = useRecoilValue(filterState);
  const [filterSubject, setFilterSubject] = useRecoilState(
    filterForSubjectState
  );
  const [filterType, setFilterType] = useRecoilState(filterForTypeState);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const toggleValue = (items: any, value: any): any => {
    if (items.includes(value)) {
      return items.filter((s: string) => s !== value) as never;
    }
    return [...items, value] as never;
  };

  const pageSize = 15;

  const { loading, data, error, fetchMore } = useQuery(GET_PROCEDURES, {
    variables: {
      filter: {
        subjectGroups: filterSubject,
        type: filterType,
      },
      listTypes,
      offset: 0,
      pageSize,
      sort: 'voteDate',
      period: config.period,
      context: {
        debounceKey: title,
      },
    },
  });

  const [sentryRef] = useInfiniteScroll({
    loading: isLoadingMore,
    hasNextPage: hasMore,
    onLoadMore: () => {
      setIsLoadingMore(true);
      setOffset(offset + pageSize);
      fetchMore({
        variables: {
          offset,
        },
      }).then((res: any) => {
        setHasMore(res.data?.procedures.length === pageSize);
        setIsLoadingMore(false);
      });
    },
    disabled: !!error,
    rootMargin: '0px 0px 800px 0px',
  });

  const isEmpty = error || data?.procedures?.length <= 0;

  return (
    <Main
      meta={
        <Meta
          title={title}
          description={description}
          canonical={`${AppConfig.url}${router?.asPath}`}
        />
      }
    >
      <div className="mb-20">
        <div className="bg-gray-200">
          <div className="mx-auto max-w-7xl px-4 pb-7 pt-28 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              {title}
            </h1>
            <h2 className="max-w-xl text-sm leading-5 text-gray-600">
              {description}
            </h2>
          </div>
          <Filters
            selected={filters as never}
            onToggle={(group: string, id: string) => {
              if (group === 'subject') {
                setFilterSubject(toggleValue(filterSubject, id));
              } else {
                setFilterType(toggleValue(filterType, id));
              }
              setHasMore(true);
              setOffset(0);
            }}
            onReset={() => {
              setFilterSubject([]);
              setFilterType([]);
              setHasMore(true);
              setOffset(0);
              // refetch();
            }}
          />
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
            {!error && loading && !isLoadingMore && <Loading />}
            {!error &&
              !isEmpty &&
              !loading &&
              uniqBy(data?.procedures, '_id').map((item: any) => (
                // eslint-disable-next-line no-underscore-dangle
                <Card item={item as any} key={item._id} />
              ))}
            {!loading && isEmpty && <Empty />}
          </div>
          {(isLoadingMore || (!loading && hasMore && !error)) && (
            <div
              className="flex h-32 w-full items-center justify-center"
              ref={sentryRef}
            >
              <Loading slim={true} />
            </div>
          )}
        </div>
      </div>
    </Main>
  );
}

export async function getServerSideProps({ res }: any) {
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=86400, stale-while-revalidate=60'
  );

  return {};
}
