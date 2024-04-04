import { Container } from '@dataesr/dsfr-plus';

// import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import Footer from './Footer';
import Header from './Header';

export default function Layout() {
  // TODO: restore SwitchTheme
  // const [isSwitchThemeOpen, setIsSwitchThemeOpen] = useState(false);

  return (
    <>
      <Header />
      {/* <SwitchTheme isOpen={isSwitchThemeOpen} setIsOpen={setIsSwitchThemeOpen} /> */}
      <Container fluid as="main" role="main">
        <Outlet />
      </Container>
      <Footer />
    </>
  );
}
