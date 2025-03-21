import React, { useRef, useState } from 'react';
import { Table, Input, Button, Select } from 'antd';
import Link from 'next/link';

import { PROCEDURE as PROCEDURE_DEFINITIONS } from '@democracy-deutschland/bundestag.io-definitions';

import PROCEDURE_LIST from '../../graphql/queries/procedureList';
import Icon from '@ant-design/icons/lib/components/Icon';
import { useQuery } from '@apollo/client';
import { ColumnType } from 'antd/es/table/interface';

const { Option } = Select;

const procedureStatis = [
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

export const ProcedureList: React.FC = () => {
  const [period, setPeriod] = useState(21);
  const [pageSize, setPageSize] = useState(10);
  const [pageCurrent, setPageCurrent] = useState(1);
  const { data, loading } = useQuery(PROCEDURE_LIST, {
    variables: {
      period,
      manageVoteDate: true,
      limit: pageSize,
      offset: pageSize * (pageCurrent - 1),
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network',
  });
  const searchInput = useRef<any>(null);

  const procedures = data?.proceduresData.nodes || [];

  const getColumnSearchProps = (dataIndex): ColumnType<any> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Button
          type="primary"
          onClick={() => handleSearch(selectedKeys, confirm)}
          icon="search"
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Search
        </Button>
        <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
          Reset
        </Button>
      </div>
    ),
    filterIcon: (filtered) => <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) => record[dataIndex].toString().toLowerCase().includes(value),
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select());
      }
    },
  });

  const handleSearch = (selectedKeys, confirm) => {
    confirm();
  };

  const handleReset = (clearFilters) => {
    clearFilters();
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'procedureId',
      name: 'procedureId',
      sorter: (a, b) => a.procedureId - b.procedureId,
      width: '100px',
      // ...getColumnSearchProps('procedureId'),
    },
    {
      title: 'Date',
      dataIndex: 'voteDate',
      name: 'voteDate',
      sorter: (a, b) => new Date(a.voteDate).getTime() - new Date(b.voteDate).getTime(),
      width: '125px',
      render: (value) => {
        const dateString = value ? new Date(value).toLocaleDateString() : '';
        const color = new Date(value) < new Date() ? 'red' : 'rgb(32, 167, 54)';
        return <span style={{ color }}>{dateString}</span>;
      },
    },
    {
      title: 'State',
      dataIndex: 'currentStatus',
      width: '200px',
      sorter: (a, b) =>
        a.currentStatus && b.currentStatus
          ? procedureStatis.indexOf(a.currentStatus) - procedureStatis.indexOf(b.currentStatus)
          : 0,
      filters: procedures
        .reduce(
          (prev, procedure) =>
            procedure.currentStatus && !prev.some(({ value }) => value === procedure.currentStatus)
              ? [
                  ...prev,
                  {
                    text: procedure.currentStatus,
                    value: procedure.currentStatus,
                  },
                ]
              : prev,
          [],
        )
        .sort((a, b) =>
          a && b && a.value && b.value ? procedureStatis.indexOf(a.value) - procedureStatis.indexOf(b.value) : 1,
        ),
      onFilter: (value, { currentStatus }) => value === currentStatus,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
      ...getColumnSearchProps('title'),
      render: (title, { procedureId }) => (
        <Link as={`/procedure/${procedureId}`} href={`/procedure?id=${procedureId}`} legacyBehavior>
          <a>{title}</a>
        </Link>
      ),
    },
    {
      title: 'Named',
      key: 'named',
      width: '100px',
      filters: [
        {
          text: 'Named',
          value: 'true',
        },
        {
          text: 'not Named',
          value: 'false',
        },
      ],
      filterMultiple: false,
      onFilter: (value, { namedVote }) => (value === 'true' && namedVote) || (value === 'false' && !namedVote),
      render: ({ namedVote }) => <>{namedVote && <Icon key={'idcard'} type="idcard" />}</>,
    },
    {
      title: 'Daten',
      key: 'data',
      width: '100px',
      filters: [
        {
          text: 'mit Daten',
          value: 'true',
        },
        {
          text: 'ohne Daten',
          value: 'false',
        },
      ],
      filterMultiple: false,
      onFilter: (value, { namedVote, customData: { voteResults } }) =>
        (value === 'true' && (namedVote || voteResults.yes > 0 || voteResults.no > 0 || voteResults.abstination > 0)) ||
        (value === 'false' && !(voteResults.yes > 0 || voteResults.no > 0 || voteResults.abstination > 0)),
      render: ({ namedVote, customData: { voteResults } }) =>
        (namedVote || voteResults.yes > 0 || voteResults.no > 0 || voteResults.abstination > 0) && (
          <Icon key={'pie-chart'} type="pie-chart" />
        ),
    },
  ];

  return (
    <div>
      <div>
        Period:
        <Select defaultValue={21} onChange={(value) => setPeriod(value)}>
          <Option value={19}>19</Option>
          <Option value={20}>20</Option>
          <Option value={21}>21</Option>
        </Select>
      </div>
      <Table
        pagination={{
          onChange: (page, pageSize) => {
            setPageSize(pageSize);
            setPageCurrent(page);
          },
          pageSize: pageSize,
          total: data?.proceduresData.totalCount,
          current: pageCurrent,
        }}
        loading={loading}
        columns={columns}
        dataSource={procedures}
        rowKey={(procedure) => procedure.procedureId}
      />
    </div>
  );
};
