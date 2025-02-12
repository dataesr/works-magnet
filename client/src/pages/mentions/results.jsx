import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Breadcrumb, Button, Col, Container, Link, Row, Spinner, Text } from '@dataesr/dsfr-plus';

import Header from '../../layout/header';
import MentionsList from './components/mentions-list.tsx';
// import { getMentions } from '../../utils/works';

// const DEFAULT_CORRECTION = false;
const DEFAULT_FROM = 0;
const DEFAULT_SEARCH = '';
const DEFAULT_SIZE = 50;
const DEFAULT_SORTBY = '';
const DEFAULT_SORTORDER = '';
const DEFAULT_TYPE = 'software';

const { VITE_API } = import.meta.env;

export default function MentionsResults() {
  const [searchParams] = useSearchParams();
  const [params, setParams] = useState({
    search: searchParams.get('search') || DEFAULT_SEARCH,
    from: searchParams.get('from') || DEFAULT_FROM,
    size: searchParams.get('size') || DEFAULT_SIZE,
    sortBy: searchParams.get('sortby') || DEFAULT_SORTBY,
    sortOrder: searchParams.get('sortorder') || DEFAULT_SORTORDER,
    type: searchParams.get('type') || DEFAULT_TYPE,
  });

  const [mentions, setMentions] = useState([]);

  const getMentions = async () => {
    const response = await fetch(`${VITE_API}/mentions`, {
      body: JSON.stringify(params),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
    return response.json();
  };

  const { data, error, isLoading } = useQuery(['mentions', params], () => getMentions());

  if (data && data.mentions && data.mentions.length > 0) {
    // first call
    if (params.from === 0 && mentions.length === 0) {
      setMentions(data.mentions);
    }
    // // next calls
    if (params.from >= mentions.length && mentions.length < data.count) {
      setMentions([...mentions, ...data.mentions]);
    }
  }

  return (
    <div style={{ minHeight: '700px' }}>
      <Header />
      <main className="wm-bg">
        {(isLoading) && (
          <Container
            style={{ textAlign: 'center', minHeight: '600px' }}
            className="fr-pt-5w wm-font"
          >
            <div className="fr-mb-5w wm-message fr-pt-10w">
              Loading data, please wait...
              <br />
              <br />
              <span className="loader fr-my-5w">Loading</span>
            </div>
          </Container>
        )}

        {error && (
          <Row gutters className="fr-mb-16w">
            <Col xs="12">
              <Text>
                Error while fetching data, please try again later or contact the
                team (see footer).
              </Text>
            </Col>
          </Row>
        )}

        {!isLoading && data && (
          <Container>
            <Row>
              <Breadcrumb className="fr-pt-4w fr-mt-0 fr-mb-2w fr-ml-8w">
                <Link href="/">
                  Home
                </Link>
                <Link href={`/mentions/search?search=${params.search}`}>
                  Search software and dataset mentions in the full-text
                </Link>
                <Link current>
                  See results and make corrections
                </Link>
              </Breadcrumb>
            </Row>
            <Row>
              <Col>
                {
                  `${mentions.length} / ${data.count}`
                }
                <br />
                <MentionsList mentions={mentions} />
              </Col>
            </Row>

            {data.count > mentions.length && (
              <div className="text-center">
                <Button
                  onClick={() => setParams({ ...params, from: params.from + params.size })}
                >
                  Load more mentions
                </Button>
              </div>
            )}
          </Container>
        )}
      </main>
    </div>
  );
}
