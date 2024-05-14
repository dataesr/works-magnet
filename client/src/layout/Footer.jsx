export default function Footer() {
  return (
    <footer className="fr-footer fr-mt-md-8w" role="contentinfo" id="footer">
      <div className="fr-container">
        <div className="fr-footer__body">
          <div className="fr-footer__brand fr-enlarge-link">
            <a href="/" title="Retour à l’accueil du site - Nom de l’entité (ministère, secrétariat d‘état, gouvernement)">
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
          <div className="fr-footer__content">
            <p className="fr-footer__content-desc">Retrieve the scholarly works of your institution</p>
            <ul className="fr-footer__content-list">
              <li className="fr-footer__content-item">
                <a className="fr-footer__content-link" target="_blank" rel="noopener external noreferrer" title="[À MODIFIER - Intitulé] - nouvelle fenêtre" href="https://legifrance.gouv.fr">legifrance.gouv.fr</a>
              </li>
              <li className="fr-footer__content-item">
                <a className="fr-footer__content-link" target="_blank" rel="noopener external noreferrer" title="[À MODIFIER - Intitulé] - nouvelle fenêtre" href="https://gouvernement.fr">gouvernement.fr</a>
              </li>
              <li className="fr-footer__content-item">
                <a className="fr-footer__content-link" target="_blank" rel="noopener external noreferrer" title="[À MODIFIER - Intitulé] - nouvelle fenêtre" href="https://service-public.fr">service-public.fr</a>
              </li>
              <li className="fr-footer__content-item">
                <a className="fr-footer__content-link" target="_blank" rel="noopener external noreferrer" title="[À MODIFIER - Intitulé] - nouvelle fenêtre" href="https://data.gouv.fr">data.gouv.fr</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="fr-footer__bottom">
          <ul className="fr-footer__bottom-list">
            <li className="fr-footer__bottom-item">
              <a className="fr-footer__bottom-link" href="#">Plan du site</a>
            </li>
            <li className="fr-footer__bottom-item">
              <a className="fr-footer__bottom-link" href="#">Accessibilité : non/partiellement/totalement conforme</a>
            </li>
            <li className="fr-footer__bottom-item">
              <a className="fr-footer__bottom-link" href="#">Mentions légales</a>
            </li>
            <li className="fr-footer__bottom-item">
              <a className="fr-footer__bottom-link" href="#">Données personnelles</a>
            </li>
            <li className="fr-footer__bottom-item">
              <a className="fr-footer__bottom-link" href="#">Gestion des cookies</a>
            </li>
            <li className="fr-footer__bottom-item">
              <a className="fr-footer__bottom-link">{`v${import.meta.env.VITE_VERSION}`}</a>
            </li>
          </ul>
          <div className="fr-footer__bottom-copy">
            <p>
              Sauf mention explicite de propriété intellectuelle détenue par des tiers, les contenus de ce site sont proposés sous
              <a href="https://github.com/etalab/licence-ouverte/blob/master/LO.md" target="_blank" rel="noopener external noreferrer" title="[À MODIFIER - Intitulé] - nouvelle fenêtre">licence etalab-2.0</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
