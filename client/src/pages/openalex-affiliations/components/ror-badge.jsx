import { Link } from '@dataesr/dsfr-plus';
import PropTypes from 'prop-types';

import useCopyToClipboard from '../../../hooks/useCopyToClipboard';

export default function RorBadge({ className, isRemoved, removeRor, ror, rorColor, setFilteredAffiliationName }) {
  const [_, copy] = useCopyToClipboard();

  return (
    <div className={`wm-ror-badge ${className}`}>
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
      <button
        aria-label="Copier"
        className="ri-file-copy-line"
        onClick={() => copy(ror.rorId)}
        title="Copier"
        type="button"
      />
      {
        isRemoved ? (
          <button
            aria-label="Undo remove"
            className="fr-icon fr-fi-arrow-go-back-line fr-icon--sm"
            onClick={() => removeRor()}
            title="Undo remove"
            type="button"
          />
        ) : (
          <button
            aria-label="Remove this ROR"
            className="fr-icon fr-fi-delete-line fr-icon--sm"
            onClick={() => removeRor()}
            title="Remove this ROR"
            type="button"
          />
        )
      }
    </div>
  );
}

RorBadge.defaultProps = {
  className: '',
  isRemoved: false,
};

RorBadge.propTypes = {
  className: PropTypes.string,
  isRemoved: PropTypes.bool,
  removeRor: PropTypes.func.isRequired,
  ror: PropTypes.shape({
    rorId: PropTypes.string.isRequired,
  }).isRequired,
  rorColor: PropTypes.string.isRequired,
  setFilteredAffiliationName: PropTypes.func.isRequired,
};
