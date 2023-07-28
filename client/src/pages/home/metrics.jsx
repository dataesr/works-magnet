/* eslint-disable no-mixed-operators */
import PropTypes from 'prop-types';

const {
  VITE_BSO_SIZE,
  VITE_OPENALEX_SIZE,
} = import.meta.env;

export default function Metrics({ data }) {
  const totBso = data?.total?.bso || 0;
  const totOpenAlex = data?.total?.openalex || 0;
  const totCollectedBso = Math.min(data?.total?.bso ?? 0, VITE_BSO_SIZE);
  const totCollectedOpenAlex = Math.min(data?.total?.openalex ?? 0, VITE_OPENALEX_SIZE);
  const totDeduplicated = data?.total?.deduplicated;
  const grandMax = Math.max(totBso, totOpenAlex, totDeduplicated);
  const percBso = totBso * 100 / (grandMax || 1);
  const percCollectedBso = totCollectedBso * 100 / (grandMax || 1);
  const percOpenAlex = totOpenAlex * 100 / (grandMax || 1);
  const percCollectedOpenAlex = totCollectedOpenAlex * 100 / (grandMax || 1);
  const percDeduplicated = totDeduplicated * 100 / (grandMax || 1);

  return (
    <aside className="jauges">
      {`${totBso} publications in the BSO database`}
      <div className="jauge jauge-totBso" style={{ width: `${percBso}%` }} />
      {`${totCollectedBso} publications collected from the BSO database (max ${VITE_BSO_SIZE})`}
      <div className="jauge jauge-collectedBso" style={{ width: `${percCollectedBso}%` }} />
      {`${totOpenAlex} publications in OpenAlex database`}
      <div className="jauge jauge-totOpenAlex" style={{ width: `${percOpenAlex}%` }} />
      {`${totCollectedOpenAlex} publications collected from OpenAlex database (max ${VITE_OPENALEX_SIZE})`}
      <div className="jauge jauge-collectedOpenAlex" style={{ width: `${percCollectedOpenAlex}%` }} />
      {`${totDeduplicated} publications after deduplication`}
      <div className="jauge jauge-deduplicated" style={{ width: `${percDeduplicated}%` }} />

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
