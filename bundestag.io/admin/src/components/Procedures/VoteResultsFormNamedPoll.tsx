import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { SaveStatus, useSave } from './SaveStatus';

type Props = {
  data?: { votingRecommendation?: boolean | null } | null;
  procedureId: string;
};

/** Named votes come from the poll import; only the direction of the result is edited here. */
export const VoteResultsFormNamedPoll: React.FC<Props> = ({ data, procedureId }) => {
  // the API stores the inverse: votingRecommendation === false means "flip"
  const [toggleDecision, setToggleDecision] = useState(data?.votingRecommendation === false);
  const { state, save } = useSave();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    save({ namedPoll: true, toggleDecision: !toggleDecision, procedureId });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Die Stimmen kommen aus der namentlichen Abstimmung und werden automatisch übernommen.
      </p>
      <div className="flex items-center gap-2">
        <Switch id="toggleDecisionNamed" checked={toggleDecision} onCheckedChange={setToggleDecision} />
        <label htmlFor="toggleDecisionNamed" className="text-sm font-medium">
          Ergebnis umdrehen
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-4 border-t pt-4">
        <Button type="submit" disabled={state.kind === 'saving'}>
          Speichern
        </Button>
        <SaveStatus state={state} />
      </div>
    </form>
  );
};
