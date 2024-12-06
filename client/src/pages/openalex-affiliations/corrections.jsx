import { Col, Container, Link, Row, Spinner } from '@dataesr/dsfr-plus';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import Header from '../../layout/header';

const ODS_BY_PAGE = 100;

export default function Corrections() {
  const [filter, setFilter] = useState([]);
  const [issues, setIssues] = useState([]);

  const getCorrections = async (page = 0) => {
    const offset = page * ODS_BY_PAGE;
    let corrections = [];
    const url = `https://data.enseignementsup-recherche.gouv.fr/api/explore/v2.1/catalog/datasets/openalex-affiliations-corrections/records?order_by=github_issue_id DESC&limit=${ODS_BY_PAGE}&offset=${offset}`;
    const response = await fetch(url);
    const { results } = await response.json();
    corrections = corrections.concat(results);
    if (results.length === ODS_BY_PAGE) {
      const c = await getCorrections(page + 1);
      corrections = corrections.concat(c);
    }
    return corrections;
  };

  const { data, error, isFetched, isFetching } = useQuery({
    queryKey: ['corrections'],
    queryFn: () => getCorrections(),
  });

  useEffect(() => {
    setFilter('');
    setIssues(data);
  }, [data]);

  useEffect(() => {
    const issuesTmp = issues.filter((issue) => issue?.contact_domain?.includes(filter));
    setIssues(issuesTmp);
  }, [filter, issues]);

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
          <>
            <input
              onChange={(e) => setFilter(e.target.value)}
              style={{
                border: '1px solid #ced4da',
                borderRadius: '4px',
                padding: '0.375rem 0.75rem',
                width: '600px',
                backgroundColor: 'white',
              }}
              value={filter}
            />
            <ul>
              {issues.map((issue, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <li className="fr-mb-2w list-none" key={`issue-${index}`}>
                  <Row>
                    <Col xs="1">
                      {issue.state === 'closed' ? <i className="ri-checkbox-circle-line" style={{ color: '#6a618c' }} /> : <i className="ri-record-circle-line" style={{ color: '#6e9879' }} />}
                    </Col>
                    <Col>
                      <Row>
                        <Link href={`https://github.com/dataesr/openalex-affiliations/issues/${issue.github_issue_id}`} target="_blank">
                          Correction for raw affiliation
                          {' '}
                          {issue.raw_affiliation_name}
                        </Link>
                      </Row>
                      <Row>{[...new Set(issue?.previous_rors?.split(';'), issue?.new_rors?.split(';'))].map((ror) => <span className="fr-mr-1w">{ror}</span>)}</Row>
                      <Row>
                        <Col xs="2">
                          #
                          {issue.github_issue_id}
                        </Col>
                        <Col>
                          by
                          {' '}
                          {issue.contact_domain}
                        </Col>
                        <Col xs="4">
                          {issue.state === 'closed' ? `Closed on ${issue.date_closed}` : `Opened on ${issue.date_opened}`}
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </li>
              ))}
            </ul>
          </>
        )}
      </Container>
    </>
  );
}
