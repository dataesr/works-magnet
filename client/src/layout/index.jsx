import { Container, SwitchTheme } from '@dataesr/react-dsfr';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import Footer from './Footer';
import Header from './Header';

export default function Layout() {
  const [isSwitchThemeOpen, setIsSwitchThemeOpen] = useState(false);

  return (
    <>
      <Header />
      <SwitchTheme isOpen={isSwitchThemeOpen} setIsOpen={setIsSwitchThemeOpen} />
      <Container as="main" role="main">
        <Outlet />
      </Container>
      <Footer switchTheme={{ isOpen: isSwitchThemeOpen, setIsOpen: setIsSwitchThemeOpen }} />
    </>
  );
}
