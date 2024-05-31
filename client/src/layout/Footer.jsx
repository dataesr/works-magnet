import { Link, Title } from '@dataesr/dsfr-plus';

export default function Footer() {
  return (
    <footer
      className="fr-footer fr-mt-md-8w fr-pb-md-2w"
      role="contentinfo"
      id="footer"
    >
      <div className="fr-container">
        <div className="fr-footer__body">
          <div className="fr-footer__brand fr-enlarge-link">
            <a
              href="/"
              title="Retour à l’accueil du site - Nom de l’entité (ministère, secrétariat d‘état, gouvernement)"
            >
              <p className="fr-logo">
                MINISTÈRE
                <br />
                DE L'ENSEIGNEMENT
                <br />
                SUPÉRIEUR
                <br />
                ET DE LA RECHERCHE
              </p>
            </a>
          </div>
          <div className="fr-grid-row fr-grid-row--center">
            <div style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Title as="h3" className="fr-footer__top-cat">
                Contact
              </Title>
              <ul className="fr-footer__top-list">
                <li>
                  <Link
                    className="fr-footer__top-link"
                    href="https://groupes.renater.fr/sympa/info/bso-etablissements"
                    target="_blank"
                  >
                    <span
                      className="fr-icon-group-line fr-icon--sm fr-mr-1w"
                      aria-hidden="true"
                    />
                    Mailing list
                  </Link>
                </li>
                <li>
                  <Link
                    className="fr-footer__top-link"
                    href="mailto:bso@recherche.gouv.fr"
                    target="_blank"
                  >
                    <span
                      className="fr-icon-mail-line fr-icon--sm fr-mr-1w"
                      aria-hidden="true"
                    />
                    Email
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="fr-footer__content">
            <p className="fr-footer__content-desc">
              Retrieve the scholarly works of your institution
            </p>
            <p className="fr-footer__content-desc">
              {`v${import.meta.env.VITE_VERSION}`}
            </p>
            <ul className="fr-footer__content-list">
              <li className="fr-footer__content-item">
                <a
                  className="fr-footer__content-link"
                  target="_blank"
                  rel="noopener external noreferrer"
                  title="Légifrance - Le service public de la diffusion du droit - nouvelle fenêtre"
                  href="https://legifrance.gouv.fr"
                >
                  legifrance.gouv.fr
                </a>
              </li>
              <li className="fr-footer__content-item">
                <a
                  className="fr-footer__content-link"
                  target="_blank"
                  rel="noopener external noreferrer"
                  title="Gouvernement.fr - Site du gouverment français - nouvelle fenêtre"
                  href="https://gouvernement.fr"
                >
                  gouvernement.fr
                </a>
              </li>
              <li className="fr-footer__content-item">
                <a
                  className="fr-footer__content-link"
                  target="_blank"
                  rel="noopener external noreferrer"
                  title="service-public.fr - Le site officiel de l'adiminstration française - nouvelle fenêtre"
                  href="https://service-public.fr"
                >
                  service-public.fr
                </a>
              </li>
              <li className="fr-footer__content-item">
                <a
                  className="fr-footer__content-link"
                  target="_blank"
                  rel="noopener external noreferrer"
                  title="Data Gouv - Plateforme ouverte des données publiques françaises - nouvelle fenêtre"
                  href="https://data.gouv.fr"
                >
                  data.gouv.fr
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
