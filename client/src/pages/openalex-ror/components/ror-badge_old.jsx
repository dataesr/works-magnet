import { Link } from '@dataesr/dsfr-plus';
import PropTypes from 'prop-types';

export default function RorBadge({ isRemoved, ror, setFilteredAffiliationName, rorColor }) {
  return (
    <div className="wm-ror-badge">
      <span style={{ backgroundColor: getComputedStyle(document.documentElement).getPropertyValue(`--${rorColor}`) }} />
      <div>
        <img
          alt="ROR logo"
          className="vertical-middle fr-mx-1w"
          src="https://raw.githubusercontent.com/ror-community/ror-logos/main/ror-icon-rgb.svg"
          height="16"
        />
      </div>
      {isRemoved ? (
        <strike>
          <Link href={`https://ror.org/${ror.rorId}`} target="_blank" style={{ fontFamily: 'monospace' }}>
            {`https://ror.org/${ror.rorId}`}
          </Link>
        </strike>
      ) : (
        <Link href={`https://ror.org/${ror.rorId}`} target="_blank" style={{ fontFamily: 'monospace' }}>
          {`https://ror.org/${ror.rorId}`}
        </Link>
      )}
      <button
        type="button"
        aria-label="filter on this ROR id"
        className="fr-icon fr-fi-filter-line fr-icon--sm"
        onClick={() => setFilteredAffiliationName(ror.rorId)}
      />
    </div>
  );
}

RorBadge.propTypes = {
  ror: PropTypes.shape({
    rorId: PropTypes.string.isRequired,
  }).isRequired,
  setFilteredAffiliationName: PropTypes.func.isRequired,
  rorColor: PropTypes.string.isRequired,
};
