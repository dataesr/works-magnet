import PropTypes from 'prop-types';
import { useSearchParams } from 'react-router-dom';

import ButtonDropdown from '../../../components/button-dropdown';

export default function ExportErrorsButton({
  corrections,
}) {
  const [searchParams] = useSearchParams();

  return (
    <ButtonDropdown
      className="fr-mr-1w"
      data={corrections}
      label="OpenAlex corrections"
      searchParams={searchParams}
    />
  );
}

ExportErrorsButton.propTypes = {
  corrections: PropTypes.arrayOf(PropTypes.shape({
    addList: PropTypes.arrayOf(PropTypes.string).isRequired,
    hasCorrection: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
    nameHtml: PropTypes.string.isRequired,
    removeList: PropTypes.arrayOf(PropTypes.string).isRequired,
    rors: PropTypes.arrayOf(PropTypes.shape({
      rorCountry: PropTypes.string.isRequired,
      rorId: PropTypes.string.isRequired,
      rorName: PropTypes.string.isRequired,
    })).isRequired,
    rorsNumber: PropTypes.number.isRequired,
    rorsToCorrect: PropTypes.arrayOf(PropTypes.shape({
      rorCountry: PropTypes.string.isRequired,
      rorId: PropTypes.string.isRequired,
      rorName: PropTypes.string.isRequired,
    })).isRequired,
    selected: PropTypes.bool.isRequired,
    source: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    works: PropTypes.arrayOf(PropTypes.string).isRequired,
    worksExample: PropTypes.arrayOf(PropTypes.shape({
      id_type: PropTypes.string.isRequired,
      id_value: PropTypes.string.isRequired,
    })).isRequired,
    worksNumber: PropTypes.number.isRequired,
    worksOpenAlex: PropTypes.arrayOf(PropTypes.string).isRequired,
  })).isRequired,
};
