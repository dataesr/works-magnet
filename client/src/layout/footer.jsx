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
          href="https://legifrance.gouv.fr"
          rel="noreferrer noopener external"
          target="_blank"
          title="LégiFrance, the French public service for the dissemination of law - new window"
        >
          legifrance.gouv.fr
        </Link>
        <Link
          className="fr-footer__content-link"
          href="https://www.info.gouv.fr/"
          rel="noreferrer noopener external"
          target="_blank"
          title="InfoGouv, Website of the French government - new window"
        >
          info.gouv.fr
        </Link>
        <Link
          className="fr-footer__content-link"
          href="https://service-public.fr"
          rel="noreferrer noopener external"
          target="_blank"
          title="ServicePublic, The official French administration website - new window"
        >
          service-public.fr
        </Link>
        <Link
          className="fr-footer__content-link"
          href="https://data.gouv.fr"
          rel="noreferrer noopener external"
          target="_blank"
          title="DataGouv, Open platform for French public data - new window"
        >
          data.gouv.fr
        </Link>
      </FooterBody>
      <FooterBottom>
        <Link
          className="fr-footer__bottom-link"
          href="https://github.com/dataesr/works-magnet"
          rel="noreferrer noopener external"
          target="_blank"
          title="Github repository"
        >
          GitHub
        </Link>
        <Link
          className="fr-footer__bottom-link"
          href="https://frenchopensciencemonitor.esr.gouv.fr/"
          rel="noreferrer noopener external"
          target="_blank"
        >
          French Open Science Monitor
        </Link>
        <Link
          className="fr-footer__bottom-link"
          href="https://scanr.enseignementsup-recherche.gouv.fr/"
          rel="noreferrer noopener external"
          target="_blank"
        >
          scanR, explore the world of French research & innovation
        </Link>
        <Link
          className="fr-footer__bottom-link"
          href="https://curiexplore.enseignementsup-recherche.gouv.fr/"
          rel="noreferrer noopener external"
          target="_blank"
        >
          CurieXplore
        </Link>
        <Link
          className="fr-footer__bottom-link"
          href="https://data.enseignementsup-recherche.gouv.fr/pages/home/"
          rel="noreferrer noopener external"
          target="_blank"
        >
          Open Data Platform
        </Link>
        {/*
          <Link
            className="fr-footer__partners-link"
            href="https://data.esr.gouv.fr/"
            rel="noreferrer noopener external"
            target="_blank"
          >
            #dataESR
          </Link>
        */}
        <Link
          className="fr-footer__bottom-link"
          href={`https://github.com/dataesr/works-magnet/releases/tag/v${VITE_VERSION}`}
          rel="noreferrer noopener external"
          target="_blank"
        >
          {`App version v${VITE_VERSION}`}
        </Link>
        {/*
          <Link
            className="fr-footer__bottom-link"
            href="/about/accessibility"
            rel="noreferrer noopener external"
            target="_blank"
          >
            Accessibility: currently being optimized
          </Link>
          <Link
            className="fr-footer__bottom-link"
            href="/about/legal-notices"
            rel="noreferrer noopener external"
            target="_blank"
          >
            Legal notices
          </Link>
        */}
      </FooterBottom>
    </Footer>
  );
}
