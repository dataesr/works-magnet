import PropTypes from 'prop-types';
import { useSearchParams } from 'react-router-dom';

import ButtonDropdown from '../../../components/button-dropdown';

export default function ExportErrorsButton({
  allOpenalexCorrections,
}) {
  const [searchParams] = useSearchParams();

  return (
    <ButtonDropdown
      className="fr-mr-1w"
      data={allOpenalexCorrections}
      label="OpenAlex corrections"
      searchParams={searchParams}
    />
  );
}

ExportErrorsButton.propTypes = {
  allOpenalexCorrections: PropTypes.arrayOf(PropTypes.shape({
    correctedRors: PropTypes.arrayOf(PropTypes.object).isRequired,
    rawAffiliationString: PropTypes.string.isRequired,
    rorsInOpenAlex: PropTypes.arrayOf(PropTypes.shape({
      rorCountry: PropTypes.string.isRequired,
      rorId: PropTypes.string.isRequired,
      rorName: PropTypes.string.isRequired,
    })).isRequired,
    worksExample: PropTypes.arrayOf(PropTypes.shape({
      id_type: PropTypes.string.isRequired,
      id_value: PropTypes.string.isRequired,
    })).isRequired,
    worksOpenAlex: PropTypes.arrayOf(PropTypes.string).isRequired,
  })).isRequired,
};
