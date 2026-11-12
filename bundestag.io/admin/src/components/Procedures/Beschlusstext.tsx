import { log } from '@/lib/logger';
import { errorMessage } from '@/lib/errorMessage';
import { Alert, Button, Form, Spin } from 'antd';
import FormItem from 'antd/es/form/FormItem';
import TextArea from 'antd/es/input/TextArea';
import axios from 'axios';
import { useState } from 'react';

type Props = {
  pdfUrl?: string;
  title?: string;
  drucksachen?: string[];
};

export const Beschlusstext: React.FC<Props> = ({ pdfUrl, title, drucksachen }) => {
  const form = Form.useFormInstance();
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
      form.setFieldValue('decisionText', response.data.text);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FormItem label="Beschlusstext" name="decisionText" rules={[{ required: true, message: 'Beschlusstext fehlt!' }]}>
        <TextArea placeholder="Beschlusstext" rows={3} />
      </FormItem>
      {pdfUrl && title && (
        <Button type="dashed" onClick={onGetViaAi} disabled={loading}>
          {!loading ? 'get via AI' : <Spin />}
        </Button>
      )}
      {error && <Alert type="error" showIcon message="KI-Beschlusstext fehlgeschlagen" description={error} />}
    </>
  );
};
