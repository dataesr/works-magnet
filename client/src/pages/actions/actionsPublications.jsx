import { useSearchParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import ButtonDropdown from '../../components/button-dropdown';

export default function ActionsPublications({ allPublications, className }) {
  const [searchParams] = useSearchParams();

  return (
    <ButtonDropdown className={className} data={allPublications} label="publications" searchParams={searchParams} />
  );
}

ActionsPublications.defaultProps = {
  className: '',
};

ActionsPublications.propTypes = {
  allPublications: PropTypes.arrayOf(PropTypes.shape({
    affiliations: PropTypes.arrayOf(PropTypes.object).isRequired,
    allIds: PropTypes.arrayOf(PropTypes.object).isRequired,
    datasource: PropTypes.arrayOf(PropTypes.string).isRequired,
    id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  })).isRequired,
  className: PropTypes.string,
};
