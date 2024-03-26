import {
  Badge,
  Header as HeaderWrapper,
  HeaderBody,
  Logo,
  Service,
} from '@dataesr/react-dsfr';
import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';

import Beta from '../components/beta';
import useScroll from '../hooks/useScroll';

const {
  VITE_APP_NAME,
  VITE_DESCRIPTION,
  VITE_HEADER_TAG,
  VITE_HEADER_TAG_COLOR,
  VITE_MINISTER_NAME,
} = import.meta.env;

export default function Header() {
  const [isSticky, setIsSticky] = useState(false);
  const { scrollTop } = useScroll();

  useEffect(() => {
    if (!isSticky && scrollTop > 68) {
      setIsSticky(true);
    }
    if (isSticky && scrollTop < 20) {
      setIsSticky(false);
    }
  }, [isSticky, scrollTop]);

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      <HeaderWrapper className="header header-sticky">
        {isSticky ? (
          <>
            <Beta />
            <HeaderBody>
              <Service
                asLink={<NavLink to="./" />}
                className="fr-p-0"
                description={VITE_DESCRIPTION}
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
              />
            </HeaderBody>
          </>
        ) : (
          <>
            <Beta />
            <HeaderBody>
              <Logo
                asLink={<NavLink to="./" />}
                splitCharacter={9}
              >
                {VITE_MINISTER_NAME}
              </Logo>
              <Service
                asLink={<NavLink to="./" />}
                description={VITE_DESCRIPTION}
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
              />
            </HeaderBody>
          </>
        )}
      </HeaderWrapper>
    </>
  );
}
