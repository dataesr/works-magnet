import { Button, Link, Text } from '@dataesr/dsfr-plus';
import { useState } from 'react';

export default function WorksList({ works }) {
  const [showMore, setShowMore] = useState(false);

  const _works = showMore ? works : works.slice(0, 5);
  return (
    <Text size="sm" className="fr-mt-1w fr-pl-1w" style={{ borderLeft: '5px solid #aaa' }}>
      <i>
        <span className="fr-mr-1w">
          works:
        </span>
        {_works.map((work) => (
          <Link className="fr-mr-1w" href={`https://openalex.org/${work}`} target="_blank">
            {work}
          </Link>
        ))}
        {
          works.length > 5 && (
            <Button variant="text" onClick={() => setShowMore(!showMore)}>
              {showMore ? 'show less works' : `show more works (${works.length - 5})`}
            </Button>
          )
        }
      </i>
    </Text>

  );
}
