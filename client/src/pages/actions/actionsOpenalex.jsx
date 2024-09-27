import PropTypes from 'prop-types';
import { useSearchParams } from 'react-router-dom';

import ButtonDropdown from '../../components/button-dropdown';

export default function ActionsOpenalex({
  allOpenalexCorrections,
}) {
  const [searchParams] = useSearchParams();

  return (
    <ButtonDropdown
      data={allOpenalexCorrections}
      label="OpenAlex errors"
      searchParams={searchParams}
    />
  );
}

ActionsOpenalex.propTypes = {
  allOpenalexCorrections: PropTypes.arrayOf(PropTypes.shape({
    affiliations: PropTypes.arrayOf(PropTypes.object),
    datasource: PropTypes.arrayOf(PropTypes.string).isRequired,
    id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  })).isRequired,
};
