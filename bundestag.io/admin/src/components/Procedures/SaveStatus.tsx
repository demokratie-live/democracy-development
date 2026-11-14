import React, { useState } from 'react';
import { CheckCircle2, CircleAlert, Loader2 } from 'lucide-react';

import { axiosClient } from '../../lib/axios';
import { errorMessage } from '../../lib/errorMessage';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export type SaveState =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'saved' }
  | { kind: 'invalid'; problems: string[] }
  | { kind: 'failed'; message: string };

/** Posts to the save route and keeps the outcome visible until the next attempt. */
export const useSave = () => {
  const [state, setState] = useState<SaveState>({ kind: 'idle' });

  const save = async (payload: Record<string, unknown>) => {
    setState({ kind: 'saving' });
    try {
      await axiosClient.post('/api/procedures/save', payload);
      setState({ kind: 'saved' });
    } catch (err) {
      console.error('Error:', err);
      setState({ kind: 'failed', message: errorMessage(err) });
    }
  };

  const invalid = (problems: string[]) => setState({ kind: 'invalid', problems });

  return { state, save, invalid };
};

export const SaveStatus: React.FC<{ state: SaveState }> = ({ state }) => {
  switch (state.kind) {
    case 'saving':
      return (
        <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 aria-hidden className="size-4 animate-spin" />
          Vorgang wird gespeichert!
        </p>
      );
    case 'saved':
      return (
        <p role="status" className="flex items-center gap-2 text-sm font-medium text-green-700">
          <CheckCircle2 aria-hidden className="size-4" />
          Vorgang wurde gespeichert!
        </p>
      );
    case 'invalid':
      return (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertTitle>Speichern fehlgeschlagen! Überprüfe deine Eingaben.</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4">
              {state.problems.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      );
    case 'failed':
      return (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertTitle>Ein Fehler ist vorgefallen</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      );
    default:
      return null;
  }
};
