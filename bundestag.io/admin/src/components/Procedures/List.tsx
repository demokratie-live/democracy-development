import React, { useMemo, useState } from 'react';
import { Alert, Badge, Card, Input, Select, Space, Table, Tabs, Tag, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import Link from 'next/link';

import { PROCEDURE as PROCEDURE_DEFINITIONS } from '@democracy-deutschland/bundestag.io-definitions';

import PROCEDURE_LIST from '../../graphql/queries/procedureList';
import { useQuery } from '@apollo/client';
import { IdcardOutlined, PieChartOutlined, SearchOutlined } from '@ant-design/icons';

const periodOptions = [19, 20, 21];
const pageSizeOptions = ['10', '20', '50'];

const procedureStates = [
  PROCEDURE_DEFINITIONS.STATUS.NICHT_BERATEN,
  PROCEDURE_DEFINITIONS.STATUS.UEBERWIESEN,
  PROCEDURE_DEFINITIONS.STATUS.BESCHLUSSEMPFEHLUNG,
  PROCEDURE_DEFINITIONS.STATUS.ABGELEHNT,
  PROCEDURE_DEFINITIONS.STATUS.ANGENOMMEN,
  PROCEDURE_DEFINITIONS.STATUS.VERABSCHIEDET,
  PROCEDURE_DEFINITIONS.STATUS.BR_VERMITTLUNGSAUSSCHUSS_NICHT_ANGERUFEN,
  PROCEDURE_DEFINITIONS.STATUS.VERMITTLUNGSVERFAHREN,
  PROCEDURE_DEFINITIONS.STATUS.BR_ZUGESTIMMT,
  PROCEDURE_DEFINITIONS.STATUS.VERKUENDET,
];

type ViewKey = 'todo' | 'conferenceWeek' | 'past' | 'top100';
type VoteTypeFilter = 'all' | 'named' | 'party';
type DataStatusFilter = 'all' | 'done' | 'todo';

type PartyVote = {
  main?: string | null;
  deviants?: {
    yes?: number | null;
    abstination?: number | null;
    no?: number | null;
  } | null;
} | null;

type VoteResults = {
  yes?: number | null;
  no?: number | null;
  abstination?: number | null;
  decisionText?: string | null;
  votingDocument?: string | null;
  partyVotes?: PartyVote[] | null;
} | null;

type ProcedureRecord = {
  procedureId?: string | null;
  title?: string | null;
  type?: string | null;
  currentStatus?: string | null;
  namedVote?: boolean | null;
  activities?: number | null;
  lastUpdateDate?: string | null;
  voteDate?: string | null;
  voteEnd?: string | null;
  customData?: {
    voteResults?: VoteResults;
  } | null;
};

const normalizeText = (value?: string | null) => value?.toLowerCase().trim() ?? '';

const toTimestamp = (value?: string | null) => {
  if (!value) {
    return Number.NaN;
  }

  return new Date(value).getTime();
};

const formatDate = (value?: string | null) => {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleDateString('de-DE');
};

const isPastDate = (value?: string | null) => {
  if (!value) {
    return false;
  }

  return new Date(value).getTime() < Date.now();
};

const hasVoteData = (procedure: ProcedureRecord) => {
  if (procedure.namedVote) {
    return true;
  }

  const voteResults = procedure.customData?.voteResults;

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

const isUpcomingProcedure = (procedure: ProcedureRecord) => {
  const now = Date.now();
  const voteDate = toTimestamp(procedure.voteDate);
  const voteEnd = toTimestamp(procedure.voteEnd);

  return (
    (!Number.isNaN(voteDate) && voteDate >= now && (Number.isNaN(voteEnd) || voteEnd >= now)) ||
    (!Number.isNaN(voteEnd) && voteEnd >= now)
  );
};

const isPastProcedure = (procedure: ProcedureRecord) => {
  const now = Date.now();
  const voteDate = toTimestamp(procedure.voteDate);
  const voteEnd = toTimestamp(procedure.voteEnd);

  return (!Number.isNaN(voteDate) && voteDate < now) || (!Number.isNaN(voteEnd) && voteEnd < now);
};

const compareProcedureState = (left?: string | null, right?: string | null) =>
  procedureStates.indexOf(left ?? '') - procedureStates.indexOf(right ?? '');

const compareProcedureId = (left?: string | null, right?: string | null) =>
  (parseInt(left ?? '0', 10) || 0) - (parseInt(right ?? '0', 10) || 0);

const compareDateValue = (left?: string | null, right?: string | null) => {
  const leftTimestamp = toTimestamp(left);
  const rightTimestamp = toTimestamp(right);

  if (Number.isNaN(leftTimestamp) && Number.isNaN(rightTimestamp)) {
    return 0;
  }

  if (Number.isNaN(leftTimestamp)) {
    return 1;
  }

  if (Number.isNaN(rightTimestamp)) {
    return -1;
  }

  return leftTimestamp - rightTimestamp;
};

const compareTop100 = (left: ProcedureRecord, right: ProcedureRecord) => {
  const activityDiff = (right.activities ?? 0) - (left.activities ?? 0);

  if (activityDiff !== 0) {
    return activityDiff;
  }

  const lastUpdateDiff = toTimestamp(right.lastUpdateDate) - toTimestamp(left.lastUpdateDate);

  if (!Number.isNaN(lastUpdateDiff) && lastUpdateDiff !== 0) {
    return lastUpdateDiff;
  }

  return (left.title ?? '').localeCompare(right.title ?? '', 'de');
};

export const ProcedureList: React.FC = () => {
  const [period, setPeriod] = useState(21);
  const [activeView, setActiveView] = useState<ViewKey>('todo');
  const [searchValue, setSearchValue] = useState('');
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [voteTypeFilter, setVoteTypeFilter] = useState<VoteTypeFilter>('all');
  const [dataStatusFilter, setDataStatusFilter] = useState<DataStatusFilter>('all');
  const [pageSize, setPageSize] = useState(10);
  const [pageCurrent, setPageCurrent] = useState(1);

  const {
    data: allProceduresData,
    loading: loadingAllProcedures,
    error: allProceduresError,
  } = useQuery(PROCEDURE_LIST, {
    variables: {
      period,
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network',
  });

  const {
    data: todoProceduresData,
    loading: loadingTodoProcedures,
    error: todoProceduresError,
  } = useQuery(PROCEDURE_LIST, {
    variables: {
      period,
      manageVoteDate: true,
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network',
  });

  const resetPagination = () => setPageCurrent(1);

  const allProcedures = useMemo(
    () => ((allProceduresData?.proceduresData.nodes ?? []) as ProcedureRecord[]).filter(Boolean),
    [allProceduresData],
  );

  const todoProcedures = useMemo(
    () => ((todoProceduresData?.proceduresData.nodes ?? []) as ProcedureRecord[]).filter(Boolean),
    [todoProceduresData],
  );

  const conferenceWeekProcedures = useMemo(
    () =>
      allProcedures
        .filter(isUpcomingProcedure)
        .sort((left, right) => {
          const voteDateDiff = toTimestamp(left.voteDate) - toTimestamp(right.voteDate);

          if (!Number.isNaN(voteDateDiff) && voteDateDiff !== 0) {
            return voteDateDiff;
          }

          return compareProcedureId(left.procedureId, right.procedureId);
        }),
    [allProcedures],
  );

  const pastProcedures = useMemo(
    () =>
      allProcedures
        .filter(isPastProcedure)
        .sort((left, right) => {
          const voteDateDiff = toTimestamp(right.voteDate) - toTimestamp(left.voteDate);

          if (!Number.isNaN(voteDateDiff) && voteDateDiff !== 0) {
            return voteDateDiff;
          }

          return compareProcedureId(right.procedureId, left.procedureId);
        }),
    [allProcedures],
  );

  const top100Procedures = useMemo(() => [...allProcedures].sort(compareTop100).slice(0, 100), [allProcedures]);

  const proceduresByView: Record<ViewKey, ProcedureRecord[]> = useMemo(
    () => ({
      todo: todoProcedures,
      conferenceWeek: conferenceWeekProcedures,
      past: pastProcedures,
      top100: top100Procedures,
    }),
    [conferenceWeekProcedures, pastProcedures, todoProcedures, top100Procedures],
  );

  const stateOptions = useMemo(
    () =>
      Array.from(new Set(allProcedures.map(({ currentStatus }) => currentStatus).filter(Boolean) as string[])).sort(
        compareProcedureState,
      ),
    [allProcedures],
  );

  const typeOptions = useMemo(
    () => Array.from(new Set(allProcedures.map(({ type }) => type).filter(Boolean) as string[])).sort(),
    [allProcedures],
  );

  const filteredProcedures = useMemo(() => {
    const searchTerm = normalizeText(searchValue);

    return proceduresByView[activeView].filter((procedure) => {
      const matchesSearch =
        !searchTerm ||
        normalizeText(procedure.title).includes(searchTerm) ||
        normalizeText(procedure.procedureId).includes(searchTerm);

      const matchesState = selectedStates.length === 0 || selectedStates.includes(procedure.currentStatus ?? '');
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(procedure.type ?? '');
      const matchesVoteType =
        voteTypeFilter === 'all' ||
        (voteTypeFilter === 'named' && Boolean(procedure.namedVote)) ||
        (voteTypeFilter === 'party' && !procedure.namedVote);
      const voteDataAvailable = hasVoteData(procedure);
      const matchesDataStatus =
        dataStatusFilter === 'all' ||
        (dataStatusFilter === 'done' && voteDataAvailable) ||
        (dataStatusFilter === 'todo' && !voteDataAvailable);

      return matchesSearch && matchesState && matchesType && matchesVoteType && matchesDataStatus;
    });
  }, [activeView, dataStatusFilter, proceduresByView, searchValue, selectedStates, selectedTypes, voteTypeFilter]);

  const columns: TableColumnsType<ProcedureRecord> = [
    {
      title: 'ID',
      dataIndex: 'procedureId',
      width: 110,
      sorter: (left, right) => compareProcedureId(left.procedureId, right.procedureId),
      render: (procedureId) => procedureId ?? '—',
    },
    {
      title: 'Date',
      dataIndex: 'voteDate',
      width: 140,
      sorter: (left, right) => compareDateValue(left.voteDate, right.voteDate),
      render: (voteDate) => {
        if (!voteDate) {
          return '—';
        }

        return <span style={{ color: isPastDate(voteDate) ? '#cf1322' : '#389e0d' }}>{formatDate(voteDate)}</span>;
      },
    },
    {
      title: 'State',
      dataIndex: 'currentStatus',
      width: 220,
      sorter: (left, right) => compareProcedureState(left.currentStatus, right.currentStatus),
      render: (currentStatus) => currentStatus ?? '—',
    },
    {
      title: 'Title',
      dataIndex: 'title',
      sorter: (left, right) => (left.title ?? '').localeCompare(right.title ?? '', 'de'),
      render: (title, { procedureId }) =>
        procedureId ? <Link href={`/procedure/${procedureId}`}>{title}</Link> : (title ?? '—'),
    },
    {
      title: 'Type',
      key: 'type',
      width: 220,
      sorter: (left, right) => (left.type ?? '').localeCompare(right.type ?? '', 'de'),
      render: (_, procedure) => (
        <Space size={[4, 4]} wrap>
          <Tag>{procedure.type ?? '—'}</Tag>
          <Tag color={procedure.namedVote ? 'geekblue' : 'default'}>{procedure.namedVote ? 'named' : 'party'}</Tag>
        </Space>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 150,
      sorter: (left, right) => Number(hasVoteData(left)) - Number(hasVoteData(right)),
      render: (_, procedure) =>
        hasVoteData(procedure) ? (
          <Space size={6}>
            <PieChartOutlined />
            <Tag color="success">done</Tag>
          </Space>
        ) : (
          <Tag>todo</Tag>
        ),
    },
  ];

  const viewCounts = {
    todo: todoProceduresData?.proceduresData.totalCount ?? todoProcedures.length,
    conferenceWeek: conferenceWeekProcedures.length,
    past: pastProcedures.length,
    top100: top100Procedures.length,
  };

  const loading = loadingAllProcedures || (activeView === 'todo' && loadingTodoProcedures);
  const error = activeView === 'todo' ? todoProceduresError ?? allProceduresError : allProceduresError;

  if (error) {
    return <Alert showIcon type="error" message="Fehler beim Laden der Vorgänge" description={error.message} />;
  }

  return (
    <Space direction="vertical" size="large" style={{ display: 'flex' }}>
      <Card>
        <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
          <div>
            <Typography.Title level={4} style={{ marginBottom: 4 }}>
              b.io Admin
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
              Sortieren, filtern und direkt in die Detailansicht wechseln.
            </Typography.Paragraph>
          </div>

          <Space size={[12, 12]} wrap>
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="ID / Titel suchen"
              style={{ width: 280 }}
              value={searchValue}
              onChange={(event) => {
                setSearchValue(event.target.value);
                resetPagination();
              }}
            />
            <Select
              value={period}
              style={{ width: 120 }}
              options={periodOptions.map((value) => ({ label: `Periode ${value}`, value }))}
              onChange={(value) => {
                setPeriod(value);
                resetPagination();
              }}
            />
            <Select
              allowClear
              mode="multiple"
              placeholder="State"
              style={{ minWidth: 220 }}
              value={selectedStates}
              options={stateOptions.map((value) => ({ label: value, value }))}
              onChange={(value) => {
                setSelectedStates(value);
                resetPagination();
              }}
            />
            <Select
              allowClear
              mode="multiple"
              placeholder="Type"
              style={{ minWidth: 180 }}
              value={selectedTypes}
              options={typeOptions.map((value) => ({ label: value, value }))}
              onChange={(value) => {
                setSelectedTypes(value);
                resetPagination();
              }}
            />
            <Select
              value={voteTypeFilter}
              style={{ width: 150 }}
              options={[
                { label: 'VoteType: alle', value: 'all' },
                { label: 'VoteType: named', value: 'named' },
                { label: 'VoteType: party', value: 'party' },
              ]}
              onChange={(value: VoteTypeFilter) => {
                setVoteTypeFilter(value);
                resetPagination();
              }}
            />
            <Select
              value={dataStatusFilter}
              style={{ width: 160 }}
              options={[
                { label: 'Status: alle', value: 'all' },
                { label: 'Status: done', value: 'done' },
                { label: 'Status: todo', value: 'todo' },
              ]}
              onChange={(value: DataStatusFilter) => {
                setDataStatusFilter(value);
                resetPagination();
              }}
            />
          </Space>
        </Space>
      </Card>

      <Card bodyStyle={{ paddingTop: 12 }}>
        <Tabs
          activeKey={activeView}
          onChange={(key) => {
            setActiveView(key as ViewKey);
            resetPagination();
          }}
          items={[
            {
              key: 'todo',
              label: (
                <Space size={6}>
                  <span>Todo</span>
                  <Badge count={viewCounts.todo} showZero />
                </Space>
              ),
            },
            {
              key: 'conferenceWeek',
              label: (
                <Space size={6}>
                  <span>Sitzungswoche</span>
                  <Badge count={viewCounts.conferenceWeek} showZero />
                </Space>
              ),
            },
            {
              key: 'past',
              label: (
                <Space size={6}>
                  <span>Vergangen</span>
                  <Badge count={viewCounts.past} showZero />
                </Space>
              ),
            },
            {
              key: 'top100',
              label: (
                <Space size={6}>
                  <span>Top 100</span>
                  <Badge count={viewCounts.top100} showZero />
                </Space>
              ),
            },
          ]}
        />

        {activeView === 'top100' && (
          <Alert
            showIcon
            style={{ marginBottom: 16 }}
            type="info"
            message="Top-100 nach Aktivitätsindex"
            description="Die Liste wird anhand des gespeicherten Aktivitätsindex und des letzten Updates sortiert."
          />
        )}

        <Table
          columns={columns}
          dataSource={filteredProcedures}
          loading={loading}
          pagination={{
            current: pageCurrent,
            pageSize,
            pageSizeOptions,
            showSizeChanger: true,
            total: filteredProcedures.length,
            onChange: (page, nextPageSize) => {
              setPageCurrent(page);
              setPageSize(nextPageSize);
            },
          }}
          rowKey={(procedure) => procedure.procedureId ?? procedure.title ?? 'procedure'}
          scroll={{ x: 1100 }}
        />

        <Space size={16} style={{ marginTop: 12 }} wrap>
          <Tag color="green">grün = kommender Abstimmungstermin</Tag>
          <Tag color="red">rot = vergangener Abstimmungstermin</Tag>
          <Space size={6}>
            <IdcardOutlined />
            <span>named vote</span>
          </Space>
        </Space>
      </Card>
    </Space>
  );
};
