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
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Voluptates, ratione recusandae deserunt non inventore, dolor placeat itaque eveniet, impedit facere reiciendis rem. Nihil mollitia inventore, nostrum dolores quas ea optio.
          </p>
        </div>
      </div>
    </div>
  );
}

DatasetsTile.propTypes = {
  setView: PropTypes.func.isRequired,
};
