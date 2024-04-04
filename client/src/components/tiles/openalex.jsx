import PropTypes from 'prop-types';
import { useSearchParams } from 'react-router-dom';

export default function OpenalexTile({ setView }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const lalilou = (view) => {
    // console.log(searchParams.toString());
    console.log(...searchParams);
    // console.log(searchParams.getAll('affiliations'));
    const searchParamsTmp = {
      affiliations: searchParams.getAll('affiliations') || [],
      datasets: searchParams.get('datasets', false),
      deletedAffiliations: searchParams.getAll('deletedAffiliations') || [],
      endYear: searchParams.get('endYear', '2023'),
      startYear: searchParams.get('startYear', '2023'),
      view,
    };
    console.log(searchParamsTmp);
    setSearchParams(searchParamsTmp, { replace: true });
  };

  return (
    <div className="fr-tile fr-tile--horizontal fr-enlarge-link">
      <div className="fr-tile__body">
        <div className="fr-tile__content">
          <h3 className="fr-tile__title">
            <p onClick={() => lalilou('openalex')}>Improve openAlex</p>
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
