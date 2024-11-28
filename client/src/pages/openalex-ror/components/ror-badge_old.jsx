import { Link } from '@dataesr/dsfr-plus';
import PropTypes from 'prop-types';

export default function RorBadge({ isRemoved, ror, setFilteredAffiliationName, rorColor, removeRor }) {
  return (
    <div className="wm-ror-badge">
      <span style={{ backgroundColor: getComputedStyle(document.documentElement).getPropertyValue(`--${rorColor}`) }} />
      <div>
        <img
          alt="ROR logo"
          className="vertical-middle fr-mx-1w"
          height="16"
          src="https://raw.githubusercontent.com/ror-community/ror-logos/main/ror-icon-rgb.svg"
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
        aria-label="Filter on this ROR"
        className="fr-icon fr-fi-filter-line fr-icon--sm"
        onClick={() => setFilteredAffiliationName(ror.rorId)}
        title="Filter on this ROR"
        type="button"
      />
      {
        isRemoved ? (
          <button
            aria-label="Undo remove this ROR"
            className="fr-icon fr-fi-arrow-go-back-line fr-icon--sm"
            onClick={() => { removeRor(); }}
            title="Undo remove"
            type="button"
          />
        ) : (
          <button
            aria-label="Remove this ROR"
            className="fr-icon fr-fi-delete-line fr-icon--sm"
            onClick={() => { removeRor(); }}
            title="Remove this ROR"
            type="button"
          />
        )
      }
    </div>
  );
}

RorBadge.defaultProps = {
  isRemoved: false,
};

RorBadge.propTypes = {
  isRemoved: PropTypes.bool,
  ror: PropTypes.shape({
    rorId: PropTypes.string.isRequired,
  }).isRequired,
  rorColor: PropTypes.string.isRequired,
  removeRor: PropTypes.func.isRequired,
  setFilteredAffiliationName: PropTypes.func.isRequired,
};
