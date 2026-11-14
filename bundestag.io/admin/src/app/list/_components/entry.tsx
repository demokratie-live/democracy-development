interface EntryProps {
  title: string;
  procedureId: string;
  votes?: Array<{
    party: string;
    decision?: string;
  }>;
}

export default function Entry({ title, procedureId, votes }: EntryProps) {
  return (
    <article
      style={{
        border: votes && votes.length > 0 ? '1px solid black' : '3px solid red',
        padding: '1rem',
        margin: '1rem 0',
      }}
    >
      <h1 className="text-xl font-semibold">{title}</h1>
      <h3>Procedure ID: {procedureId}</h3>
      {votes && (
        <ul>
          {votes.map((vote) => (
            <li key={vote.party}>
              <strong>{vote.party}</strong>: {vote.decision}
            </li>
          ))}
        </ul>
      )}
      <a href={`/procedure/${procedureId}`} className="text-primary hover:underline">Edit</a>
    </article>
  );
}
