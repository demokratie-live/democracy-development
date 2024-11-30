'use client';

import { Table } from 'antd';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

interface TableComponentProps {
  procedures: Array<{
    key: string;
    title: string;
    procedureId: string;
    voteDate: string;
    votes: Array<{
      party: string;
      decision: string;
    }>;
  }>;
}

const TableComponent = ({ procedures, pagination }: TableComponentProps & { pagination: any }) => {
  const { push } = useRouter();
  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Procedure ID',
      dataIndex: 'procedureId',
      key: 'procedureId',
    },
    {
      title: 'Vote Date',
      dataIndex: 'voteDate',
      key: 'voteDate',
      render: (date) => format(new Date(date), 'dd.MM.yyyy', { locale: de }),
    },
    {
      title: 'Votes',
      dataIndex: 'votes',
      key: 'votes',
      render: (votes) => (
        <ul>
          {votes.map((vote) => (
            <li key={vote.party}>
              <strong>{vote.party}</strong>: {vote.decision}
            </li>
          ))}
        </ul>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => <a href={`/procedure/${record.procedureId}`}>Edit</a>,
    },
  ];

  const handlePageChange = (page) => {
    push(`?page=${page}`);
  };

  return <Table columns={columns} dataSource={procedures} pagination={{ ...pagination, onChange: handlePageChange }} />;
};

export default TableComponent;
