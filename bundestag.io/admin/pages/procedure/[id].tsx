import { Layout } from '../../components/Layout';
import App from '../../components/App';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import Link from 'next/link';

import { PROCEDURE as PROCEDURE_DEFINITIONS } from '@democracy-deutschland/bundestag.io-definitions';

import VoteResultsForm from '../../components/Procedures/VoteResultsForm';
import { VoteResultsFormNamedPoll } from '../../components/Procedures/VoteResultsFormNamedPoll';

// GraphQL
import { PROCEDURE } from '../../graphql/queries/procedure';
import { VoteResultTextHelper } from '../../components/Procedures/VoteResultTextHelper';
import { useQuery } from '@apollo/client';

const DT = styled.dt`
  font-weight: bold;
`;

const DD = styled.dt`
  padding-left: 15px;
`;

const Procedure: React.FC = () => {
  const router = useRouter();

  const { data, loading } = useQuery(PROCEDURE, {
    variables: {
      procedureId: router.query.id || '',
    },
    fetchPolicy: 'cache-and-network',
  });
  console.log('data.procedure', data);

  if (loading) {
    return <div>…loading</div>;
  }
  if (!data || !data.procedure) {
    return <div>no data</div>;
  }

  const {
    loadingProcedure,
    procedureId,
    title,
    currentStatus,
    type,
    period,
    importantDocuments,
    history,
    customData,
    namedVote,
  } = data.procedure;
  if (loadingProcedure) {
    return (
      <Layout>
        <App>
          <div>loading</div>
        </App>
      </Layout>
    );
  }

  const plenaryProtocolls = history.filter(({ findSpot }) => {
    return findSpot.search(PROCEDURE_DEFINITIONS.HISTORY.FINDSPOT.FIND_BT_PLENARPROTOKOLL) !== -1;
  });

  return (
    <Layout>
      <App>
        <h2>{title}</h2>
        <dl
          style={{
            display: 'block',
            marginTop: '1em',
            marginBottom: '1em',
            marginLeft: 0,
            marginRight: 0,
          }}
        >
          <DT>Prozedur ID</DT>
          <DD>{procedureId}</DD>
          <DT>Status</DT>
          <DD>{currentStatus}</DD>
          <DT>Typ</DT>
          <DD>{type}</DD>
          <DT>Legislaturperiode</DT>
          <DD>{period}</DD>
          <DT>Dokumente</DT>
          {importantDocuments.map((document) => {
            return (
              <DD key={document.number}>
                <Link href={document.url} legacyBehavior>
                  <a target="_blank">{`${document.type} (${document.editor} – ${document.number})`}</a>
                </Link>
              </DD>
            );
          })}
          {plenaryProtocolls.length > 0 && (
            <>
              <DT>Plenarprotokoll</DT>
              {plenaryProtocolls.map(({ initiator, findSpotUrl, findSpot }) => {
                return (
                  <DD key={findSpot}>
                    <Link href={findSpotUrl} legacyBehavior>
                      <a target="_blank">
                        {initiator} – {findSpot}
                      </a>
                    </Link>
                  </DD>
                );
              })}
            </>
          )}
        </dl>
        {!namedVote && <VoteResultTextHelper procedureId={procedureId} importantDocuments={importantDocuments} />}
        {!namedVote && <VoteResultsForm data={customData.voteResults} type={type} procedureId={procedureId} />}
        {namedVote && <VoteResultsFormNamedPoll data={customData.voteResults} procedureId={procedureId} />}
      </App>
    </Layout>
  );
};

export default Procedure;
