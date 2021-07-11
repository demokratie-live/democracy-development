import { useQuery } from "@apollo/client";
import { VOTE_TEXTS } from "../../graphql/queries/voteTexts";
import { Form, Input, Collapse } from "antd";
import { PlenarText } from "./PlenarText";

const { Panel } = Collapse;

export const VoteResultTextHelper = ({ procedureId, importantDocuments }) => {
  const { data, loading } = useQuery(VOTE_TEXTS, {
    variables: { procedureId },
  });

  if (loading) {
    return <div>…loading</div>;
  }

  if (
    !data ||
    !data.voteResultTextHelper ||
    data.voteResultTextHelper.length === 0
  ) {
    return <div>no helper texts</div>;
  }

  const { voteResultTextHelper } = data;
  console.log("voteResultTextHelper", voteResultTextHelper);
  return (
    <Collapse>
      {voteResultTextHelper.map(({ results }, i) => {
        return (
          <Panel header={`📚 ${results[1].substr(0, 50)}`} key={i}>
            {results.map((value, i) => (
              <PlenarText
                key={i}
                text={value}
                docIds={importantDocuments.map(({ number }) => number)}
              />
            ))}
          </Panel>
        );
      })}
    </Collapse>
  );
};
