import { Container, Link, Logo } from '@dataesr/dsfr-plus';
import PropTypes from 'prop-types';
import React from 'react';

import SwitchLanguage from '../switch-language';
import useLocalStorage from '../../hooks/useLocalStorage';

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
  children: PropTypes.object.isRequired,
  copy: PropTypes.string,
};

export function FooterBody({
  children,
  description,
}) {
  const [locale, setLocale] = useLocalStorage('works-magnet-locale', 'en');

  const languages = [
    { shortName: 'FR', fullName: 'Français', key: 'fr' },
    { shortName: 'EN', fullName: 'English', key: 'en' },
  ];

  const links = React.Children.toArray(children).filter(
    (child) => React.isValidElement(child) && child.type === Link,
  );
  const logo = React.Children.toArray(children).filter(
    (child) => React.isValidElement(child) && child.type === Logo,
  )?.[0];

  return (
    <div className="fr-container fr-footer__body">
      {logo ? (
        <div className="fr-footer__brand fr-enlarge-link">{logo}</div>
      ) : null}
      <div className="fr-footer__content">
        {description ? (
          <p className="fr-footer__content-desc">{description}</p>
        ) : null}
        {/* <div>
          Language:
          {' '}
          {locale}
          <button onClick={() => setLocale('fr')} type="button">Set language FR</button>
          <button onClick={() => setLocale('en')} type="button">Set language EN</button>
        </div> */}
        <SwitchLanguage languages={languages} />
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
