import { Col, Row } from '@dataesr/react-dsfr';
import PropTypes from 'prop-types';
import { useSearchParams } from 'react-router-dom';

import ButtonDropdown from '../../components/button-dropdown';

export default function ActionsOpenalex({
  allOpenalex,
  options,
  setAllOpenalex,
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <Row className="fr-mb-1w">
      <Col className="text-right">
        <ButtonDropdown data={allOpenalex} label="OpenAlex errors" searchParams={searchParams} />
      </Col>
    </Row>
  );
}

ActionsOpenalex.propTypes = {
  allOpenalex: PropTypes.arrayOf(PropTypes.shape({
    affiliations: PropTypes.arrayOf(PropTypes.object),
    allIds: PropTypes.arrayOf(PropTypes.object).isRequired,
    datasource: PropTypes.arrayOf(PropTypes.string).isRequired,
    id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  })).isRequired,
  options: PropTypes.object.isRequired,
  setAllOpenalex: PropTypes.func.isRequired,
};
