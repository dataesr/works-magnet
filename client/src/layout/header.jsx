import { Badge } from '@dataesr/dsfr-plus';
import PropTypes from 'prop-types';

import Ribbon from '../components/ribbon';

const {
  VITE_APP_NAME,
  VITE_DESCRIPTION,
  VITE_HEADER_TAG,
  VITE_HEADER_TAG_COLOR,
  VITE_MINISTER_NAME,
} = import.meta.env;

// TODO : all, Link from dsfr-plus
export default function Header({ isSticky }) {
  return (
    !isSticky && (
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
                        <Badge
                          noIcon
                          size="sm"
                          variant={VITE_HEADER_TAG_COLOR}
                        >
                          {VITE_HEADER_TAG}
                        </Badge>
                      )}
                    </p>
                  </a>
                  <p className="fr-header__service-tagline">
                    {VITE_DESCRIPTION}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    )
  );
}

Header.propTypes = {
  isSticky: PropTypes.bool.isRequired,
};
