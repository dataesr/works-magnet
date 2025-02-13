import { Breadcrumb, Button, Col, Container, Link, Row, Text } from '@dataesr/dsfr-plus';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import Header from '../../layout/header';
import MentionsList from './components/mentions-list.tsx';

import './styles.scss';

const DEFAULT_FROM = 0;
const DEFAULT_SEARCH = '';
const DEFAULT_SIZE = 50;
const DEFAULT_SORTBY = 'doi';
const DEFAULT_SORTORDER = 'asc';
const DEFAULT_TYPE = 'software';

const { VITE_API } = import.meta.env;

export default function MentionsResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mentions, setMentions] = useState([]);
  const [params, setParams] = useState({
    from: DEFAULT_FROM,
    search: DEFAULT_SEARCH,
    size: DEFAULT_SIZE,
    sortBy: DEFAULT_SORTBY,
    sortOrder: DEFAULT_SORTORDER,
    type: DEFAULT_TYPE,
  });

  const getMentions = async (options) => {
    const response = await fetch(`${VITE_API}/mentions`, {
      body: JSON.stringify(options),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
    return response.json();
  };

  const { data, error, isLoading } = useQuery(['mentions', JSON.stringify(params)], () => {
    if (params?.search.length > 0) return getMentions(params);
    return {};
  });

  useEffect(() => {
    if (data && data.mentions && data.mentions.length > 0) {
      // first call
      if (Number(params.from) === 0) {
        setMentions(data.mentions);
      }
      // next calls
      if (Number(params.from) >= mentions.length && mentions.length < data.count) {
        setMentions([...mentions, ...data.mentions]);
      }
    }
  }, [data, mentions, params.from]);

  useEffect(() => {
    // Set default params values
    if (searchParams.size === 0) {
      setSearchParams({
        from: DEFAULT_FROM,
        search: DEFAULT_SEARCH,
        size: DEFAULT_SIZE,
        'sort-by': DEFAULT_SORTBY,
        'sort-order': DEFAULT_SORTORDER,
        type: DEFAULT_TYPE,
      });
    } else {
      setParams({
        from: searchParams.get('from') || DEFAULT_FROM,
        search: searchParams.get('search') || DEFAULT_SEARCH,
        size: searchParams.get('size') || DEFAULT_SIZE,
        sortBy: searchParams.get('sort-by') || DEFAULT_SORTBY,
        sortOrder: searchParams.get('sort-order') || DEFAULT_SORTORDER,
        type: searchParams.get('type') || DEFAULT_TYPE,
      });
    }
  }, [searchParams, setSearchParams]);

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
          <Container fluid className="wm-mentions fr-mx-5w">
            <Row>
              <Breadcrumb className="fr-my-1w">
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
            <Row className="actions fr-mb-1w">
              <Col>
                {
                  `${mentions.length} / ${data.count}`
                }
              </Col>
            </Row>
            <Row className="results">
              <Col>
                <MentionsList
                  mentions={mentions}
                  searchParams={searchParams}
                  setSearchParams={setSearchParams}
                />
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
