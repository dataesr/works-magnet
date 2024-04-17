import PropTypes from 'prop-types';
import './tiles.scss';

export default function OpenalexTile({ setView }) {
  return (
    <div
      className="fr-tile fr-tile--horizontal click"
      size="sm"
      onClick={() => setView('openalex')}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          setView('openalex');
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="fr-tile__body">
        <div className="fr-tile__content">
          <h3 className="fr-tile__title">
            <p>✏️ Improve RoR matching in OpenAlex - Provide your feedback!</p>
          </h3>
          <p className="fr-tile__detail">
            🔎 Analyze the most frequent raw affiliation strings retrieved in OpenAlex for your query.
            <br />
            🤖 Check the RoR automatically computed by OpenAlex. Sometimes, they can be inaccurate or missing.
            <br />
            ✏️  Correct the errors (inaccurate or missing RoRs) and send feedback to OpenAlex.
          </p>
        </div>
      </div>
    </div>
  );
}

OpenalexTile.propTypes = {
  setView: PropTypes.func.isRequired,
};
