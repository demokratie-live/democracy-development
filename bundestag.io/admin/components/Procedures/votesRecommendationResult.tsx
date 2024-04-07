import { useQuery } from '@apollo/client';
import GET_VOTES_RECOMMENDATION from '../../graphql/queries/getVotesRecommendation';

type Props = {
  period: number;
  decision: string;
};

export const VotesRecommendationResult: React.FC<Props> = ({ period, decision }) => {
  const { data, loading } = useQuery(GET_VOTES_RECOMMENDATION, {
    variables: {
      period,
      decision,
    },
  });

  console.log('data', data, loading);

  if (loading) {
    return <div>…loading</div>;
  }

  if (!data || !data.parseDecision) {
    return <div>no data</div>;
  }

  const { result } = data.parseDecision;

  return (
    <div>
      <h2>Empfehlung</h2>
      <p>{result.votingRecommendation}</p>
      <h2>Abstimmungsdokument</h2>
      <p>{result.votingDocument}</p>
      <h2>Stimmen</h2>
      <ul>
        {result.votes.map((vote, index) => (
          <li key={index}>
            <strong>{vote.name}</strong>: {vote.vote}
          </li>
        ))}
      </ul>
    </div>
  );
};
