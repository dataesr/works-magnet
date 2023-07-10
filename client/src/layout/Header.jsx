import PropTypes from 'prop-types';
import {
  Badge,
  Header as HeaderWrapper,
  HeaderBody,
  Logo,
  Service,
  Tool,
  ToolItemGroup,
} from '@dataesr/react-dsfr';

const {
  VITE_APP_NAME,
  VITE_HEADER_TAG,
  VITE_HEADER_TAG_COLOR,
  VITE_MINISTER_NAME,
  VITE_DESCRIPTION,
} = import.meta.env;

export default function Header({ switchTheme }) {
  const { isOpen, setIsOpen } = switchTheme;

  return (
    <HeaderWrapper>
      <HeaderBody>
        <Logo splitCharacter={9}>
          {VITE_MINISTER_NAME}
        </Logo>
        <Service
          title={(
            <>
              {VITE_APP_NAME}
              {VITE_HEADER_TAG && (
                <Badge
                  text={VITE_HEADER_TAG}
                  color={(!VITE_HEADER_TAG_COLOR) ? 'info' : undefined}
                  isSmall
                  colorFamily={VITE_HEADER_TAG_COLOR}
                />
              )}
            </>
          )}
          description={VITE_DESCRIPTION}
        />
        <Tool closeButtonLabel="fermer" className="extend">
          <ToolItemGroup>
            <button
              onClick={() => setIsOpen(true)}
              type="button"
              className="fr-footer__bottom-link fr-fi-theme-fill fr-link--icon-left"
              aria-controls="fr-theme-modal"
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
