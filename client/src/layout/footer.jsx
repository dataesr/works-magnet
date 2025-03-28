import {
  Col,
  Container,
  Link,
  Logo,
  Row,
  Title,
} from '@dataesr/dsfr-plus';

import {
  Footer,
  FooterBody,
  FooterBottom,
  FooterTop,
} from '../components/footer';

const {
  VITE_MINISTER_NAME,
  VITE_VERSION,
} = import.meta.env;

export default function MainFooter() {
  return (
    <Footer fluid>
      <FooterTop>
        <Container>
          <Row gutters verticalAlign="top">
            <Col md={2} xs={12}>
              <div className="text-left">
                <Title
                  as="h3"
                  className="fr-footer__top-cat"
                >
                  About
                </Title>
                <ul className="fr-footer__top-list">
                  <li>
                    <Link
                      className="fr-footer__top-link"
                      href="/about"
                      icon="mail-fill"
                      iconPosition="left"
                    >
                      What is the Works-magnet?
                    </Link>
                  </li>
                </ul>
              </div>
            </Col>
            <Col md={2} xs={12}>
              <Title
                as="h3"
                className="fr-footer__top-cat"
              >
                Communication
              </Title>
              <ul>
                <li>
                  <Link
                    className="fr-footer__top-link"
                    href="https://hal.univ-lorraine.fr/hal-04598201"
                    icon="pie-chart-box-fill"
                    iconPosition="left"
                    target="_blank"
                  >
                    Poster
                  </Link>
                </li>
                <li>
                  <Link
                    className="fr-footer__top-link"
                    href="https://www.youtube.com/watch?v=2iBw3IV6ZDc"
                    icon="play-circle-fill"
                    iconPosition="left"
                    target="_blank"
                  >
                    Tutorial [FR]
                  </Link>
                </li>
                <li>
                  <Link
                    className="fr-footer__top-link"
                    href="https://youtube.com/watch?v=OIFHhz2OQPg"
                    icon="play-circle-fill"
                    iconPosition="left"
                    target="_blank"
                  >
                    Tutorial [EN]
                  </Link>
                </li>
                <li>
                  <Link
                    className="fr-footer__top-link"
                    href="https://hal.science/hal-04990114"
                    icon="compass-3-fill"
                    iconPosition="left"
                    target="_blank"
                  >
                    Guide [FR]
                  </Link>
                </li>
              </ul>
            </Col>
            <Col md={4} xs={12}>
              <Title
                as="h3"
                className="fr-footer__top-cat"
              >
                Open
              </Title>
              <ul>
                <li>
                  <Link
                    className="fr-footer__top-link"
                    href="https://data.enseignementsup-recherche.gouv.fr/explore/dataset/openalex-affiliations-corrections/information/"
                    icon="table-fill"
                    iconPosition="left"
                    target="_blank"
                  >
                    Open data
                  </Link>
                </li>
                <li>
                  <Link
                    className="fr-footer__top-link"
                    href="https://github.com/dataesr/works-magnet/"
                    icon="code-s-slash-line"
                    iconPosition="left"
                    target="_blank"
                  >
                    Open source
                  </Link>
                </li>
              </ul>
            </Col>
            <Col md={2} xs={12}>
              <div className="text-left">
                <Title
                  as="h3"
                  className="fr-footer__top-cat"
                >
                  Contact
                </Title>
                <ul className="fr-footer__top-list">
                  <li>
                    <Link
                      className="fr-footer__top-link"
                      href="mailto:bso@recherche.gouv.fr"
                      icon="mail-fill"
                      iconPosition="left"
                      target="_blank"
                    >
                      Email
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="fr-footer__top-link"
                      href="https://groupes.renater.fr/sympa/info/bso-etablissements"
                      icon="group-fill"
                      iconPosition="left"
                      target="_blank"
                    >
                      Mailing-list
                    </Link>
                  </li>
                </ul>
              </div>
            </Col>
            <Col md={2} xs={12}>
              <div className="text-left">
                <Title
                  as="h3"
                  className="fr-footer__top-cat"
                >
                  Follow us
                </Title>
                <ul className="fr-footer__top-list">
                  <li>
                    <Link
                      className="fr-footer__top-link"
                      href="https://x.com/dataESR"
                      icon="twitter-x-fill"
                      iconPosition="left"
                      target="_blank"
                    >
                      X
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="fr-footer__top-link"
                      href="https://www.linkedin.com/company/enseignementsup-recherche/mycompany/"
                      icon="linkedin-box-fill"
                      iconPosition="left"
                      target="_blank"
                    >
                      Linkedin
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="fr-footer__top-link"
                      href="https://www.facebook.com/enseignementsup.recherche"
                      icon="facebook-circle-fill"
                      iconPosition="left"
                      target="_blank"
                    >
                      Facebook
                    </Link>
                  </li>
                </ul>
              </div>
            </Col>
          </Row>
        </Container>
      </FooterTop>
      <FooterBody>
        <Logo
          splitCharacter="<br>"
          text={VITE_MINISTER_NAME}
        />
        <Link
          className="fr-footer__content-link"
          target="_blank"
          rel="noreferrer noopener external"
          title="LégiFrance, the French public service for the dissemination of law - new window"
          href="https://legifrance.gouv.fr"
        >
          legifrance.gouv.fr
        </Link>
        <Link
          className="fr-footer__content-link"
          target="_blank"
          rel="noreferrer noopener external"
          title="InfoGouv, Website of the French government - new window"
          href="https://www.info.gouv.fr/"
        >
          info.gouv.fr
        </Link>
        <Link
          className="fr-footer__content-link"
          target="_blank"
          rel="noreferrer noopener external"
          title="ServicePublic, The official French administration website - new window"
          href="https://service-public.fr"
        >
          service-public.fr
        </Link>
        <Link
          className="fr-footer__content-link"
          target="_blank"
          rel="noreferrer noopener external"
          title="DataGouv, Open platform for French public data - new window"
          href="https://data.gouv.fr"
        >
          data.gouv.fr
        </Link>
      </FooterBody>
      <FooterBottom>
        <div className="fr-footer__partners">
          <h2 className="fr-footer__partners-title">See also</h2>
          <div className="fr-footer__partners-logos">
            <div className="fr-footer__partners-sub">
              <ul>
                {/* <li>
                  <Link
                    className="fr-footer__partners-link"
                    href="https://github.com/dataesr"
                    target="_blank"
                  >
                    GitHub
                  </Link>
                </li> */}
                <li>
                  <Link
                    className="fr-footer__partners-link"
                    href="https://frenchopensciencemonitor.esr.gouv.fr/"
                    target="_blank"
                  >
                    French Open Science Monitor
                  </Link>
                </li>
                <li>
                  <Link
                    className="fr-footer__partners-link"
                    href="https://scanr.enseignementsup-recherche.gouv.fr/"
                    target="_blank"
                  >
                    scanR, explore the world of French research & innovation
                  </Link>
                </li>
                <li>
                  <Link
                    className="fr-footer__partners-link"
                    href="https://curiexplore.enseignementsup-recherche.gouv.fr/"
                    target="_blank"
                  >
                    CurieXplore
                  </Link>
                </li>
                <li>
                  <Link
                    className="fr-footer__partners-link"
                    href="https://data.enseignementsup-recherche.gouv.fr/pages/home/"
                    target="_blank"
                  >
                    Open Data Platform
                  </Link>
                </li>
                {/* <li>
                  <Link
                    className="fr-footer__partners-link"
                    href="https://data.esr.gouv.fr/EN/"
                    target="_blank"
                  >
                    #dataESR
                  </Link>
                </li> */}
              </ul>
            </div>

          </div>
        </div>
        {/* <Link className="fr-footer__bottom-link" href="/about/accessibility">
          Accessibility: currently being optimized
        </Link>
        <Link className="fr-footer__bottom-link" href="/about/legal-notices">
          Legal notices
        </Link> */}
        <Link
          target="_blank"
          rel="noreferer noopenner"
          className="fr-footer__bottom-link"
          href={`https://github.com/dataesr/works-magnet/releases/tag/v${VITE_VERSION}`}
        >
          {`App version v${VITE_VERSION}`}
        </Link>
      </FooterBottom>
    </Footer>
  );
}
