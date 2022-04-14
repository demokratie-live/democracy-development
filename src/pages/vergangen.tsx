import FilteredPage from '@/components/templates/FilteredPage';

export default function PastPage() {
  return (
    <FilteredPage
      listTypes={['PAST']}
      title="Vergangen"
      description="Vergangenen und bereits abgestimmte, Gesetze und Anträge des
      Bundestages"
    />
  );
}
