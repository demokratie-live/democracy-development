import FilteredPage from '@/components/templates/FilteredPage';

export default function PastPage() {
  return (
    <FilteredPage
      listTypes={['PAST']}
      title="Vergangen"
      description="Vorgänge, die in der vergangenen Sitzungswoche zur Abstimmung standen."
    />
  );
}
