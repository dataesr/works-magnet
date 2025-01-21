import { Container } from '@dataesr/dsfr-plus';
import { Outlet } from 'react-router-dom';

import Footer from './footer';

export default function Layout() {
  return (
    <>
      <Container fluid as="main" role="main">
        <Outlet />
      </Container>
      <Footer />
    </>
  );
}
