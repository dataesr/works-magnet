import { Link } from '@dataesr/dsfr-plus';
import PropTypes from 'prop-types';

export default function RorBadge({ ror, setFilteredAffiliationName, rorColor }) {
  console.log(rorColor, getComputedStyle(document.documentElement).getPropertyValue(`--${rorColor}`));

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
      https://ror.org/
      <Link href={`https://ror.org/${ror.rorId}`} target="_blank">
        {` ${ror.rorId}`}
      </Link>
      <button
        type="button"
        aria-label="filter on this ROR id"
        className="fr-icon fr-fi-filter-line fr-icon--sm"
        onClick={() => setFilteredAffiliationName(ror.rorId)}
      />

      {/* <img
        alt="ROR logo"
        className="vertical-middle fr-mx-1w"
        src="https://raw.githubusercontent.com/ror-community/ror-logos/main/ror-icon-rgb.svg"
        height="16"
      />
      https://ror.org/
      <Badge
        className="fr-mr-1w"
        color={defineRorColor.find((r) => r.ror === ror.rorId)?.color || 'yellow-tournesol'}
        size="sm"
      >
        <Link className="fr-mr-1w" href={`https://ror.org/${ror.rorId}`} target="_blank">
          {` ${ror.rorId}`}
        </Link>
      </Badge>
      <Button
        aria-label="filter on this ROR id"
        icon="filter-line"
        onClick={() => setFilteredAffiliationName(ror.rorId)}
        size="sm"
        variant="text"
      /> */}
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
