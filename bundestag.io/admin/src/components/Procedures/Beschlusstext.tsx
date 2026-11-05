import FormItem from 'antd/es/form/FormItem';
import TextArea from 'antd/es/input/TextArea';

// The "get via AI" button is gone: its backend (OpenAI Assistants API) was shut down.
export const Beschlusstext: React.FC = () => (
  <FormItem label="Beschlusstext" name="decisionText" rules={[{ required: true, message: 'Beschlusstext fehlt!' }]}>
    <TextArea placeholder="Beschlusstext" rows={3} />
  </FormItem>
);
