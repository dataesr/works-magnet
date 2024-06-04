import { Col, Container, Link, Logo, Row, Title } from '@dataesr/dsfr-plus';
import cn from 'classnames';

import {
  Footer,
  FooterBody,
  FooterBottom,
  FooterTop,
} from '../components/footer/index';

const version = import.meta.env.VITE_VERSION;

export default function MainFooter() {
  return (
    <Footer fluid>
      <FooterTop>
        <Container>
          <Row gutters verticalAlign="middle">
            <Col xs={12} lg={4}>
              <Row horizontalAlign="left">
                <div className="text-left">
                  <Title
                    as="h3"
                    className={cn('fr-footer__top-cat', 'text-left')}
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
                  <Title
                    as="h3"
                    className={cn('fr-footer__top-cat', 'fr-mt-2w', 'text-left')}
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
                  </ul>
                </div>
              </Row>
            </Col>
            <Col xs={12} lg={4}>
              <Row horizontalAlign="center">
                <div className="text-center">
                  <Title
                    as="h3"
                    className={cn('fr-footer__top-cat', 'text-center')}
                  >
                    Follow us
                  </Title>
                  <ul className="fr-footer__top-list">
                    <li>
                      <Link
                        className="fr-footer__top-link"
                        href="https://x.com/dataESR"
                        target="_blank"
                        icon="twitter-x-fill"
                        iconPosition="left"
                      >
                        X
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="fr-footer__top-link"
                        href="https://www.linkedin.com/company/enseignementsup-recherche/mycompany/"
                        target="_blank"
                        icon="linkedin-box-fill"
                        iconPosition="left"
                      >
                        Linkedin
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="fr-footer__top-link"
                        href="https://www.facebook.com/enseignementsup.recherche"
                        target="_blank"
                        iconPosition="left"
                        icon="facebook-circle-fill"
                      >
                        Facebook
                      </Link>
                    </li>
                  </ul>
                </div>
              </Row>
            </Col>
            <Col xs={12} lg={4}>
              <Row horizontalAlign="right">
                <div className="text-right">
                  <Title
                    as="h3"
                    className={cn('fr-footer__top-cat', 'text-right')}
                  >
                    See also
                  </Title>
                  <ul className="fr-footer__top-list">
                    <li>
                      <Link
                        className="fr-footer__top-link"
                        href="https://github.com/dataesr"
                        target="_blank"
                      >
                        GitHub
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="fr-footer__top-link"
                        href="https://frenchopensciencemonitor.esr.gouv.fr/"
                        target="_blank"
                      >
                        French Open Science Monitor
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="fr-footer__top-link"
                        href="https://scanr.enseignementsup-recherche.gouv.fr/"
                        target="_blank"
                      >
                        scanR, explore the world of French research & innovation
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="fr-footer__top-link"
                        href="https://curiexplore.enseignementsup-recherche.gouv.fr/"
                        target="_blank"
                      >
                        CurieXplore
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="fr-footer__top-link"
                        href="https://data.enseignementsup-recherche.gouv.fr/pages/home/"
                        target="_blank"
                      >
                        Open Data Platform
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="fr-footer__top-link"
                        href="https://data.esr.gouv.fr/EN/"
                        target="_blank"
                      >
                        #dataESR
                      </Link>
                    </li>
                  </ul>
                </div>
              </Row>
            </Col>
          </Row>
        </Container>
      </FooterTop>
      <FooterBody description="Retrieve the scholarly works of your institution">
        <Logo
          splitCharacter="|"
          text="Ministère|de l'enseignement|supérieur|et de la recherche"
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
          href={`https://github.com/dataesr/works-magnet/releases/tag/v${version}`}
        >
          {`App version v${version}`}
        </Link>
      </FooterBottom>
    </Footer>
  );
}
