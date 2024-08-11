import { log } from '@/lib/logger';
import { Button } from 'antd';
import FormItem from 'antd/es/form/FormItem';
import TextArea from 'antd/es/input/TextArea';
import axios from 'axios';
import { useState } from 'react';

type Props = {
  pdfUrl: string;
  title: string;
  drucksachen?: string[];
};

export const Beschlusstext: React.FC<Props> = ({ pdfUrl, title, drucksachen }) => {
  const [aiText, setAiText] = useState<string | null>(null);
  const onGetViaAi = async () => {
    log.debug(`request non-named-votes-ai: ${pdfUrl}, ${title}, ${drucksachen}`);
    const response = await axios.get('/api/non-named-votes-ai/get', {
      params: { pdfUrl, title, drucksachen },
    });
    setAiText(response.data.text);
  };

  return (
    <FormItem label="Beschlusstext" name="decisionText" rules={[{ required: true, message: 'Beschlusstext fehlt!' }]}>
      <TextArea placeholder="Beschlusstext" rows={3} />
      {!aiText && (
        <Button type="dashed" onClick={onGetViaAi}>
          get via AI
        </Button>
      )}
      {aiText && <div>{aiText}</div>}
    </FormItem>
  );
};
