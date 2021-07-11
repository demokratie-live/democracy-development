import { Layout } from "../components/Layout";
import App from "../components/App";
import { ProcedureList } from "../components/Procedures/List";

export default function Procedures() {
  return (
    <Layout>
      <App>
        <h2>Vorgänge</h2>
        <ProcedureList />
      </App>
    </Layout>
  );
}
