import PropTypes from 'prop-types';
import React, { useEffect, useId } from 'react';

import { Row } from '@dataesr/dsfr-plus';

import './index.scss';

function Spinner({ size }) {
  const id = useId();
  useEffect(() => {
    document.getElementById(id).style.setProperty('width', `${size}px`);
    document.getElementById(id).style.setProperty('height', `${size}px`);
  }, [size, id]);

  return (
    <svg id={id} className="spinner" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <circle className="internal-circle" cx="60" cy="60" r="30" />
      <circle className="external-circle" cx="60" cy="60" r="50" />
    </svg>
  );
}
Spinner.propTypes = {
  size: PropTypes.number,
};
Spinner.defaultProps = {
  size: 48,
};

function PageSpinner({ size }) {
  return <Row className="fr-my-2w flex--space-around fullwidth"><Spinner size={size} /></Row>;
}
PageSpinner.propTypes = {
  size: PropTypes.number,
};

PageSpinner.defaultProps = {
  size: 48,
};

export { PageSpinner };
