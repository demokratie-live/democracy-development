import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

import FilteredPage from '@/components/templates/FilteredPage';

dayjs.extend(isoWeek);

export default function PastPage() {
  return (
    <FilteredPage
      listTypes={['PAST']}
      title="Vergangen"
      description="Vorgänge, die in der vergangenen Sitzungswoche zur Abstimmung standen"
      groupBy={(item) => {
        const date = dayjs(item.voteDate);
        const week = date.isoWeek();
        const year = date.year();
        return `KW ${week} - ${year}`;
      }}
    />
  );
}
