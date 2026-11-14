import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { AlertCircle, ArrowLeft } from 'lucide-react';

import { PROCEDURE as PROCEDURE_DEFINITIONS } from '@democracy-deutschland/bundestag.io-definitions';

import { Layout } from '../../components/Layout';
import { ProcedureHeader, type ProtocolEntry } from '../../components/Procedures/ProcedureHeader';
import VoteResultsForm from '../../components/Procedures/VoteResultsForm';
import { VoteResultsFormNamedPoll } from '../../components/Procedures/VoteResultsFormNamedPoll';
import { VoteResultTextHelper } from '../../components/Procedures/VoteResultTextHelper';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PROCEDURE } from '../../graphql/queries/procedure';

const BackLink = () => (
  <Link href="/procedures" className="mb-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">
    <ArrowLeft aria-hidden className="size-4" />
    ToDo
  </Link>
);

const Procedure: React.FC = () => {
  const router = useRouter();

  const { data, loading, error } = useQuery(PROCEDURE, {
    variables: {
      procedureId: router.query.id || '',
    },
    fetchPolicy: 'cache-and-network',
  });

  if (loading && !data) {
    return (
      <Layout title="Vorgang">
        <p className="text-sm text-muted-foreground">Lädt …</p>
      </Layout>
    );
  }
  if (error) {
    return (
      <Layout title="Vorgang">
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Vorgang konnte nicht geladen werden</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </Layout>
    );
  }
  if (!data?.procedure) {
    return (
      <Layout title="Vorgang">
        <BackLink />
        <p className="text-sm">Vorgang {router.query.id} nicht gefunden.</p>
      </Layout>
    );
  }

  const { procedureId, title, type, period, importantDocuments, history, customData, namedVote } = data.procedure;

  const plenaryProtocols: ProtocolEntry[] =
    history?.filter(
      ({ findSpot }) => findSpot?.search(PROCEDURE_DEFINITIONS.HISTORY.FINDSPOT.FIND_BT_PLENARPROTOKOLL) !== -1,
    ) || [];

  return (
    <Layout title={title}>
      <BackLink />
      <ProcedureHeader {...data.procedure} plenaryProtocols={plenaryProtocols} />

      {!namedVote && (
        <section aria-labelledby="passages-heading" className="mt-6">
          <h2 id="passages-heading" className="mb-2 text-sm font-semibold">
            Textstellen im Plenarprotokoll
          </h2>
          <VoteResultTextHelper procedureId={procedureId} importantDocuments={importantDocuments} />
        </section>
      )}

      <section aria-labelledby="result-heading" className="mt-8 border-t pt-6">
        <h2 id="result-heading" className="mb-4 text-lg font-semibold">
          Ergebnis
        </h2>
        {namedVote ? (
          <VoteResultsFormNamedPoll data={customData.voteResults} procedureId={procedureId} />
        ) : (
          <VoteResultsForm
            data={customData.voteResults}
            type={type}
            procedureId={procedureId}
            period={period}
            lastPlenaryProtocoll={plenaryProtocols.slice(-1)[0]}
            title={title}
            drucksachen={importantDocuments?.map(({ number }) => number).filter(Boolean)}
          />
        )}
      </section>
    </Layout>
  );
};

export default Procedure;
