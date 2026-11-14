import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { AiVotes, AiVotesProps } from './AiVotes';
import { Beschlusstext } from './Beschlusstext';
import { getFractions } from './fractions';
import { SaveStatus, useSave } from './SaveStatus';

export { getFractions };

type Main = 'YES' | 'NO' | 'ABSTINATION';
type Count = 'yes' | 'abstination' | 'no';

interface VoteResultsFormProps {
  data: {
    votingDocument?: string;
    decisionText?: string;
    partyVotes: {
      party: string;
      main?: Main | null;
      deviants: { yes: number; abstination: number; no: number };
    }[];
    votingRecommendation?: boolean | null;
  };
  type: string;
  procedureId: number | string;
  period: number;
  lastPlenaryProtocoll?: { findSpotUrl?: string | null };
  title?: string;
  drucksachen?: string[];
}

type PartyRow = { party: string; main: string | null; yes: number; abstination: number; no: number };

const CHOICES: { value: Main; label: string; count: Count; selected: string; idle: string }[] = [
  { value: 'YES', label: 'Ja', count: 'yes', selected: 'bg-green-600 text-white', idle: 'bg-green-50 text-green-900' },
  {
    value: 'ABSTINATION',
    label: 'Enthaltung',
    count: 'abstination',
    selected: 'bg-amber-500 text-white',
    idle: 'bg-amber-50 text-amber-900',
  },
  { value: 'NO', label: 'Nein', count: 'no', selected: 'bg-red-600 text-white', idle: 'bg-red-50 text-red-900' },
];
const COUNT_LABEL: Record<Count, string> = { yes: 'Ja', abstination: 'Enth.', no: 'Nein' };

const initialRows = (data: VoteResultsFormProps['data'], period: number): PartyRow[] => {
  if (data.partyVotes?.length) {
    return data.partyVotes.map(({ party, main, deviants }) => ({
      party,
      main: main ?? null,
      yes: deviants?.yes ?? 0,
      abstination: deviants?.abstination ?? 0,
      no: deviants?.no ?? 0,
    }));
  }
  return getFractions(period).map(({ name }) => ({ party: name, main: null, yes: 0, abstination: 0, no: 0 }));
};

const Segmented: React.FC<{
  name: string;
  legend: string;
  value: string;
  options: { value: string; label: string; selected?: string; idle?: string }[];
  onChange: (value: string) => void;
  invalid?: boolean;
}> = ({ name, legend, value, options, onChange, invalid }) => (
  <fieldset>
    <legend className="sr-only">{legend}</legend>
    <div
      className={cn(
        'inline-flex overflow-hidden rounded-md border text-sm',
        invalid && 'border-destructive ring-1 ring-destructive',
      )}
    >
      {options.map((o) => {
        const checked = value === o.value;
        return (
          <label
            key={o.value}
            className={cn(
              'cursor-pointer border-r px-3 py-1.5 font-medium transition-colors last:border-r-0 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-inset',
              checked
                ? (o.selected ?? 'bg-primary text-primary-foreground')
                : (o.idle ?? 'bg-background hover:bg-accent'),
            )}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={checked}
              onChange={() => onChange(o.value)}
              className="sr-only"
            />
            {o.label}
          </label>
        );
      })}
    </div>
  </fieldset>
);

const VoteResultsForm: React.FC<VoteResultsFormProps> = ({
  data,
  type,
  procedureId,
  period,
  lastPlenaryProtocoll,
  title,
  drucksachen,
}) => {
  const [votingDocument, setVotingDocument] = useState(data.votingDocument ?? '');
  const [decisionText, setDecisionText] = useState(data.decisionText ?? '');
  // the API stores the inverse: votingRecommendation === false means "flip"
  const [toggleDecision, setToggleDecision] = useState(data.votingRecommendation === false);
  const [rows, setRows] = useState<PartyRow[]>(() => initialRows(data, period));
  const [submitted, setSubmitted] = useState(false);
  const { state, save, invalid } = useSave();

  const updateRow = (index: number, patch: Partial<PartyRow>) =>
    setRows((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const onAiVoteResult: AiVotesProps['onResult'] = (votes) =>
    setRows((current) =>
      current.map((row) => {
        const vote = votes.find(({ name }) => name === row.party)?.vote;
        return vote ? { ...row, main: vote } : row;
      }),
    );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const problems = [
      !votingDocument && 'Abstimmung über fehlt!',
      !decisionText.trim() && 'Beschlusstext fehlt!',
      ...rows.filter((r) => !r.main).map((r) => `Stimme der Fraktion ${r.party} fehlt!`),
    ].filter((p): p is string => Boolean(p));
    if (problems.length) return invalid(problems);

    save({
      votingDocument,
      decisionText,
      partyVotes: rows.map(({ party, main, yes, abstination, no }) => ({
        party,
        main,
        deviants: { yes, abstination, no },
      })),
      toggleDecision: !toggleDecision,
      procedureId,
    });
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <div className="flex flex-wrap items-end gap-x-10 gap-y-4">
        <div className="space-y-1.5">
          <div className="text-sm font-medium">
            Abstimmung über <span className="text-destructive">*</span>
          </div>
          <Segmented
            name="votingDocument"
            legend="Abstimmung über"
            value={votingDocument}
            onChange={setVotingDocument}
            invalid={submitted && !votingDocument}
            options={[
              { value: 'mainDocument', label: type },
              { value: 'recommendedDecision', label: 'Beschlussempfehlung' },
            ]}
          />
        </div>
        <div className="flex items-center gap-2 pb-1.5">
          <Switch id="toggleDecision" checked={toggleDecision} onCheckedChange={setToggleDecision} />
          <label htmlFor="toggleDecision" className="text-sm font-medium">
            Ergebnis umdrehen
          </label>
        </div>
      </div>

      <Beschlusstext
        value={decisionText}
        onChange={setDecisionText}
        invalid={submitted && !decisionText.trim()}
        pdfUrl={lastPlenaryProtocoll?.findSpotUrl ?? undefined}
        title={title}
        drucksachen={drucksachen}
      />

      {decisionText && period ? <AiVotes decision={decisionText} period={period} onResult={onAiVoteResult} /> : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row, index) => (
          <div
            key={row.party}
            className={cn('space-y-3 rounded-md border p-3', submitted && !row.main && 'border-destructive')}
          >
            <div className="font-medium">{row.party}</div>
            <Segmented
              name={`main-${index}`}
              legend={`Stimme ${row.party}`}
              value={row.main ?? ''}
              onChange={(main) => updateRow(index, { main })}
              invalid={submitted && !row.main}
              options={CHOICES}
            />
            <div>
              <div className="mb-1 text-xs text-muted-foreground">Abweichende Stimmen</div>
              <div className="grid grid-cols-3 gap-2">
                {CHOICES.map(({ value, count }) => {
                  const id = `${count}-${index}`;
                  const isMain = row.main === value;
                  return (
                    <div key={count}>
                      <div aria-hidden className="mb-0.5 text-xs font-medium">
                        {COUNT_LABEL[count]}
                      </div>
                      {isMain ? (
                        <div
                          id={id}
                          className="flex h-8 items-center rounded-md border border-dashed px-2 text-xs text-muted-foreground"
                          title="Ergibt sich aus den Sitzen der Fraktion"
                        >
                          Rest
                        </div>
                      ) : (
                        <input
                          id={id}
                          aria-label={`${COUNT_LABEL[count]} abweichend`}
                          type="number"
                          inputMode="numeric"
                          min={0}
                          max={999}
                          value={row[count]}
                          onChange={(e) =>
                            updateRow(index, { [count]: Math.max(0, Math.min(999, Number(e.target.value) || 0)) })
                          }
                          className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
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

export default VoteResultsForm;
