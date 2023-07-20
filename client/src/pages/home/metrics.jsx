/* eslint-disable no-mixed-operators */
import PropTypes from 'prop-types';

const {
  VITE_BSO_SIZE,
  VITE_OPENALEX_SIZE,
} = import.meta.env;

export default function Metrics({ data }) {
  const totBso = data?.total?.bso ? 100 : 0;
  const totOpenalex = data?.total?.openalex ? 100 : 0;
  const totCollectedBso = Math.min(data?.total?.bso ?? 0, VITE_BSO_SIZE) * (100) / (data?.total?.bso ?? 1);
  const totCollectedOpenalex = Math.min(data?.total?.openalex ?? 0, VITE_OPENALEX_SIZE) * (100) / (data?.total?.openalex ?? 1);

  return (
    <aside className="jauges">
      {`${data?.total?.bso ?? 0} publications in the BSO`}
      <div className="jauge jauge-totBso" style={{ width: `${totBso}%` }} />
      {`${Math.min(data?.total?.bso ?? 0, VITE_BSO_SIZE)} publications collected from the BSO`}
      <div className="jauge jauge-collectedBso" style={{ width: `${totCollectedBso}%` }} />
      <hr />

      {`${data?.total?.openalex ?? 0} publications in OpenAlex`}
      <div className="jauge jauge-totOpenAlex" style={{ width: `${totOpenalex}%` }} />
      {`${Math.min(data?.total?.openalex ?? 0, VITE_OPENALEX_SIZE)} publications collected from OpenAlex`}
      <div className="jauge jauge-collectedOpenAlex" style={{ width: `${totCollectedOpenalex}%` }} />
      <hr />
      {`${data?.total?.deduplicated ?? 0} publications after deduplication`}
      <div className="jauge jauge-deduplicated" style={{ width: `${totCollectedOpenalex}%` }} />

    </aside>
  );
}

Metrics.propTypes = {
  data: PropTypes.shape({
    total: PropTypes.shape({
      bso: PropTypes.number,
      deduplicated: PropTypes.number,
      openalex: PropTypes.number,
    }),
  }).isRequired,
};
