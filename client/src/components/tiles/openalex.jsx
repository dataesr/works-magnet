import PropTypes from 'prop-types';

export default function OpenalexTile({ setView }) {
  return (
    <div className="fr-tile fr-tile--horizontal fr-enlarge-link">
      <div className="fr-tile__body">
        <div className="fr-tile__content">
          <h3 className="fr-tile__title">
            <a href="#" onClick={() => setView('openalex')}>Improve openAlex</a>
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

OpenalexTile.propTypes = {
  setView: PropTypes.func.isRequired,
};
