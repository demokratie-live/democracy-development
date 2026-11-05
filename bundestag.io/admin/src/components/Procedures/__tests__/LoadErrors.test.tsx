import { MockedProvider } from '@apollo/client/testing';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PROCEDURE } from '../../../graphql/queries/procedure';
import PROCEDURE_LIST from '../../../graphql/queries/procedureList';
import Procedure from '../../../pages/procedure/[id]';
import { ProcedureList } from '../List';

vi.mock('next/router', () => ({ useRouter: () => ({ query: { id: '1' } }) }));

const failing = (query) => [
  { request: { query }, variableMatcher: () => true, error: new Error('connect ECONNREFUSED') },
];

describe('load errors', () => {
  it('shows a failed procedure list', async () => {
    render(
      <MockedProvider mocks={failing(PROCEDURE_LIST)}>
        <ProcedureList />
      </MockedProvider>,
    );
    expect(await screen.findByText('Liste konnte nicht geladen werden')).toBeTruthy();
    expect(screen.getByText('connect ECONNREFUSED')).toBeTruthy();
  });

  it('shows a failed procedure', async () => {
    render(
      <MockedProvider mocks={failing(PROCEDURE)}>
        <Procedure />
      </MockedProvider>,
    );
    expect(await screen.findByText('Vorgang konnte nicht geladen werden')).toBeTruthy();
    expect(screen.getByText('connect ECONNREFUSED')).toBeTruthy();
  });
});
