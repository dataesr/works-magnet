import PropTypes from 'prop-types';
import './tiles.scss';

export default function DatasetsTile({ setView }) {
  return (
    <div
      className="fr-tile fr-tile--horizontal click"
      onClick={() => setView('datasets')}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          setView('datasets');
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="fr-tile__body">
        <div className="fr-tile__content">
          <h3 className="fr-tile__title">
            <p>🗃 Find the datasets affiliated to your institution</p>
          </h3>
          <p className="fr-tile__detail">
            🔎 Explore the most frequent raw affiliation strings retrieved in the French Open Science Monitor data and in OpenAlex for your query (datasets only).
            <br />
            🤔 Validate ✅ or exclude ❌ each of them, whether it actually corresponds to your institution or not. 
            <br />
            💾 Save (export to a file) those decisions and the datasets corpus you just built.
          </p>
        </div>
      </div>
    </div>
  );
}

DatasetsTile.propTypes = {
  setView: PropTypes.func.isRequired,
};
