import {
  Badge,
  Header as HeaderWrapper,
  HeaderBody,
  Logo,
  Service,
} from '@dataesr/react-dsfr';
import { NavLink } from 'react-router-dom';

const {
  VITE_APP_NAME,
  VITE_DESCRIPTION,
  VITE_HEADER_TAG,
  VITE_HEADER_TAG_COLOR,
  VITE_MINISTER_NAME,
} = import.meta.env;

export default function Header() {
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
      </HeaderBody>
    </HeaderWrapper>
  );
}
