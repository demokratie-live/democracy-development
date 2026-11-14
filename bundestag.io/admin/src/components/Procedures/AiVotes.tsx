import { useState } from 'react';
import { CircleAlert, Loader2, Sparkles } from 'lucide-react';

import { Maybe, Vote, VoteResult } from '@/__generated/gql-ai/graphql';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getFractions } from './fractions';

export type AiVotesProps = {
  decision: string;
  period: number;
  onResult?: (result: Vote[]) => void;
};

const VOTE_LABEL: Record<string, string> = {
  [VoteResult.Yes]: 'Ja',
  [VoteResult.No]: 'Nein',
  [VoteResult.Abstination]: 'Enthaltung',
  [VoteResult.Mixed]: 'gemischt',
};

const voteTone = (vote?: Maybe<VoteResult>) => {
  switch (vote) {
    case VoteResult.Yes:
      return 'border-green-200 bg-green-50 text-green-800';
    case VoteResult.No:
      return 'border-red-200 bg-red-50 text-red-800';
    case VoteResult.Abstination:
      return 'border-amber-200 bg-amber-50 text-amber-800';
    default:
      return 'border-purple-200 bg-purple-50 text-purple-800';
  }
};

/** Asks the AI service how each party voted, based on the decision text. */
export const AiVotes: React.FC<AiVotesProps> = ({ decision, period, onResult }) => {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/graphql-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variables: { decision, period } }),
      }).then((data) => data.json());

      if (!Array.isArray(response)) {
        throw new Error('Die KI hat kein Ergebnis geliefert');
      }

      const order = getFractions(period).map((party) => party.name);
      response.sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));

      setVotes(response);
      onResult?.(response);
    } catch (err) {
      console.error('Error fetching votes:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {votes.length === 0 ? (
        <Button type="button" variant="outline" size="sm" onClick={fetchVotes} disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
          Fetch AI Votes
        </Button>
      ) : (
        <div className="flex flex-wrap items-center gap-1.5 text-sm">
          <span className="text-muted-foreground">KI-Vorschlag übernommen:</span>
          {votes.map((vote) => (
            <Badge key={vote.name} variant="outline" className={cn(voteTone(vote.vote))}>
              {vote.name} {vote.vote ? (VOTE_LABEL[vote.vote] ?? vote.vote) : '–'}
            </Badge>
          ))}
        </div>
      )}
      {error && (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertTitle>KI-Stimmen fehlgeschlagen</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};
