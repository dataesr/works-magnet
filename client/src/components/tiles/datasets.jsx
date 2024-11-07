export default function DatasetsTile() {
  return (
    <div className="fr-enlarge-link fr-tile fr-tile--horizontal" size="sm">
      <div className="fr-tile__body">
        <div className="fr-tile__content">
          <h3 className="fr-tile__title">
            <a href="./datasets/search?view=datasets">
              🗃 Find the datasets affiliated to your institution
            </a>
          </h3>
          <p className="fr-tile__detail">
            🔎 Explore the most frequent raw affiliation strings retrieved in
            the French Open Science Monitor data and in OpenAlex for your query
            (datasets only).
            <br />
            🤔 Validate ✅ or exclude ❌ each of them, whether it actually
            corresponds to your institution or not.
            <br />
            💾 Save (export to a file) those decisions and the datasets corpus
            you just built.
          </p>
        </div>
      </div>
    </div>
  );
}
