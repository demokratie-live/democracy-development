import { useState } from 'react';
import { VotesRecommendationResult } from './votesRecommendationResult';

type Props = {
  period: number;
  decision: string;
};

export const VotesRecommendation: React.FC<Props> = ({ period, decision }) => {
  const [requested, setRequested] = useState(false);
  if (!requested) {
    return (
      <div>
        <button onClick={() => setRequested(true)}>Empfehlung anzeigen</button>
      </div>
    );
  }

  return <VotesRecommendationResult period={period} decision={decision} />;
};
