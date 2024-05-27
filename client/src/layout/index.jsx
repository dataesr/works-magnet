import { Container } from '@dataesr/dsfr-plus';
import { Outlet } from 'react-router-dom';

import Footer from './Footer';
import Header from './Header';

export default function Layout() {
  return (
    <>
      <Header />
      <Container fluid as="main" role="main">
        <Outlet />
      </Container>
      <Footer />
    </>
  );
}
