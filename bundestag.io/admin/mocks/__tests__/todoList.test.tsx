/**
 * The to-do list against the mock API: the same handlers and data as `pnpm dev:mock`.
 */
import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache } from '@apollo/client';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { ProcedureList } from '../../src/components/Procedures/List';
import { resetDb } from '../db';
import { handlers, MOCK_ENV } from '../handlers';

const server = setupServer(...handlers);
beforeAll(() => {
  // only Date: the fixtures' upcoming votes must stay in the future
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-14T12:00:00.000Z'));
  server.listen({ onUnhandledFrame: 'error' });
});
beforeEach(() => resetDb());
afterAll(() => {
  server.close();
  vi.useRealTimers();
});

const renderList = () =>
  render(
    <ApolloProvider
      client={
        new ApolloClient({ link: new HttpLink({ uri: MOCK_ENV.BUNDESTAGIO_SERVER_URL }), cache: new InMemoryCache() })
      }
    >
      <ProcedureList />
    </ApolloProvider>,
  );

describe('to-do list', () => {
  it('groups the open procedures by week and explains why 341459 is still open', async () => {
    renderList();
    expect(await screen.findByText('13 offen')).toBeTruthy();
    expect(screen.getByText('KW 46 · 12.–13.11.2026')).toBeTruthy();
    expect(screen.getByText('KW 45 · 6.11.2026')).toBeTruthy();

    const row = screen.getByText(/autonomen Waffensystemen/).closest('tr') as HTMLElement;
    expect(within(row).getByText('Eintrag ohne Ja-Stimmen')).toBeTruthy();
    // a procedure with a result and an upcoming vote are not on the list
    expect(screen.queryByText('325644')).toBeNull();
    expect(screen.queryByText('336653')).toBeNull();
  });

  it('filters the whole list, not just one page', async () => {
    renderList();
    await screen.findByText('13 offen');

    fireEvent.change(screen.getByLabelText('Suche'), { target: { value: 'irini' } });
    expect(screen.getByText('2 von 13 offen')).toBeTruthy();

    fireEvent.click(screen.getByText('Filter zurücksetzen'));
    fireEvent.change(screen.getByLabelText('Stand'), { target: { value: 'Überwiesen' } });
    expect(screen.getByText('1 von 13 offen')).toBeTruthy();
    expect(screen.getByText(/Fossile Profite/)).toBeTruthy();
  });
});
