export default function OpenalexTile() {
  return (
    <div className="fr-enlarge-link fr-tile fr-tile--horizontal" size="sm">
      <div className="fr-tile__body">
        <div className="fr-tile__content">
          <h3 className="fr-tile__title">
            <a href="./openalex-ror/search">
              ✏️ Improve ROR matching in OpenAlex - Provide your feedback!
            </a>
          </h3>
          <p className="fr-tile__detail">
            🔎 Analyze the most frequent raw affiliation strings retrieved in
            OpenAlex for your query.
            <br />
            🤖 Check the ROR automatically computed by OpenAlex. Sometimes, they
            can be inaccurate or missing.
            <br />
            ✏️ Correct the errors (inaccurate or missing RORs) and send feedback
            to OpenAlex.
          </p>
        </div>
      </div>
    </div>
  );
}
