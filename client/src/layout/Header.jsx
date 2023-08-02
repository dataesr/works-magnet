import {
  Badge,
  Header as HeaderWrapper,
  HeaderBody,
  Logo,
  Service,
  Tool,
  ToolItemGroup,
} from '@dataesr/react-dsfr';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';

const {
  VITE_APP_NAME,
  VITE_DESCRIPTION,
  VITE_HEADER_TAG,
  VITE_HEADER_TAG_COLOR,
  VITE_MINISTER_NAME,
} = import.meta.env;

export default function Header({ switchTheme }) {
  const { isOpen, setIsOpen } = switchTheme;

  return (
    <HeaderWrapper>
      <HeaderBody>
        <Logo
          asLink={<NavLink to="./" />}
          splitCharacter={9}
        >
          {VITE_MINISTER_NAME}
        </Logo>
        <Service
          title={(
            <>
              {VITE_APP_NAME}
              {VITE_HEADER_TAG && (
                <Badge
                  color={(!VITE_HEADER_TAG_COLOR) ? 'info' : undefined}
                  colorFamily={VITE_HEADER_TAG_COLOR}
                  isSmall
                  text={VITE_HEADER_TAG}
                />
              )}
            </>
          )}
          description={VITE_DESCRIPTION}
          asLink={<NavLink to="./" />}
        />
        <Tool closeButtonLabel="fermer" className="extend">
          <ToolItemGroup>
            <button
              aria-controls="fr-theme-modal"
              className="fr-footer__bottom-link fr-fi-theme-fill fr-link--icon-left"
              onClick={() => setIsOpen(true)}
              type="button"
              data-fr-opened={isOpen}
            >
              Paramètres d'affichage
            </button>
          </ToolItemGroup>
        </Tool>
      </HeaderBody>
    </HeaderWrapper>
  );
}

Header.propTypes = {
  switchTheme: PropTypes.shape({
    isOpen: PropTypes.bool,
    setIsOpen: PropTypes.func,
  }).isRequired,
};
