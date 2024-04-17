import PropTypes from 'prop-types';
import './tiles.scss';

export default function PublicationsTile({ setView }) {
  return (
    <div
      className="fr-tile fr-tile--horizontal click"
      onClick={() => setView('publications')}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          setView('publications');
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="fr-tile__body">
        <div className="fr-tile__content">
          <h3 className="fr-tile__title">
            <p>📑 Find the publications affiliated to your institution</p>
          </h3>
          <p className="fr-tile__detail">
            🔎 Explore the most frequent raw affiliation strings retrieved in the French Open Science Monitor data and in OpenAlex for your query.
            <br />
            🤔 Validate ✅ or exclude ❌ each of them, whether it actually corresponds to your institution or not. 
            <br />
            💾 Save (export to a file) those decisions and the publications corpus you just built.
          </p>
        </div>
      </div>
    </div>
  );
}

PublicationsTile.propTypes = {
  setView: PropTypes.func.isRequired,
};
