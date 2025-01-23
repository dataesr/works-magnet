import PropTypes from 'prop-types';
import { useId } from 'react';

import useLocalStorage from '../../hooks/useLocalStorage';

export default function SwitchLanguage({ languages }) {
  const id = useId();
  const [locale, setLocale] = useLocalStorage('works-magnet-locale', 'en');
  const currentLanguage = languages.find(({ key }) => key === locale);

  return (
    <nav role="navigation" className="fr-translate fr-nav">
      <div className="fr-nav__item">
        <button
          aria-controls={id}
          aria-expanded="false"
          className="fr-translate__btn fr-btn fr-btn--tertiary"
          title="Sélectionner une langue"
          type="button"
        >
          {currentLanguage.shortName}
          <span key={currentLanguage.key} className="fr-hidden-lg">
            {' '}
            -
            {' '}
            {currentLanguage.fullName}
          </span>
        </button>
        <div className="fr-collapse fr-translate__menu fr-menu" id={id}>
          <ul className="fr-menu__list">
            {
              languages.map(({ key, shortName, fullName }) => (
                <li key={key}>
                  <button
                    aria-current={locale === key}
                    className="fr-translate__language fr-nav__link"
                    lang={key}
                    onClick={() => setLocale(key)}
                    type="button"
                  >
                    {shortName}
                    {' '}
                    -
                    {' '}
                    {fullName}
                  </button>
                </li>
              ))
            }
          </ul>
        </div>
      </div>
    </nav>
  );
}

SwitchLanguage.defaultProps = {
  languages: [],
};

SwitchLanguage.propTypes = {
  languages: PropTypes.array,
};
