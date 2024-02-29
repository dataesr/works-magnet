import { Col, Row } from '@dataesr/react-dsfr';
import PropTypes from 'prop-types';
import { useSearchParams } from 'react-router-dom';

import ButtonDropdown from '../../components/button-dropdown';

export default function ActionsDatasets({
  allDatasets,
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <Row className="fr-mb-1w">
      <Col className="text-right">
        <ButtonDropdown data={allDatasets} label="datasets" searchParams={searchParams} />
      </Col>
    </Row>
  );
}

ActionsDatasets.propTypes = {
  allDatasets: PropTypes.arrayOf(PropTypes.shape({
    affiliations: PropTypes.arrayOf(PropTypes.object),
    allIds: PropTypes.arrayOf(PropTypes.object).isRequired,
    datasource: PropTypes.arrayOf(PropTypes.string).isRequired,
    id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  })).isRequired,
};
