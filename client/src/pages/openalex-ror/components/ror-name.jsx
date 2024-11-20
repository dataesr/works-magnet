import PropTypes from 'prop-types';

export default function RorName({ isRemoved, ror }) {
  return (
    <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center' }}>
      <img
        alt={`${ror.rorCountry} flag`}
        src={`https://flagsapi.com/${ror.rorCountry}/flat/16.png`}
      />
      <span
        className="fr-ml-1w"
        style={{
          width: '300px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
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
