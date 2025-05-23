import { Button, Link, Text } from '@dataesr/dsfr-plus';
import PropTypes from 'prop-types';
import { useState } from 'react';

const SEE_MORE_AFTER = 5;

export default function WorksList({ works }) {
  const [showMore, setShowMore] = useState(false);

  const displayedWorks = showMore ? works : works.slice(0, SEE_MORE_AFTER);

  const getUrlFromWork = (work) => {
    if (work.startsWith('10.')) return `https://doi.org/${work}`;
    if (work.startsWith('hal-')) return `https://hal.science/${work}`;
    if (work.startsWith('W')) return `https://openalex.org/works/${work}`;
    return work;
  };

  return (
    <Text className="fr-my-1w fr-pl-1w" size="sm" style={{ borderLeft: '5px solid #aaa' }}>
      <i>
        <span className="fr-mr-1w">
          Works:
        </span>
        {displayedWorks.map((work) => {
          const workUrl = getUrlFromWork(work);
          return { work, workUrl };
        }).map(({ work, workUrl }) => (
          (workUrl.startsWith('https') ? (
            <Link
              className="fr-mr-1w"
              href={workUrl}
              key={`works-list-${work}`}
              target="_blank"
            >
              {work}
            </Link>
          ) : (
            <span
              className="fr-mr-1w"
              key={`works-list-${work}`}
            >
              {work}
            </span>
          ))
        ))}
        {
          works.length > 5 && (
            <Button onClick={() => setShowMore(!showMore)} variant="text">
              {showMore ? 'show less works' : `show more works (${works.length - SEE_MORE_AFTER})`}
            </Button>
          )
        }
      </i>
    </Text>
  );
}

WorksList.propTypes = {
  works: PropTypes.array.isRequired,
};
