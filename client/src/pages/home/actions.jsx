import PropTypes from 'prop-types';
import { Button, Checkbox, Col, Row } from '@dataesr/react-dsfr';

export default function Actions({
  selectedPublications,
  tagLines,
  viewAllPublications,
  setViewAllPublications,
  selectedAffiliations,
  tagAffiliation,

}) {
  return (
    <Row>
      <Col n="4">
        <Checkbox
          checked={viewAllPublications}
          label="View all publications"
          onChange={() => setViewAllPublications(!viewAllPublications)}
          size="sm"
        />
      </Col>
      <Col className="text-right">
        <Button
          className="fr-mb-1w"
          disabled={selectedAffiliations.length === 0}
          icon="ri-check-fill"
          onClick={() => { tagAffiliation(selectedAffiliations, 'keep'); }}
          secondary
        >
          Keep all
        </Button>
        <Button
          className="fr-mb-1w"
          disabled={selectedAffiliations.length === 0}
          onClick={() => { tagAffiliation(selectedAffiliations, 'exclude'); }}
          icon="ri-close-fill"
          secondary
        >
          Exclude all
        </Button>
      </Col>
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
  viewAllPublications: PropTypes.bool.isRequired,
  setViewAllPublications: PropTypes.func.isRequired,
  selectedAffiliations: PropTypes.arrayOf(PropTypes.shape({
    affiliations: PropTypes.arrayOf(PropTypes.string).isRequired,
    publicationsNumber: PropTypes.number.isRequired,
    publications: PropTypes.arrayOf(PropTypes.string).isRequired,
  })).isRequired,
  tagAffiliation: PropTypes.func.isRequired,
};
