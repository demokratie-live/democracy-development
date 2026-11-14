/**
 * The detail page against the mock API: head, sources and protocol passages.
 */
import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache } from '@apollo/client';
import { render, screen } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import Procedure from '../../src/pages/procedure/[id]';
import { resetDb } from '../db';
import { handlers, MOCK_ENV } from '../handlers';

const router = vi.hoisted(() => ({ query: { id: '' } }));
vi.mock('next/router', () => ({ useRouter: () => router }));

const server = setupServer(...handlers);
beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-14T12:00:00.000Z'));
  server.listen({ onUnhandledFrame: 'error' });
});
beforeEach(() => resetDb());
afterAll(() => {
  server.close();
  vi.useRealTimers();
});

const renderPage = (id: string) => {
  router.query.id = id;
  return render(
    <ApolloProvider
      client={
        new ApolloClient({ link: new HttpLink({ uri: MOCK_ENV.BUNDESTAGIO_SERVER_URL }), cache: new InMemoryCache() })
      }
    >
      <Procedure />
    </ApolloProvider>,
  );
};

describe('procedure page', () => {
  it('shows head, documents and protocols with links, and the protocol passage', async () => {
    renderPage('341113');
    expect(await screen.findByText('Ergebnis fehlt')).toBeTruthy();
    expect(screen.getByText('12.11.2026')).toBeTruthy();
    expect(screen.getByText('Abgelehnt')).toBeTruthy();

    const doc = screen.getByText('Beschlussempfehlung und Bericht').closest('a');
    expect(doc?.getAttribute('href')).toMatch(/^https:\/\/dserver\.bundestag\.de\//);
    expect(doc?.getAttribute('target')).toBe('_blank');
    expect(
      screen
        .getByText(/BT-Plenarprotokoll 21\/Beispiel/)
        .closest('a')
        ?.getAttribute('href'),
    ).toBe('http://localhost:4010/plenarprotokoll/341113.pdf');

    expect(await screen.findByText(/Ich schließe die Aussprache/)).toBeTruthy();
    // getByRole would compute styles, which jsdom cannot do for Tailwind's arbitrary values
    const backLinks = screen.getAllByText('ToDo').map((el) => el.closest('a')?.getAttribute('href'));
    expect(backLinks).toContain('/procedures');
  });

  it('does not call an upcoming vote overdue', async () => {
    renderPage('336653');
    expect(await screen.findByText('Abstimmung steht aus')).toBeTruthy();
    expect(screen.getByText(/in 12 Tagen/)).toBeTruthy();
  });

  it('says so when the procedure does not exist', async () => {
    renderPage('999999');
    expect(await screen.findByText('Vorgang 999999 nicht gefunden.')).toBeTruthy();
  });
});
