import {
  Badge,
  Container, Row, Col,
  Spinner,
  Title,
} from '@dataesr/dsfr-plus';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import Ribbon from '../../components/ribbon';
import useToast from '../../hooks/useToast';
import { getAffiliationsCorrections } from '../../utils/curations';
import { isRor } from '../../utils/ror';
import { normalize } from '../../utils/strings';
import { getWorks } from '../../utils/works';

import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import ModalInfo from './modal-info';
import ExportErrorsButton from './export-errors-button';
import SendFeedbackButton from './send-feedback-button';
import OpenalexTab from './openalexTab';

const {
  VITE_APP_NAME,
  VITE_APP_TAG_LIMIT,
  VITE_HEADER_TAG,
  VITE_HEADER_TAG_COLOR,
} = import.meta.env;

export default function Affiliations() {
  const [searchParams] = useSearchParams();

  const [affiliations, setAffiliations] = useState([]);
  const [allOpenalexCorrections, setAllOpenalexCorrections] = useState([]);
  const [options, setOptions] = useState({});
  const { toast } = useToast();

  const { data, error, isFetched, isFetching, refetch } = useQuery({
    queryKey: ['data', 'openalex-ror', JSON.stringify(options)],
    queryFn: () => getWorks(options, toast),
    enabled: false,
    cacheTime: 60 * (60 * 1000), // 1h
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    // TODO: Find a cleaner way to display the spinner
    <>
      <Container fluid as="section" className="filters sticky">
        <Row verticalAlign="top" className="fr-p-1w">
          <Ribbon />
          <Col xs="3" className="cursor-pointer" offsetXs="1">
            <Title as="h1" look="h2" className="wm-font">
              {VITE_APP_NAME}
              {VITE_HEADER_TAG && (
                <Badge
                  className="fr-ml-1w"
                  color={VITE_HEADER_TAG_COLOR}
                  size="sm"
                >
                  {VITE_HEADER_TAG}
                </Badge>
              )}
            </Title>
          </Col>
          <Col>
            <Title as="h2" className=" wm-font">
              Improve ROR matching in OpenAlex
              <ModalInfo />
            </Title>
            {/* <Row>
              <Col
                className="cursor-pointer"
                onClick={(e) => {
                  // setIsOpen(true);
                  e.preventDefault();
                }}
              >
                <TagGroup>
                  <Tag color="blue-ecume" key="tag-sticky-years" size="sm">
                    {`${options.startYear} - ${options.endYear}`}
                  </Tag>
                </TagGroup>
              </Col>
            </Row> */}
          </Col>
        </Row>
      </Container>
      <Container fluid as="section" className="">
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
                Error while fetching data, please try again later or contact the
                team (see footer).
              </div>
            </Col>
          </Row>
        )}

        {!isFetching && isFetched && (
          <>
            <Row className="wm-bg">
              <Col md={9} offsetMd={2}>
                <div className="wm-actions">
                  <ExportErrorsButton
                    allOpenalexCorrections={allOpenalexCorrections}
                    options={options}
                  />

                  <SendFeedbackButton
                    allOpenalexCorrections={allOpenalexCorrections}
                  />
                </div>
              </Col>
              <Col />
            </Row>
            <OpenalexTab
              affiliations={affiliations.filter(
                (affiliation) => affiliation.source === 'OpenAlex',
              )}
              setAllOpenalexCorrections={setAllOpenalexCorrections}
              undo={undo}
            />
          </>
        )}
      </Container>
    </>
  );
}
