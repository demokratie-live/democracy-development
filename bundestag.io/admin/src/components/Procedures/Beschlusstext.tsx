import { useState } from 'react';
import axios from 'axios';
import { CircleAlert, Loader2, Sparkles } from 'lucide-react';

import { log } from '@/lib/logger';
import { errorMessage } from '@/lib/errorMessage';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type Props = {
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  pdfUrl?: string;
  title?: string;
  drucksachen?: string[];
};

export const Beschlusstext: React.FC<Props> = ({ value, onChange, invalid, pdfUrl, title, drucksachen }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onGetViaAi = async () => {
    log.debug(`request non-named-votes-ai: ${pdfUrl}, ${title}, ${drucksachen}`);
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/non-named-votes-ai/get', {
        params: { pdfUrl, title, drucksachen },
      });
      onChange(response.data.text);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-2">
        <label htmlFor="decisionText" className="text-sm font-medium">
          Beschlusstext <span className="text-destructive">*</span>
        </label>
        {pdfUrl && title && (
          <Button type="button" variant="outline" size="sm" onClick={onGetViaAi} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
            get via AI
          </Button>
        )}
      </div>
      <Textarea
        id="decisionText"
        placeholder="Beschlusstext"
        rows={4}
        value={value}
        aria-invalid={invalid || undefined}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertTitle>KI-Beschlusstext fehlgeschlagen</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};
