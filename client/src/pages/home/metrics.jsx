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
      {`${totBso} works in the French Monitor`}
      <div className="jauge jauge-totBso" style={{ width: `${percBso}%` }} />
      {`${totCollectedBso} works collected from the French Monitor (max ${VITE_BSO_SIZE})`}
      <div className="jauge jauge-collectedBso" style={{ width: `${percCollectedBso}%` }} />
      {`${totOpenAlex} works in OpenAlex`}
      <div className="jauge jauge-totOpenAlex" style={{ width: `${percOpenAlex}%` }} />
      {`${totCollectedOpenAlex} works collected from OpenAlex (max ${VITE_OPENALEX_SIZE})`}
      <div className="jauge jauge-collectedOpenAlex" style={{ width: `${percCollectedOpenAlex}%` }} />
      {`${totDeduplicated} works after deduplication`}
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
