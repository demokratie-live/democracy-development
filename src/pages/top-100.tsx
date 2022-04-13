import { useQuery } from '@apollo/client';
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
import { GET_PROCEDURES } from '@/queries/get-procedures';

export default function Top100Page() {
  const filters = useRecoilValue(filterState);
  const [filterSubject, setFilterSubject] = useRecoilState(
    filterForSubjectState
  );
  const [filterType, setFilterType] = useRecoilState(filterForTypeState);

  const toggleValue = (items: any, value: any): any => {
    if (items.includes(value)) {
      // remove
      return items.filter((s: string) => s !== value) as never;
    }
    // add
    return [...items, value] as never;
  };

  const { loading, data, error } = useQuery(GET_PROCEDURES, {
    variables: {
      filter: {
        subjectGroups: filterSubject,
        type: filterType,
      },
      listTypes: ['HOT'],
      pageSize: 15,
      sort: 'voteDate',
    },
  });

  return (
    <div>
      <div className="bg-gray-200">
        <div className="mx-auto max-w-7xl px-4 pb-7 pt-28 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Top 100
          </h1>
          <p className="max-w-xl text-sm leading-5 text-gray-600">
            Die Top 100 Gesetze und Anträge des Bundestages, sortiert nach
            DEMOCRACY-Aktivitätsindex
          </p>
        </div>
        <Filters
          selected={filters as never}
          onToggle={(group: string, id: string) => {
            if (group === 'subject') {
              setFilterSubject(toggleValue(filterSubject, id));
            } else {
              setFilterType(toggleValue(filterType, id));
            }
          }}
          onReset={() => {
            setFilterSubject([]);
            setFilterType([]);
          }}
        />
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-7 sm:px-6 lg:px-8">
        <div className="3xl:grid-cols-4 mx-auto mt-6 grid h-full max-w-md gap-5 sm:max-w-none sm:grid-cols-2 lg:grid-cols-3">
          {!error && loading && <Loading />}
          {!error &&
            !loading &&
            data.procedures?.length > 0 &&
            data.procedures.map((item: { procedureId: any }) => (
              <Card item={item as any} key={item.procedureId} />
            ))}
          {!loading && data.procedures?.length <= 0 && <Empty />}
        </div>
      </div>
    </div>
  );
}
