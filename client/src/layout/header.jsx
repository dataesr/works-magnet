import {
  Badge,
  Container, Row, Col,
  Title,
} from '@dataesr/dsfr-plus';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import Ribbon from '../components/ribbon';

const {
  VITE_APP_NAME,
  VITE_HEADER_TAG_COLOR,
  VITE_HEADER_TAG,
  VITE_MINISTER_NAME,
} = import.meta.env;

// TODO : all, Link from dsfr-plus
export default function Header({ isExpanded, id }) {
  return isExpanded ? (
    <header role="banner" className="fr-header expanded">
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
                  <div className="fr-header__service-title">
                    {VITE_APP_NAME}
                    {VITE_HEADER_TAG && (
                      <Badge noIcon size="sm" variant={VITE_HEADER_TAG_COLOR}>
                        {VITE_HEADER_TAG}
                      </Badge>
                    )}
                  </div>
                </a>
                <p className="fr-header__service-tagline">
                  <FormattedMessage id="tagline" />
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  ) : (
    <Container as="section" fluid>
      <Row className="fr-p-1w" verticalAlign="top">
        <Ribbon />
        <Col offsetXs="1" xs="2">
          <a
            href="/"
            title={`Accueil - ${VITE_MINISTER_NAME.replaceAll(
              '<br>',
              ' ',
            )}`}
          >
            <Title as="h1" className="fr-m-0" look="h6">
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
          </a>
        </Col>
        {
          id && (
            <Col xs="9">
              <Title as="h2" look="h6" className="fr-mb-1w">
                <FormattedMessage id={id} />
              </Title>
            </Col>
          )
        }
      </Row>
    </Container>
  );
}

Header.defaultProps = {
  isExpanded: false,
  id: '',
};
Header.propTypes = {
  isExpanded: PropTypes.bool,
  id: PropTypes.string,
};
