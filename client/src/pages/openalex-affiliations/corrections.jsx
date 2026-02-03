import { Col, Container, Link, Row, Spinner } from '@dataesr/dsfr-plus';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import Header from '../../layout/header';

const ODS_BY_PAGE = 100;
const ODS_URL = 'https://data.enseignementsup-recherche.gouv.fr/api/explore/v2.1/catalog/datasets/openalex-affiliations-corrections';
const TOP_CONTRIBUTORS_LIMIT = 10;

export default function Corrections() {
  // const [filter, setFilter] = useState([]);
  const [chartOptionsDomains, setChartOptionsDomains] = useState({});
  const [chartOptionsDates, setChartOptionsDates] = useState({});
  const [corrections, setCorrections] = useState([]);
  const [numberOfCorrections, setNumberOfCorrections] = useState(0);

  const DATES = [];
  const startYear = 2024;
  const startMonth = 3;
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  Object.values([...Array(currentYear - startYear + 1).keys()].map((year) => `${year + startYear}`)).forEach((year) => {
    Object.values([...Array(12).keys()].map((month) => `0${month + 1}`.slice(-2))).forEach((month) => {
      if (Number(year) === startYear) {
        if (Number(month >= startMonth)) {
          DATES.push(`${year}/${month}`);
        }
      } else if (Number(year) === currentYear) {
        if (Number(month) <= currentMonth) {
          DATES.push(`${year}/${month}`);
        }
      } else {
        DATES.push(`${year}/${month}`);
      }
    });
  });

  const getCorrections = async (state, page = 0) => {
    const offset = page * ODS_BY_PAGE;
    let _corrections = [];
    const url = `${ODS_URL}/records?order_by=github_issue_id&limit=${ODS_BY_PAGE}&offset=${offset}&refine=state%3A${state}`;
    const { results, total_count: totalCount } = await (await fetch(url)).json();
    _corrections = _corrections.concat(results);
    // if (results.length === ODS_BY_PAGE) {
    //   const c = await getCorrections(state, page + 1);
    //   _corrections = _corrections.concat(c);
    // }
    return { corrections: _corrections, totalCount };
  };

  const getFacetDomains = async () => {
    const url = `${ODS_URL}/facets?facet=contact_domain`;
    const { facets } = await (await fetch(url)).json();
    const categories = facets.find((facet) => facet.name === 'contact_domain').facets.slice(0, TOP_CONTRIBUTORS_LIMIT).map((domain) => domain.name);
    const promises = categories.map((category) => fetch(`${ODS_URL}/facets?refine=contact_domain:${category}&facet=state`));
    const responses = (await Promise.all(promises)).map((response) => response.json());
    const results = (await Promise.all(responses)).map((response) => response.facets[0].facets);
    const closed = results.map((result) => result.find((item) => item.name === 'closed')?.count ?? 0);
    const open = results.map((result) => result.find((item) => item.name === 'open')?.count ?? 0);
    setChartOptionsDomains({
      chart: { type: 'bar' },
      credits: { enabled: false },
      plotOptions: { series: { stacking: 'normal', dataLabels: { enabled: true } } },
      series: [{ color: '#6a618c', data: closed, name: 'Closed' }, { color: '#6e9879', data: open, name: 'Open' }],
      title: { text: `Top ${TOP_CONTRIBUTORS_LIMIT} contributors' domain` },
      xAxis: { categories },
      yAxis: { title: { text: 'Number of corrections requested' } },
    });
  };

  const getFacetDate = async (field) => {
    const url2024 = `https://data.enseignementsup-recherche.gouv.fr/api/records/1.0/search/?refine.${field}=2024&facet=${field}&dataset=openalex-affiliations-corrections&rows=0`;
    const { facet_groups: facetGroups2024 } = await (await fetch(url2024)).json();
    const datesFacet2024 = facetGroups2024.find((facet) => facet.name === field)?.facets?.map((facet) => facet.facets).flat();
    const url2025 = `https://data.enseignementsup-recherche.gouv.fr/api/records/1.0/search/?refine.${field}=2025&facet=${field}&dataset=openalex-affiliations-corrections&rows=0`;
    const { facet_groups: facetGroups2025 } = await (await fetch(url2025)).json();
    const datesFacet2025 = facetGroups2025.find((facet) => facet.name === field)?.facets?.map((facet) => facet.facets).flat();
    const datesFacet = [...datesFacet2024, ...datesFacet2025];
    return DATES.map((date) => datesFacet.find((item) => item.path === date)?.count ?? 0);
  };

  const getCorrectionsAndFacets = async () => {
    getFacetDomains();
    const tmpClosed = await getFacetDate('date_closed');
    const closed = tmpClosed.reduce((acc, cur, index) => {
      acc.push((acc[index - 1] || 0) + cur);
      return acc;
    }, []);
    const tmpOpened = await getFacetDate('date_opened');
    const opened = tmpOpened.reduce((acc, cur, index) => {
      acc.push((acc[index - 1] || 0) + cur);
      return acc;
    }, []);
    const queries = [getCorrections('closed'), getCorrections('open')];
    const [closedCorrections, openedCorrections] = await Promise.all(queries);
    const correctionsTmp = [...closedCorrections.corrections, ...openedCorrections.corrections];
    setNumberOfCorrections(closedCorrections.totalCount + openedCorrections.totalCount);
    correctionsTmp.reverse((a, b) => b.date_opened - a.date_opened);
    setCorrections(correctionsTmp);
    // let data = {};
    // correctionsTmp.forEach((correction) => {
    //   const dateOpened = correction?.date_opened?.slice(0, 7);
    //   const dateClosed = correction?.date_closed?.slice(0, 7);
    //   if (dateOpened) {
    //     if (!Object.keys(data).includes(dateOpened)) data[dateOpened] = { closed: 0, opened: 0 };
    //     data[dateOpened].opened += 1;
    //   }
    //   if (dateClosed) {
    //     if (!Object.keys(data).includes(dateClosed)) data[dateClosed] = { closed: 0, opened: 0 };
    //     data[dateClosed].closed += 1;
    //   }
    // });
    // data = Object.keys(data).sort().reduce((item, key) => ({ ...item, [key]: data[key] }), {});
    // const closed = [];
    // let closedSum = 0;
    // const opened = [];
    // let openedSum = 0;
    // Object.values(data).forEach((item) => {
    //   closedSum += item.closed;
    //   closed.push(closedSum);
    //   openedSum += item.opened;
    //   opened.push(openedSum);
    // });
    setChartOptionsDates({
      credits: { enabled: false },
      plotOptions: { series: { dataLabels: { enabled: true } } },
      series: [{ color: '#6a618c', data: closed, name: 'Closed' }, { color: '#6e9879', data: opened, name: 'Open' }],
      title: { text: 'Number of corrections requested over time' },
      xAxis: { categories: DATES },
      yAxis: { title: { text: 'Number of corrections requested' } },
    });
    return '';
  };

  const { error, isFetched, isFetching } = useQuery({
    queryKey: ['facets'],
    queryFn: () => getCorrectionsAndFacets(),
    refetchOnWindowFocus: false,
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

        {!isFetching && isFetched && corrections && (
          <div>
            <b>
              {numberOfCorrections.toLocaleString()}
              {' '}
              corrections
            </b>
            {' '}
            requested until last night.
          </div>
        )}
        {!isFetching && isFetched && chartOptionsDomains && (
          <HighchartsReact
            highcharts={Highcharts}
            options={chartOptionsDomains}
          />
        )}
        {!isFetching && isFetched && chartOptionsDates && (
          <HighchartsReact
            highcharts={Highcharts}
            options={chartOptionsDates}
          />
        )}
        {!isFetching && isFetched && (corrections.length > 0) && (
          <>
            <h5 className="text-center fr-mt-5w">Corrections requested</h5>
            {/* <input
              onChange={(e) => setFilter(e.target.value)}
              style={{
                border: '1px solid #ced4da',
                borderRadius: '4px',
                padding: '0.375rem 0.75rem',
                width: '600px',
                backgroundColor: 'white',
              }}
              value={filter}
            /> */}
            <ul>
              {corrections.map((correction) => (
                <li className="fr-mb-2w list-none" key={correction.github_issue_id}>
                  <Row>
                    <Col xs="1">
                      {correction.state === 'closed' ? <i className="ri-checkbox-circle-line" style={{ color: '#6a618c' }} /> : <i className="ri-record-circle-line" style={{ color: '#6e9879' }} />}
                    </Col>
                    <Col>
                      <Row>
                        <Link href={`https://github.com/dataesr/openalex-affiliations/issues/${correction.github_issue_id}`} target="_blank">
                          Correction for raw affiliation
                          {' '}
                          {correction.raw_affiliation_name}
                        </Link>
                      </Row>
                      <Row>
                        {[...new Set(correction?.previous_rors?.split(';'), correction?.new_rors?.split(';'))]
                          .map((ror) => <span className="fr-mr-1w" key={`ror-${ror}`}>{ror}</span>)}
                      </Row>
                      <Row>
                        <Col xs="2">
                          #
                          {correction.github_issue_id}
                        </Col>
                        <Col>
                          by
                          {' '}
                          {correction.contact_domain}
                        </Col>
                        <Col xs="4">
                          {correction.state === 'closed' ? `Closed on ${correction.date_closed}` : `Opened on ${correction.date_opened}`}
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
