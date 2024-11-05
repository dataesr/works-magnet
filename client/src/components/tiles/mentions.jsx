export default function MentionsTile() {
  return (
    <div className="fr-enlarge-link fr-tile fr-tile--horizontal" size="sm">
      <div className="fr-tile__body">
        <div className="fr-tile__content">
          <h3 className="fr-tile__title">
            <a href="./mentions">
              📑 Find the mentions of your software or datasets
            </a>
          </h3>
          <p className="fr-tile__detail">
            🔎 Explore the mentions of software and datasets found in the French publications full-text.
            <br />
            ✏️ Correct the errors (type or characterizations)
            <br />
            ✉️ submit corrections
          </p>
        </div>
      </div>
    </div>
  );
}
