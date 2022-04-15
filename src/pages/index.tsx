import dayjs from 'dayjs';

import FilteredPage from '@/components/templates/FilteredPage';
import { GET_CONFERENCE_WEEK } from '@/queries/get-conference-week';
import getClient from '@/utils/Client';

interface Props {
  conferenceWeek: {
    calendarWeek: string;
    end: string;
    start: string;
  };
}

export default function CurrentPage({ conferenceWeek }: Props) {
  const start = dayjs(conferenceWeek.start).format('DD.MM.');
  const end = dayjs(conferenceWeek.end).format('DD.MM.YYYY');

  return (
    <FilteredPage
      listTypes={['CONFERENCEWEEKS_PLANNED']}
      title={`Sitzungswoche - KW ${conferenceWeek.calendarWeek}`}
      description={`Vorgänge, die in der kommenden Sitzungswoche vom ${start} bis ${end} zur Abstimmung stehen.`}
      // description="Vorgänge, die in der kommenden Sitzungswoche zur Abstimmung stehen."
    />
  );
}

export async function getServerSideProps({ res }: any) {
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=86400, stale-while-revalidate=60'
  );

  const client = getClient();
  const { data } = await client.query({
    query: GET_CONFERENCE_WEEK,
  });

  return {
    props: {
      conferenceWeek: data.currentConferenceWeek,
    },
  };
}
