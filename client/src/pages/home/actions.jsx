import PropTypes from 'prop-types';
import { Button, Col, Row } from '@dataesr/react-dsfr';

export default function Actions({ selectedPublications, tagLines }) {
  return (
    <Row>
      <Col className="text-right">
        <Button
          className="fr-mb-1w"
          disabled={selectedPublications.length === 0}
          icon="ri-check-fill"
          onClick={() => { tagLines(selectedPublications, 'keep'); }}
          secondary
        >
          Keep
        </Button>
        <Button
          className="fr-mb-1w"
          disabled={selectedPublications.length === 0}
          onClick={() => { tagLines(selectedPublications, 'exclude'); }}
          icon="ri-close-fill"
          secondary
        >
          Exclude
        </Button>
        <Button icon="ri-save-line">Save</Button>
      </Col>
    </Row>
  );
}

Actions.propTypes = {
  selectedPublications: PropTypes.arrayOf(PropTypes.shape({
    identifier: PropTypes.string.isRequired,
    datasource: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    doi: PropTypes.string.isRequired,
    hal_id: PropTypes.string.isRequired,
    affiliations: PropTypes.arrayOf(PropTypes.string).isRequired,
    authors: PropTypes.arrayOf(PropTypes.string).isRequired,
    title: PropTypes.string.isRequired,
  })).isRequired,
  tagLines: PropTypes.func.isRequired,
};
