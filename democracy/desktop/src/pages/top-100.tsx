import FilteredPage from '@/components/templates/FilteredPage';

export default function Top100Page() {
  return (
    <FilteredPage
      listTypes={['TOP100']}
      title="Top 100"
      description="Die Top 100 Gesetze und Anträge des Bundestages, sortiert nach
      DEMOCRACY-Aktivitätsindex"
    />
  );
}
