import { Col, Container, Link, Row, Spinner } from '@dataesr/dsfr-plus';
import { useQuery } from '@tanstack/react-query';

import Header from '../../layout/header';

const ODS_BY_PAGE = 100;

export default function Corrections() {
  const getCorrections = async (page = 0) => {
    const offset = page * ODS_BY_PAGE;
    let r = [];
    const url = `https://data.enseignementsup-recherche.gouv.fr/api/explore/v2.1/catalog/datasets/openalex-affiliations-corrections/records?order_by=github_issue_id&limit=${ODS_BY_PAGE}&offset=${offset}`;
    const response = await fetch(url);
    const corrections = await response.json();
    if (corrections.results.length === ODS_BY_PAGE) {
      const c = await getCorrections(page + 1);
      r = r.concat(c);
    }
    r = r.concat(corrections.results);
    return r;
  };

  const { data, error, isFetched, isFetching } = useQuery({
    queryKey: ['corrections-lalilou'],
    queryFn: () => getCorrections(),
  });

  return (
    <>
      <Header />
      <Container as="section" className="fr-mt-4w">
        {isFetching && (
          <Row>
            <Col xs="2" offsetXs="6">
              <Spinner size={48} />
            </Col>
          </Row>
        )}
        {error && (
          <Row gutters className="fr-mb-16w">
            <Col xs="12">
              <div>
                Error while fetching github issues, please try again later or contact the
                team (see footer).
              </div>
            </Col>
          </Row>
        )}
        {!isFetching && isFetched && (
          <ul>
            {data.map((item) => (
              <li className="fr-mb-2w list-none" key={item.github_issue_id}>
                <Row>
                  <Col xs="1">
                    {item.state === 'closed' ? <i className="ri-checkbox-circle-line" style={{ color: '#6a618c' }} /> : <i className="ri-record-circle-line" style={{ color: '#6e9879' }} />}
                  </Col>
                  <Col>
                    <Row>
                      <Link href={`https://github.com/dataesr/openalex-affiliations/issues/${item.github_issue_id}`} target="_blank">
                        {item.raw_affiliation_name}
                      </Link>
                    </Row>
                    <Row>{[...new Set(item?.previous_rors?.split(';'), item?.new_rors?.split(';'))].map((ror) => <span className="fr-mr-1w">{ror}</span>)}</Row>
                    <Row>
                      <Col xs="3">
                        #
                        {item.github_issue_id}
                      </Col>
                      <Col>
                        {item.state === 'closed' ? `Closed on ${item.date_closed}` : `Opened on ${item.date_opened}`}
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </>
  );
}
