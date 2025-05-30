import { Maybe, Vote, VoteResult } from '@/__generated/gql-ai/graphql';
import { Button, Spin } from 'antd';
import { useState } from 'react';
import { getFractions } from './VoteResultsForm';

export type AiVotesProps = {
  decision: string;
  period: number;
  onResult?: (result: Vote[]) => void;
};

/**
 *
 * AiVotes
 * This is a component which shows a button to fetch the AI votes for a given decision.
 *
 * @param decision
 * @param period
 */
export const AiVotes: React.FC<AiVotesProps> = ({ decision, period, onResult }) => {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchVotes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/graphql-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variables: {
            decision,
            period,
          },
        }),
      }).then((data) => data.json());

      response.sort((a, b) => {
        const partiesOrder = getFractions(period).map((party) => party.name);
        return partiesOrder.indexOf(a.name) - partiesOrder.indexOf(b.name);
      });

      setVotes(response);
      onResult?.(response);
    } catch (error) {
      console.error('Error fetching votes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getColorForVote = (vote?: Maybe<VoteResult>) => {
    switch (vote) {
      case VoteResult.Abstination:
        return 'orange';
      case VoteResult.No:
        return 'red';
      case VoteResult.Yes:
        return 'green';
      case VoteResult.Mixed:
        return 'purple';
    }
  };

  return (
    <div>
      {loading && <Spin />}
      {votes.length === 0 && !loading && (
        <Button onClick={fetchVotes}>{loading ? 'Loading...' : 'Fetch AI Votes'}</Button>
      )}
      {votes.length > 0 && (
        <>
          <h3>AI Votes</h3>
          <ul>
            {votes.map((vote, index) => (
              <li key={index}>
                {vote.name} voted <span style={{ color: getColorForVote(vote.vote) }}>{vote.vote}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};
