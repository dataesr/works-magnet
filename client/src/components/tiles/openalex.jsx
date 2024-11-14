
import { FormattedMessage } from 'react-intl';

export default function OpenalexTile() {
  return (
    <div className="fr-enlarge-link fr-tile fr-tile--horizontal" size="sm">
      <div className="fr-tile__body">
        <div className="fr-tile__content">
          <h3 className="fr-tile__title">
            <a href="./openalex-ror/search?view=openalex">
              <FormattedMessage id="openalex-tile-title" />
            </a>
          </h3>
          <p className="fr-tile__detail">
            <FormattedMessage id="openalex-tile-detail-1" />
            <br />
            <FormattedMessage id="openalex-tile-detail-2" />
            <br />
            <FormattedMessage id="openalex-tile-detail-3" />
          </p>
        </div>
      </div>
    </div>
  );
}
