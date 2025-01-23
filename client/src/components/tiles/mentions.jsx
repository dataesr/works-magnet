import { FormattedMessage } from 'react-intl';

export default function MentionsTile() {
  return (
    <div className="fr-enlarge-link fr-tile fr-tile--horizontal" size="sm">
      <div className="fr-tile__body">
        <div className="fr-tile__content">
          <h3 className="fr-tile__title">
            <a href="./mentions" label="Mentions search">
              <FormattedMessage id="mentions-tile-title" />
            </a>
          </h3>
          <p className="fr-tile__detail">
            <FormattedMessage id="mentions-tile-detail-1" />
            <br />
            <FormattedMessage id="mentions-tile-detail-2" />
            <br />
            <FormattedMessage id="mentions-tile-detail-3" />
          </p>
        </div>
      </div>
    </div>
  );
}
