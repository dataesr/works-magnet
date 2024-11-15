import { Button, Link, Text } from '@dataesr/dsfr-plus';
import { useState } from 'react';

export default function WorksList({ works }) {
  const [showMore, setShowMore] = useState(false);

  const _works = showMore ? works : works.slice(0, 5);
  return (
    <div>
      <span className="fr-mr-1w">
        openAlex works:
      </span>
      {_works.map((work) => (
        <Link className="fr-mr-1w" href="http://toto.com" target="_blank">
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
    </div>

  );
}
