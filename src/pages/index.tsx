import FilteredPage from '@/components/templates/FilteredPage';

export default function CurrentPage() {
  return (
    <FilteredPage
      listTypes={['CONFERENCEWEEKS_PLANNED']}
      title="Sitzungswoche"
      description="Gesetze und Anträge des Bundestages, die unmittelbar vor der
  Abstimmung stehen"
    />
  );
}
