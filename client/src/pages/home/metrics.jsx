/* eslint-disable no-mixed-operators */
import PropTypes from 'prop-types';

const {
  VITE_BSO_SIZE,
  VITE_BSO_MAX_SIZE,
  VITE_OPENALEX_SIZE,
} = import.meta.env;

export default function Metrics({ data }) {
  const totalBso = data?.total?.bso || 0;
  const totalOpenAlex = data?.total?.openalex || 0;
  const totalCollectedBso = Number(VITE_BSO_MAX_SIZE) === 0 ? data?.total?.bso ?? 0 : Math.min(data?.total?.bso ?? 0, VITE_BSO_SIZE);
  const totalCollectedOpenAlex = Math.min(data?.total?.openalex ?? 0, VITE_OPENALEX_SIZE);
  const totalDeduplicated = data?.total?.deduplicated;
  const grandMax = Math.max(totalBso, totalOpenAlex, totalDeduplicated);
  const percentageBso = totalBso * 100 / (grandMax || 1);
  const percentageCollectedBso = totalCollectedBso * 100 / (grandMax || 1);
  const percentageOpenAlex = totalOpenAlex * 100 / (grandMax || 1);
  const percentageCollectedOpenAlex = totalCollectedOpenAlex * 100 / (grandMax || 1);
  const percentageDeduplicated = totalDeduplicated * 100 / (grandMax || 1);

  return (
    <aside className="jauges">
      {`${totalBso} publications in the French OSM`}
      <div className="jauge jauge-totBso" style={{ width: `${percentageBso}%` }} />
      {`${totalCollectedBso} publications collected from the French OSM `}
      {Number(VITE_BSO_MAX_SIZE) === 0 ? '(all of them)' : `(max ${VITE_BSO_MAX_SIZE})`}
      <div className="jauge jauge-collectedBso" style={{ width: `${percentageCollectedBso}%` }} />
      {`${totalOpenAlex} publications in OpenAlex`}
      <div className="jauge jauge-totOpenAlex" style={{ width: `${percentageOpenAlex}%` }} />
      {`${totalCollectedOpenAlex} publications collected from OpenAlex (max ${VITE_OPENALEX_SIZE})`}
      <div className="jauge jauge-collectedOpenAlex" style={{ width: `${percentageCollectedOpenAlex}%` }} />
      {`${totalDeduplicated} publications after deduplication`}
      <div className="jauge jauge-deduplicated" style={{ width: `${percentageDeduplicated}%` }} />

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
