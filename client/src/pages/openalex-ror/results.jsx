import { Col, Container, Row, Spinner, Text } from '@dataesr/dsfr-plus';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import useToast from '../../hooks/useToast';
import Header from '../../layout/header';
import { getAffiliationsCorrections } from '../../utils/curations';
import { isRor } from '../../utils/ror';
import { normalize } from '../../utils/strings';
import { getWorks } from '../../utils/works';
import OpenalexTab from './openalexTab';

import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';

const { VITE_APP_TAG_LIMIT } = import.meta.env;

export default function Affiliations() {
  const [searchParams] = useSearchParams();
  const [affiliations, setAffiliations] = useState([]);
  const [allOpenalexCorrections, setAllOpenalexCorrections] = useState([]);
  const [options, setOptions] = useState({});
  const { toast } = useToast();

  const { data, error, isFetched, isFetching, refetch } = useQuery({
    queryKey: ['openalex-ror', JSON.stringify(options)],
    queryFn: () => getWorks(options, toast),
    enabled: false,
  });

  const undo = (id) => {
    const newAffiliations = affiliations.map((affiliation) => {
      if (affiliation.id === id) {
        // eslint-disable-next-line no-param-reassign
        affiliation.hasCorrection = false;
        // eslint-disable-next-line no-param-reassign
        affiliation.rorsToCorrect = affiliation.rors
          .map((r) => r.rorId)
          .join(';');
      }
      return affiliation;
    });
    setAffiliations(newAffiliations);
    setAllOpenalexCorrections(getAffiliationsCorrections(newAffiliations));
  };

  useEffect(() => {
    const queryParams = {
      endYear: searchParams.get('endYear') ?? '2023',
      startYear: searchParams.get('startYear') ?? '2023',
    };
    queryParams.affiliationStrings = [];
    queryParams.deletedAffiliations = [];
    queryParams.rors = [];
    queryParams.rorExclusions = [];
    searchParams.getAll('affiliations').forEach((item) => {
      if (isRor(item)) {
        queryParams.rors.push(item);
      } else {
        queryParams.affiliationStrings.push(normalize(item));
      }
    });
    searchParams.getAll('deletedAffiliations').forEach((item) => {
      if (isRor(item)) {
        queryParams.rorExclusions.push(item);
      } else {
        queryParams.deletedAffiliations.push(normalize(item));
      }
    });
    if (
      queryParams.affiliationStrings.length === 0
      && queryParams.rors.length === 0
    ) {
      console.error(
        `You must provide at least one affiliation longer than ${VITE_APP_TAG_LIMIT} letters.`,
      );
      return;
    }
    setOptions(queryParams);
  }, [searchParams]);

  useEffect(() => {
    if (Object.keys(options).length > 0) refetch();
  }, [options, refetch]);

  useEffect(() => {
    setAffiliations(data?.affiliations ?? []);
  }, [data]);

  const openAlexAffiliations = affiliations.filter((affiliation) => affiliation.source === 'OpenAlex');

  return (
    <>
      <Header isSticky />
      <Container fluid as="main" className="wm-bg">
        {isFetching && (
          <>
            <Header isSticky />
            <Container style={{ textAlign: 'center', minHeight: '600px' }} className="fr-pt-5w wm-font">
              <div className="fr-mb-5w wm-message fr-pt-10w">
                Loading data from OpenAlex, please wait...
                <br />
                <br />
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/OpenAlex_logo_2021.svg/320px-OpenAlex_logo_2021.svg.png" alt="OpenAlex" />
                <br />
                <span className="loader fr-my-5w">Loading</span>
              </div>
            </Container>
          </>
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

        {!isFetching && isFetched && (
          <Row>
            <Col md={2}>
              params:
            </Col>
            <Col md={10}>
              <OpenalexTab
                affiliations={openAlexAffiliations}
                allOpenalexCorrections={allOpenalexCorrections}
                options={options}
                setAllOpenalexCorrections={setAllOpenalexCorrections}
                undo={undo}
              />
            </Col>
          </Row>
        )}
      </Container>
    </>
  );
}
