import {
  Badge,
  Col,
  Container,
  Row,
  Tag,
  TagGroup,
  Title,
} from '@dataesr/dsfr-plus';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import Ribbon from '../components/ribbon';
import { isRor } from '../utils/ror';
import { normalize } from '../utils/strings';

const {
  VITE_APP_NAME,
  VITE_APP_TAG_LIMIT,
  VITE_DESCRIPTION,
  VITE_HEADER_TAG_COLOR,
  VITE_HEADER_TAG,
  VITE_MINISTER_NAME,
} = import.meta.env;

// TODO : all, Link from dsfr-plus
export default function Header({ isSticky }) {
  const [searchParams] = useSearchParams();
  const [options, setOptions] = useState({});

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

  return isSticky ? (
    <Container as="section" className="filters sticky" fluid>
      <Row className="fr-p-1w" verticalAlign="top">
        <Ribbon />
        <Col className="cursor-pointer" offsetXs="1" xs="2">
          <Title as="h1" look="h6" className="fr-m-0">
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
          <Row>
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
                {options?.affiliationStrings?.map((tag) => (
                  <Tag
                    color="blue-ecume"
                    key={`tag-sticky-${tag}`}
                    size="sm"
                  >
                    {tag}
                  </Tag>
                ))}
              </TagGroup>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  ) : (
    <header role="banner" className="fr-header">
      <Ribbon />
      <div className="fr-header__body">
        <div className="fr-container">
          <div className="fr-header__body-row">
            <div className="fr-header__brand fr-enlarge-link">
              <div className="fr-header__brand-top">
                <div className="fr-header__logo">
                  <p
                    className="fr-logo"
                    style={{ whiteSpace: 'pre-wrap' }}
                    dangerouslySetInnerHTML={{ __html: VITE_MINISTER_NAME }}
                  />
                </div>
              </div>
              <div className="fr-header__service">
                <a
                  href="/"
                  title={`Accueil - ${VITE_MINISTER_NAME.replaceAll(
                    '<br>',
                    ' ',
                  )}`}
                >
                  <p className="fr-header__service-title">
                    {VITE_APP_NAME}
                    {VITE_HEADER_TAG && (
                      <Badge noIcon size="sm" variant={VITE_HEADER_TAG_COLOR}>
                        {VITE_HEADER_TAG}
                      </Badge>
                    )}
                  </p>
                </a>
                <p className="fr-header__service-tagline">{VITE_DESCRIPTION}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

Header.defaultProps = {
  isSticky: false,
};
Header.propTypes = {
  isSticky: PropTypes.bool,
};
