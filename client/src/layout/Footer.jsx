import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Footer as FooterWrapper,
  FooterBody,
  FooterBottom,
  FooterBodyItem,
  FooterLink,
  Link,
  Logo,
} from '@dataesr/react-dsfr';

const {
  VITE_APP_NAME,
  VITE_MINISTER_NAME,
  VITE_DESCRIPTION,
  VITE_GIT_REPOSITORY_URL,
  VITE_VERSION,
} = import.meta.env;

export default function Footer({ switchTheme }) {
  const { isOpen, setIsOpen } = switchTheme;

  return (
    <FooterWrapper className="fr-mt-md-8w">
      <FooterBody description={`${VITE_APP_NAME} : ${VITE_DESCRIPTION}`}>
        <Logo
          asLink={<NavLink to="/" />}
          splitCharacter={9}
        >
          {VITE_MINISTER_NAME}
        </Logo>
        <FooterBodyItem>
          <Link target="_blank" href="https://legifrance.gouv.fr">
            legifrance.gouv.fr
          </Link>
        </FooterBodyItem>
        <FooterBodyItem>
          <Link target="_blank" href="https://gouvernement.fr">
            gouvernement.fr
          </Link>
        </FooterBodyItem>
        <FooterBodyItem>
          <Link target="_blank" href="https://service-public.fr">
            service-public.fr
          </Link>
        </FooterBodyItem>
        <FooterBodyItem>
          <Link target="_blank" href="https://data.gouv.fr">data.gouv.fr</Link>
        </FooterBodyItem>
      </FooterBody>
      <FooterBottom>
        <FooterLink asLink={<Link href={VITE_GIT_REPOSITORY_URL} target="_blank" />}>
          Github
        </FooterLink>
        <FooterLink target="_blank" href={`${VITE_GIT_REPOSITORY_URL}/releases/tag/v${VITE_VERSION}`}>
          {`Version de l'application v${VITE_VERSION}`}
        </FooterLink>
        <FooterLink>
          <button
            onClick={() => setIsOpen(true)}
            type="button"
            className="fr-footer__bottom-link fr-fi-theme-fill fr-link--icon-left"
            aria-controls="fr-theme-modal"
            data-fr-opened={isOpen}
          >
            Paramètres d'affichage
          </button>
        </FooterLink>
      </FooterBottom>
    </FooterWrapper>
  );
}

Footer.propTypes = {
  switchTheme: PropTypes.shape({
    isOpen: PropTypes.bool,
    setIsOpen: PropTypes.func,
  }).isRequired,
};
