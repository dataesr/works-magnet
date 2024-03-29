import Beta from '../components/beta';

const {
  VITE_APP_NAME,
  VITE_DESCRIPTION,
  VITE_HEADER_TAG,
  VITE_HEADER_TAG_COLOR,
  VITE_MINISTER_NAME,
} = import.meta.env;

// TODO : all, Link from dsfr-plus
export default function Header() {
  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    // <>
    //   <HeaderWrapper className="header header-sticky">
    //     <>
    //       <Beta />
    //       <HeaderBody>
    //         <Logo
    //           asLink={<NavLink to="./" />}
    //           splitCharacter={9}
    //         >
    //           {VITE_MINISTER_NAME}
    //         </Logo>
    //         <Service
    //           asLink={<NavLink to="./" />}
    //           description={VITE_DESCRIPTION}
    //           title={(
    //             <>
    //               {VITE_APP_NAME}
    //               {VITE_HEADER_TAG && (
    //                 <Badge
    //                   color={(!VITE_HEADER_TAG_COLOR) ? 'info' : undefined}
    //                   colorFamily={VITE_HEADER_TAG_COLOR}
    //                   isSmall
    //                   text={VITE_HEADER_TAG}
    //                 />
    //               )}
    //             </>
    //           )}
    //         />
    //       </HeaderBody>
    //     </>
    //   </HeaderWrapper>
    // </>
    <header role="banner" className="fr-header">
      <div className="fr-header__body">
        <div className="fr-container">
          <div className="fr-header__body-row">
            <div className="fr-header__brand fr-enlarge-link">
              <div className="fr-header__brand-top">
                <div className="fr-header__logo">
                  <p className="fr-logo">
                    Intitulé
                    <br />
                    officiel
                  </p>
                </div>
              </div>
              <div className="fr-header__service">
                <a href="/" title="Accueil - [À MODIFIER - Nom du site / service] - Nom de l’entité (ministère, secrétariat d‘état, gouvernement)">
                  <p className="fr-header__service-title">
                    Nom du site / service
                  </p>
                </a>
                <p className="fr-header__service-tagline">baseline - précisions sur l‘organisation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
