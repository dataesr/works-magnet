import { Container, Link, Logo } from '@dataesr/dsfr-plus';
import PropTypes from 'prop-types';
import React from 'react';

export function FooterTop({ children }) {
  return <div className="fr-footer__top">{children}</div>;
}
FooterTop.propTypes = {
  children: PropTypes.object.isRequired,
};

export function Footer({ children, fluid = false }) {
  return (
    <footer className="fr-footer fr-mt-3w" role="contentinfo" id="footer">
      <Container fluid={fluid}>
        {children}
      </Container>
    </footer>
  );
}
Footer.defaultProps = {
  fluid: false,
};
Footer.propTypes = {
  children: PropTypes.array.isRequired,
  fluid: PropTypes.bool,
};

export function FooterBottom({
  children,
  copy,
}) {
  const childs = React.Children.toArray(children);
  return (
    <div className="fr-container fr-footer__bottom">
      <ul className="fr-footer__bottom-list">
        {childs.map((child, i) => (
          <li key={i} className="fr-footer__bottom-item">
            {child}
          </li>
        ))}
      </ul>
      {copy ? (
        <div className="fr-footer__bottom-copy">
          <p>{copy}</p>
        </div>
      ) : null}
    </div>
  );
}
FooterBottom.defaultProps = {
  copy: undefined,
};
FooterBottom.propTypes = {
  children: PropTypes.array.isRequired,
  copy: PropTypes.string,
};

export function FooterBody({
  children,
  description,
}) {
  const links = React.Children.toArray(children).filter(
    (child) => React.isValidElement(child) && child.type === Link,
  );
  const logo = React.Children.toArray(children).filter(
    (child) => React.isValidElement(child) && child.type === Logo,
  )?.[0];

  return (
    <div className="fr-container fr-footer__body">
      {logo ? (
        <>
          <div className="fr-footer__brand fr-enlarge-link">{logo}</div>
          <a
            className="fr-footer__brand-link"
            href="/"
            label="Retour à l'accueil du site"
            style={{ background: 'none' }}
            title="Retour à l'accueil du site"
          >
            <svg aria-hidden="true" viewBox="0 0 1167.77 752.85" width="100%">
              <use
                className="fr-text-black-white--grey"
                href="sies_logo_signature.svg#sies-logo-text"
              />
              <use href="sies_logo_signature.svg#sies-logo-artwork" />
            </svg>
          </a>
        </>
      ) : null}
      <div className="fr-footer__content">
        {description ? (
          <p className="fr-footer__content-desc">{description}</p>
        ) : null}
        {links.length ? (
          <ul className="fr-footer__content-list">
            {links.map((link, i) => (
              <li key={i} className="fr-footer__content-item">
                {link}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

FooterBody.defaultProps = {
  description: undefined,
};
FooterBody.propTypes = {
  children: PropTypes.array.isRequired,
  description: PropTypes.string,
};
