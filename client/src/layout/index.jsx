import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Container, SwitchTheme } from '@dataesr/react-dsfr';
import Header from './Header';
import Footer from './Footer';
import ScrollToTop from './ScrollToTopButton';

export default function Layout() {
  const [isSwitchThemeOpen, setIsSwitchThemeOpen] = useState(false);
  return (
    <>
      <Header switchTheme={{ isOpen: isSwitchThemeOpen, setIsOpen: setIsSwitchThemeOpen }} />
      <SwitchTheme isOpen={isSwitchThemeOpen} setIsOpen={setIsSwitchThemeOpen} />
      <Container as="main" role="main" fluid>
        <Outlet />
      </Container>
      <ScrollToTop />
      <Footer switchTheme={{ isOpen: isSwitchThemeOpen, setIsOpen: setIsSwitchThemeOpen }} />
    </>
  );
}
