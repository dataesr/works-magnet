import {
  Container,
  SegmentedControl,
  SegmentedElement,
  TextInput,
} from '@dataesr/dsfr-plus';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { getMentions } from '../utils/works';

import './index.scss';

export default function Mentions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mentions, setMentions] = useState([]);
  const [search, setSearch] = useState();
  const [timer, setTimer] = useState();

  useEffect(() => {
    if (timer) {
      clearTimeout(timer);
    }
    const timerTmp = setTimeout(() => {
      setSearchParams((params) => {
        params.set('search', search);
        return params;
      });
    }, 500);
    setTimer(timerTmp);
  // The timer should not be tracked
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    const getData = async () => {
      if (
        searchParams.get('search')
        && searchParams.get('search')?.length > 0
      ) {
        const m = await getMentions({ search: searchParams.get('search') });
        setMentions(m);
      }
    };
    getData();
  }, [searchParams]);

  return (
    <Container as="section" className="fr-mt-4w mentions">
      <TextInput
        disableAutoValidation
        hint="Example: Coq"
        label="Search"
        onChange={(e) => setSearch(e.target.value)}
        value={search}
      />
      <ul>
        {mentions?.length > 0
          && mentions.map((mention) => (
            <li
              className={`fr-mt-2w ${mention._source.type}`}
              key={mention._id}
            >
              <h6>
                {mention._source?.['software-name']?.rawForm
                  ?? mention._source?.['dataset-name']?.rawForm}
                {' '}
                (
                {mention._source.type}
                )
              </h6>
              <figure className="fr-quote">
                <blockquote>
                  <p>
                    <span
                      className="fr-icon-arrow-left-s-line-double"
                      aria-hidden="true"
                    />
                    {mention._source.context}
                    <span
                      className="fr-icon-arrow-right-s-line-double"
                      aria-hidden="true"
                    />
                  </p>
                </blockquote>
                <figcaption>
                  <p className="fr-quote__source">
                    <a
                      target="_blank"
                      rel="noopener external noreferrer"
                      title={`DOI ${mention._source.doi}`}
                      href={`https://doi.org/${mention._source.doi}`}
                    >
                      DOI:
                      {' '}
                      {mention._source.doi}
                    </a>
                  </p>
                </figcaption>
              </figure>
              <div>
                <SegmentedControl
                  name="SegmentedControl1"
                >
                  <SegmentedElement
                    icon={
                      mention._source.mention_context.used
                        ? 'fr-icon-checkbox-circle-line'
                        : 'fr-icon-close-circle-line'
                    }
                    label="Used"
                  />
                  <SegmentedElement
                    icon={
                      mention._source.mention_context.created
                        ? 'fr-icon-checkbox-circle-line'
                        : 'fr-icon-close-circle-line'
                    }
                    label="Created"
                  />
                  <SegmentedElement
                    icon={
                      mention._source.mention_context.shared
                        ? 'fr-icon-checkbox-circle-line'
                        : 'fr-icon-close-circle-line'
                    }
                    label="Shared"
                  />
                </SegmentedControl>
              </div>
            </li>
          ))}
      </ul>
    </Container>
  );
}
