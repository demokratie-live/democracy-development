import FilteredPage from '@/components/templates/FilteredPage';

export default function CurrentPage() {
  return (
    <FilteredPage
      listTypes={['CONFERENCEWEEKS_PLANNED']}
      title="Sitzungswoche"
      description="Vorgänge, die in der kommenden Sitzungswoche zur Abstimmung stehen."
    />
  );
}
