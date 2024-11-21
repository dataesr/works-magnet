import { Badge } from '@dataesr/dsfr-plus';
import PropTypes from 'prop-types';

export default function RorName({ isRemoved, ror }) {
  return (
    <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center' }}>
      <span className="fr-icon-arrow-right-s-fill" aria-hidden="true" />
      <span
        className="fr-mr-1w"
        style={{
          fontSize: '0.8rem',
          fontStyle: 'italic',
          width: '100%',
          wordBreak: 'break-all',
          display: 'inline-block',
        }}
      >
        {isRemoved ? (
          <strike>
            {ror.rorName}
          </strike>
        ) : (
          ror.rorName
        )}
      </span>
      <img
        alt={`${ror.rorCountry} flag`}
        src={`https://flagsapi.com/${ror.rorCountry}/flat/16.png`}
      />
      {isRemoved && (
        <Badge
          className="fr-ml-1w"
          color="warning"
        >
          Removed
        </Badge>
      )}
    </div>
  );
}

RorName.propTypes = {
  isRemoved: PropTypes.bool.isRequired,
  ror: PropTypes.shape({
    rorCountry: PropTypes.string.isRequired,
    rorName: PropTypes.string.isRequired,
  }).isRequired,
};
