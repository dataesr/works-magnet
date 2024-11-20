import { Link, Tag } from '@dataesr/dsfr-plus';
import PropTypes from 'prop-types';

export default function RorBadge({
  isRemoved,
  ror,
  rorColor,
  setFilteredAffiliationName,
}) {
  return (
    <Tag
      color={rorColor}
      size="sm"
    >
      <img
        alt="ROR logo"
        className="vertical-middle fr-mx-1w"
        src="https://raw.githubusercontent.com/ror-community/ror-logos/0ef82987ac9bf4c9681dacdb3cb78d2a9d81167b/ror-icon-rgb-transparent.svg"
        height="16"
      />
      {isRemoved ? (
        <strike>
          https://ror.org/
          <Link href={`https://ror.org/${ror.rorId}`} target="_blank">
            {` ${ror.rorId}`}
          </Link>
        </strike>
      ) : (
        <>
          https://ror.org/
          <Link href={`https://ror.org/${ror.rorId}`} target="_blank">
            {` ${ror.rorId}`}
          </Link>
        </>
      )}

      <button
        disabled={isRemoved}
        aria-label="filter on this ROR id"
        className="fr-icon fr-fi-filter-line fr-icon--sm"
        onClick={() => setFilteredAffiliationName(ror.rorId)}
        type="button"
      />
    </Tag>

  );
}

RorBadge.propTypes = {
  isRemoved: PropTypes.bool.isRequired,
  ror: PropTypes.shape({
    rorId: PropTypes.string.isRequired,
  }).isRequired,
  rorColor: PropTypes.string.isRequired,
  setFilteredAffiliationName: PropTypes.func.isRequired,
};
