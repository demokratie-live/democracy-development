import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { axiosClient } from '../../../lib/axios';
import VoteResultsForm, { getFractions } from '../VoteResultsForm';
import { VoteResultsFormNamedPoll } from '../VoteResultsFormNamedPoll';

vi.mock('../../../lib/axios', () => ({
  axiosClient: { post: vi.fn() },
}));

const post = vi.mocked(axiosClient.post);

const partyVotes = getFractions(21).map(({ name }) => ({
  party: name,
  main: 'NO' as const,
  deviants: { yes: 0, abstination: 0, no: 0 },
}));

const voteResults = (votingRecommendation?: boolean | null) => ({
  votingDocument: 'recommendedDecision',
  decisionText: 'Ablehnung der Vorlage auf Drucksache 21/1',
  partyVotes,
  votingRecommendation,
});

const renderForm = (votingRecommendation?: boolean | null) =>
  render(<VoteResultsForm data={voteResults(votingRecommendation)} type="Gesetzgebung" procedureId={1} period={21} />);

const renderNamedPollForm = (votingRecommendation?: boolean | null) =>
  render(<VoteResultsFormNamedPoll data={{ votingRecommendation }} procedureId="1" />);

const save = async () => {
  fireEvent.click(screen.getByRole('button', { name: 'Speichern' }));
  await waitFor(() => expect(post).toHaveBeenCalledTimes(1));
  return post.mock.calls[0][1] as Record<string, unknown>;
};

const toggle = () => screen.getByRole('switch');

describe.each([
  ['VoteResultsForm', renderForm],
  ['VoteResultsFormNamedPoll', renderNamedPollForm],
])('%s', (_name, renderComponent) => {
  beforeEach(() => {
    post.mockReset();
    post.mockResolvedValue({});
  });

  it.each([
    [false, true, false],
    [true, false, true],
    [null, false, true],
    [undefined, false, true],
  ])('votingRecommendation %s: switch checked %s, saving unchanged sends %s', async (stored, checked, sent) => {
    renderComponent(stored);
    expect(toggle().getAttribute('aria-checked')).toBe(String(checked));
    expect((await save()).toggleDecision).toBe(sent);
  });

  it('sends the opposite after flipping the switch once', async () => {
    renderComponent(false);
    fireEvent.click(toggle());
    expect((await save()).toggleDecision).toBe(true);
  });

  it('confirms a successful save', async () => {
    renderComponent(true);
    await save();
    expect(await screen.findByText('Vorgang wurde gespeichert!')).toBeTruthy();
  });

  it('shows the server error message', async () => {
    post.mockRejectedValue({ response: { data: 'Procedure not found' }, message: 'Request failed' });
    renderComponent(true);
    await save();
    expect(await screen.findByText('Procedure not found')).toBeTruthy();
  });
});

describe('VoteResultsForm payload', () => {
  beforeEach(() => {
    post.mockReset();
    post.mockResolvedValue({});
  });

  it('saving unchanged sends the stored vote results', async () => {
    renderForm(false);
    expect(await save()).toEqual({
      votingDocument: 'recommendedDecision',
      decisionText: 'Ablehnung der Vorlage auf Drucksache 21/1',
      partyVotes,
      toggleDecision: false,
      procedureId: 1,
    });
  });

  it('hides the AI helper without a plenary protocol', () => {
    renderForm(true);
    expect(screen.queryByRole('button', { name: 'get via AI' })).toBeNull();
  });

  it('fills the decision text from the AI helper and sends the document numbers', async () => {
    const get = vi.spyOn(axios, 'get').mockResolvedValue({ data: { text: 'Die Vorlage ist angenommen.' } });
    render(
      <VoteResultsForm
        data={{ ...voteResults(true), decisionText: '' }}
        type="Gesetzgebung"
        procedureId={1}
        period={21}
        lastPlenaryProtocoll={{ findSpotUrl: 'https://dserver.bundestag.de/btp/21/21030.pdf' }}
        title="Titel"
        drucksachen={['21/1']}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'get via AI' }));
    await waitFor(() =>
      expect((screen.getByPlaceholderText('Beschlusstext') as HTMLTextAreaElement).value).toBe(
        'Die Vorlage ist angenommen.',
      ),
    );
    expect(get).toHaveBeenCalledWith('/api/non-named-votes-ai/get', {
      params: { pdfUrl: 'https://dserver.bundestag.de/btp/21/21030.pdf', title: 'Titel', drucksachen: ['21/1'] },
    });
    expect(screen.getByRole('button', { name: 'Fetch AI Votes' })).toBeTruthy();
    get.mockRestore();
  });
});
