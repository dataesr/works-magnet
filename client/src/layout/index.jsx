import { Container } from '@dataesr/dsfr-plus';
import PropTypes from 'prop-types';
import { Outlet } from 'react-router-dom';

import Footer from './footer';
import Header from './header';

export default function Layout({ isSticky }) {
  return (
    <>
      <Header isSticky={isSticky} />
      <Container fluid as="main" role="main">
        <Outlet />
      </Container>
      <Footer />
    </>
  );
}

Layout.propTypes = {
  isSticky: PropTypes.bool.isRequired,
};
