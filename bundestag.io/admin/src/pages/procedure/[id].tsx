import { Alert, Card, Col, Descriptions, Row, Space, Tag, Typography } from 'antd';
import { Layout } from '../../components/Layout';
import App from '../../components/App';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { PROCEDURE as PROCEDURE_DEFINITIONS } from '@democracy-deutschland/bundestag.io-definitions';

import VoteResultsForm from '../../components/Procedures/VoteResultsForm';
import { VoteResultsFormNamedPoll } from '../../components/Procedures/VoteResultsFormNamedPoll';

import { PROCEDURE } from '../../graphql/queries/procedure';
import { VoteResultTextHelper } from '../../components/Procedures/VoteResultTextHelper';
import { useQuery } from '@apollo/client';

const formatVoteDate = (value?: string | null) => {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleDateString('de-DE');
};

const isPastVoteDate = (value?: string | null) => {
  if (!value) {
    return false;
  }

  return new Date(value).getTime() < Date.now();
};

const hasVoteData = (namedVote?: boolean | null, voteResults?: any) => {
  if (namedVote) {
    return true;
  }

  if (!voteResults) {
    return false;
  }

  if (voteResults.decisionText?.trim() || voteResults.votingDocument) {
    return true;
  }

  if ((voteResults.yes ?? 0) > 0 || (voteResults.no ?? 0) > 0 || (voteResults.abstination ?? 0) > 0) {
    return true;
  }

  return (voteResults.partyVotes ?? []).some((vote) => {
    if (!vote) {
      return false;
    }

    return Boolean(vote.main) || (vote.deviants?.yes ?? 0) > 0 || (vote.deviants?.abstination ?? 0) > 0 || (vote.deviants?.no ?? 0) > 0;
  });
};

const emptyVoteResults = {
  yes: 0,
  no: 0,
  abstination: 0,
  decisionText: '',
  votingDocument: undefined,
  votingRecommendation: undefined,
  partyVotes: [],
};

const Procedure: React.FC = () => {
  const router = useRouter();

  const { data, loading, error } = useQuery(PROCEDURE, {
    variables: {
      procedureId: router.query.id || '',
    },
    fetchPolicy: 'cache-and-network',
    skip: !router.query.id,
  });

  if (loading) {
    return <div>…loading</div>;
  }

  if (error) {
    return (
      <Layout>
        <App>
          <Alert showIcon type="error" message="Vorgang konnte nicht geladen werden" description={error.message} />
        </App>
      </Layout>
    );
  }

  if (!data?.procedure) {
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
    voteDate,
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

  const voteResults = customData?.voteResults ?? emptyVoteResults;
  const voteDataAvailable = hasVoteData(namedVote, voteResults);
  const plenaryProtocolls =
    history?.filter(({ findSpot }) => {
      return findSpot?.search(PROCEDURE_DEFINITIONS.HISTORY.FINDSPOT.FIND_BT_PLENARPROTOKOLL) !== -1;
    }) || [];

  return (
    <Layout>
      <App>
        <Space direction="vertical" size="large" style={{ display: 'flex' }}>
          <Space direction="vertical" size={4}>
            <Link href="/procedures">← Zurück zur Übersicht</Link>
            <Typography.Title level={2} style={{ margin: 0 }}>
              {title}
            </Typography.Title>
            <Space size={[8, 8]} wrap>
              <Tag color="blue">{type}</Tag>
              <Tag color={namedVote ? 'geekblue' : 'default'}>{namedVote ? 'named' : 'party'}</Tag>
              <Tag color={voteDataAvailable ? 'success' : 'default'}>
                {voteDataAvailable ? 'Daten eingetragen' : 'Daten offen'}
              </Tag>
              <Tag color={!voteDate ? 'default' : isPastVoteDate(voteDate) ? 'red' : 'green'}>
                VoteDate: {formatVoteDate(voteDate)}
              </Tag>
            </Space>
          </Space>

          <Card>
            <Descriptions
              bordered
              column={{ xs: 1, md: 2 }}
              items={[
                {
                  key: 'procedureId',
                  label: 'Prozedur ID',
                  children: procedureId,
                },
                {
                  key: 'status',
                  label: 'State',
                  children: currentStatus || '—',
                },
                {
                  key: 'type',
                  label: 'Typ',
                  children: type || '—',
                },
                {
                  key: 'period',
                  label: 'Legislaturperiode',
                  children: period || '—',
                },
                {
                  key: 'voteDate',
                  label: 'Abstimmungstermin',
                  children: <span style={{ color: isPastVoteDate(voteDate) ? '#cf1322' : '#389e0d' }}>{formatVoteDate(voteDate)}</span>,
                },
                {
                  key: 'statusData',
                  label: 'Status',
                  children: voteDataAvailable ? 'done' : 'todo',
                },
              ]}
            />
          </Card>

          <Row gutter={[16, 16]}>
            <Col xs={24} xl={12}>
              <Card title="Dokumente" styles={{ body: { display: 'flex', flexDirection: 'column', gap: 12 } }}>
                {importantDocuments?.length ? (
                  importantDocuments.map((document) => {
                    const label = `${document.type} (${document.editor} – ${document.number})`;

                    return document.url ? (
                      <Link href={document.url} key={document.number} target="_blank">
                        {label}
                      </Link>
                    ) : (
                      <span key={document.number}>{label}</span>
                    );
                  })
                ) : (
                  <Typography.Text type="secondary">Keine Dokumente vorhanden.</Typography.Text>
                )}
              </Card>
            </Col>
            <Col xs={24} xl={12}>
              <Card title="Plenarprotokolle" styles={{ body: { display: 'flex', flexDirection: 'column', gap: 12 } }}>
                {plenaryProtocolls.length ? (
                  plenaryProtocolls.map(({ initiator, findSpotUrl, findSpot }) => {
                    const label = `${initiator} – ${findSpot}`;

                    return findSpotUrl ? (
                      <Link href={findSpotUrl} key={findSpot} target="_blank">
                        {label}
                      </Link>
                    ) : (
                      <span key={findSpot}>{label}</span>
                    );
                  })
                ) : (
                  <Typography.Text type="secondary">Kein Plenarprotokoll verknüpft.</Typography.Text>
                )}
              </Card>
            </Col>
          </Row>

          {!namedVote && (
            <Card title="Beschlusstext & KI-Hilfe">
              <VoteResultTextHelper procedureId={procedureId} importantDocuments={importantDocuments} />
            </Card>
          )}

          <Card title={namedVote ? 'Abstimmungsergebnis (named)' : 'Abstimmungsergebnis'}>
            {!namedVote && (
              <VoteResultsForm
                data={voteResults}
                type={type}
                procedureId={procedureId}
                period={period}
                lastPlenaryProtocoll={plenaryProtocolls?.slice(-1)?.[0]}
                title={title}
              />
            )}
            {namedVote && <VoteResultsFormNamedPoll data={voteResults} procedureId={procedureId} />}
          </Card>
        </Space>
      </App>
    </Layout>
  );
};

export default Procedure;
