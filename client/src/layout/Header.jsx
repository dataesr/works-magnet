import {
  Badge,
  Header as HeaderWrapper,
  HeaderBody,
  Logo,
  Service,
} from '@dataesr/react-dsfr';
import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';

import Beta from '../components/beta';

const {
  VITE_APP_NAME,
  VITE_DESCRIPTION,
  VITE_HEADER_TAG,
  VITE_HEADER_TAG_COLOR,
  VITE_MINISTER_NAME,
} = import.meta.env;

export default function Header() {
  const isSticky = () => {
    const header = document.querySelector('.header');
    const scrollTop = window.scrollY;
    if (scrollTop >= 100) {
      header.classList.add('sticky');
    } else {
      header.classList.remove('sticky');
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', isSticky);
    return () => {
      window.removeEventListener('scroll', isSticky);
    };
  });

  return (
    <HeaderWrapper className="header">
      <Beta />
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
