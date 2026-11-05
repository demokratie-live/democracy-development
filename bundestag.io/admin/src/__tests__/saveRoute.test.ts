// @vitest-environment node
import { getServerSession } from 'next-auth';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import save from '../pages/api/procedures/save';

const mutate = vi.fn();

vi.mock('next-auth', () => ({ getServerSession: vi.fn() }));
vi.mock('../pages/api/auth/[...nextauth]', () => ({ authOptions: {} }));
vi.mock('../lib/apolloClient', () => ({ getApolloClient: () => ({ mutate }) }));

const session = vi.mocked(getServerSession);

const response = () => {
  const res = { status: vi.fn(), send: vi.fn(), end: vi.fn() };
  res.status.mockReturnValue(res);
  res.send.mockReturnValue(res);
  return res;
};

describe('POST /api/procedures/save', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    mutate.mockReset();
    session.mockResolvedValue({ user: { name: 'test' } });
  });

  it('answers 401 without a session', async () => {
    session.mockResolvedValue(null);
    const res = response();
    await save({ body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(mutate).not.toHaveBeenCalled();
  });

  it('answers once with the GraphQL error', async () => {
    mutate.mockRejectedValue({ graphQLErrors: [{ message: 'Procedure not found' }] });
    const res = response();
    await save({ body: { procedureId: '1' } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Procedure not found');
    expect(res.end).not.toHaveBeenCalled();
  });

  it('answers once on a network error', async () => {
    mutate.mockRejectedValue(new Error('connect ECONNREFUSED'));
    const res = response();
    await save({ body: { procedureId: '1' } }, res);
    expect(res.send).toHaveBeenCalledWith('connect ECONNREFUSED');
    expect(res.end).not.toHaveBeenCalled();
  });

  it('ends the response after saving', async () => {
    mutate.mockResolvedValue({});
    const res = response();
    await save({ body: { procedureId: '1', namedPoll: true, toggleDecision: true } }, res);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.end).toHaveBeenCalledTimes(1);
  });
});
