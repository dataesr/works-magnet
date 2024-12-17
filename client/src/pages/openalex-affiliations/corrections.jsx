import { Col, Container, Link, Row, Spinner } from '@dataesr/dsfr-plus';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import Header from '../../layout/header';

const ODS_BY_PAGE = 100;
const ODS_URL = 'https://data.enseignementsup-recherche.gouv.fr/api/explore/v2.1/catalog/datasets/openalex-affiliations-corrections';
const TOP_CONTRIBUTORS_LIMIT = 10;

export default function Corrections() {
  // const [filter, setFilter] = useState([]);
  // const [issues, setIssues] = useState([]);
  const [chartOptions1, setChartOptions1] = useState();
  const [chartOptions2, setChartOptions2] = useState();

  const getCorrections = async (page = 0) => {
    const offset = page * ODS_BY_PAGE;
    let corrections = [];
    const url = `${ODS_URL}/records?order_by=github_issue_id&limit=${ODS_BY_PAGE}&offset=${offset}`;
    const response = await fetch(url);
    const { results } = await response.json();
    corrections = corrections.concat(results);
    if (results.length === ODS_BY_PAGE) {
      const c = await getCorrections(page + 1);
      corrections = corrections.concat(c);
    }
    return corrections;
  };

  const getFacets = async () => {
    const url = `${ODS_URL}/facets?facet=contact_domain`;
    const { facets } = await (await fetch(url)).json();
    const categories = facets.find((facet) => facet.name === 'contact_domain').facets.slice(0, TOP_CONTRIBUTORS_LIMIT).map((domain) => domain.name);
    const promises = categories.map((category) => fetch(`${ODS_URL}/facets?refine=contact_domain:${category}&facet=state`));
    const responses = (await Promise.all(promises)).map((response) => response.json());
    const results = (await Promise.all(responses)).map((response) => response.facets[0].facets);
    const closed = results.map((result) => result.find((item) => item.name === 'closed')?.count ?? 0);
    const open = results.map((result) => result.find((item) => item.name === 'open')?.count ?? 0);
    setChartOptions1({
      chart: { type: 'bar' },
      credits: { enabled: false },
      plotOptions: { series: { stacking: 'normal', dataLabels: { enabled: true } } },
      series: [{ color: '#6a618c', data: closed, name: 'Closed' }, { color: '#6e9879', data: open, name: 'Open' }],
      title: { text: `Top ${TOP_CONTRIBUTORS_LIMIT} contributors` },
      xAxis: { categories },
      yAxis: { title: { text: 'Number of corrections requested' } },
    });
  };

  const getCorrectionsAndFacets = async () => {
    const queries = [getCorrections(), getFacets()];
    const [corrections] = await Promise.all(queries);
    let data = {};
    corrections.forEach((correction) => {
      const dateOpened = correction?.date_opened?.slice(0, 7);
      const dateClosed = correction?.date_closed?.slice(0, 7);
      if (dateOpened) {
        if (!Object.keys(data).includes(dateOpened)) data[dateOpened] = { closed: 0, opened: 0 };
        data[dateOpened].opened += 1;
      }
      if (dateClosed) {
        if (!Object.keys(data).includes(dateClosed)) data[dateClosed] = { closed: 0, opened: 0 };
        data[dateClosed].closed += 1;
      }
    });
    data = Object.keys(data).sort().reduce((item, key) => ({ ...item, [key]: data[key] }), {});
    const closed = [];
    let closedSum = 0;
    const opened = [];
    let openedSum = 0;
    Object.values(data).forEach((item) => {
      closedSum += item.closed;
      closed.push(closedSum);
      openedSum += item.opened;
      opened.push(openedSum);
    });
    setChartOptions2({
      credits: { enabled: false },
      plotOptions: { series: { dataLabels: { enabled: true } } },
      series: [{ color: '#6a618c', data: closed, name: 'Closed' }, { color: '#6e9879', data: opened, name: 'Open' }],
      title: { text: 'Number of corrections requested over time' },
      xAxis: { categories: Object.keys(data) },
      yAxis: { title: { text: 'Number of corrections requested' } },
    });
    return '';
  };

  const { error, isFetched, isFetching } = useQuery({
    queryKey: ['facets'],
    queryFn: () => getCorrectionsAndFacets(),
  });

  // useEffect(() => {
  //   setFilter('');
  //   setIssues(data);
  // }, [data]);

  // useEffect(() => {
  //   const issuesTmp = issues.filter((issue) => issue?.contact_domain?.includes(filter));
  //   setIssues(issuesTmp);
  // }, [filter, issues]);

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

        {!isFetching && isFetched && chartOptions1 && (
          <HighchartsReact
            highcharts={Highcharts}
            options={chartOptions1}
          />
        )}
        {!isFetching && isFetched && chartOptions2 && (
          <HighchartsReact
            highcharts={Highcharts}
            options={chartOptions2}
          />
        )}

        {/*
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
        */}
      </Container>
    </>
  );
}
