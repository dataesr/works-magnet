import { FormattedMessage } from 'react-intl';

export default function OpenalexNewCurationToolTile() {
  return (
    <div className="fr-enlarge-link fr-tile fr-tile--horizontal" size="sm">
      <div className="fr-tile__body">
        <div className="fr-tile__content">
          <h3 className="fr-tile__title">
            <a aria-disabled="true" label="OpenAlex ROR search">
              <FormattedMessage id="openalex-tile-new-curation-tool-title" />
            </a>
          </h3>
          <p className="fr-tile__detail">
            <FormattedMessage id="openalex-tile-new-curation-tool-1" />
            <br />
            <FormattedMessage id="openalex-tile-new-curation-tool-2" />
          </p>
        </div>
      </div>
    </div>
  );
}
