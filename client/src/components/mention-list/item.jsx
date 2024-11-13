import { useState } from 'react';
import { Badge, Button, Col, Link, Row, Text } from '@dataesr/dsfr-plus';
import { getIdLink } from '../../utils/works';

export default function MentionListItem({ mention, index, selected, toggleToSelected }) {
  const [expanded, setExpanded] = useState(false);

  const getIdLinkDisplay = (idType, idValue) => {
    const idLink = getIdLink(idType, idValue);
    const html = idLink
      ? `<a href="${idLink}" target="_blank">${idValue}</a>`
      : `<span>${idValue}</span>`;
    return html;
  };

  return (
    <li key={mention.id}>

      <Row>
        <Col>
          <input type="checkbox" selected={selected} />
        </Col>
        <Col md={8}>
          <strong>
            <span title="raw form">{mention.rawForm}</span>
          </strong>
          <Badge size="sm" color="blue-cumulus">{mention.type}</Badge>
          <div style={{ maxWidth: '90%' }} className="fr-mt-1w">
            <span className="fr-icon-quote-fill fr-icon--sm fr-mr-1w" aria-hidden="true" title="context" />
            <span dangerouslySetInnerHTML={{ __html: mention.context }} />
          </div>
          {
            !expanded && (
              <Button onClick={() => setExpanded(!expanded)} variant="text">
                view details
              </Button>
            )
          }
          {expanded && (
            <div style={{ borderLeft: '2px solid #000', paddingLeft: '8px' }}>
              <div className="fr-mt-1w">
                <Text size="xs" className="fr-my-0">
                  <b>DOI</b>
                  <span
                    className="fr-ml-1w"
                    dangerouslySetInnerHTML={{ __html: getIdLinkDisplay('doi', mention.doi) }}
                  />
                </Text>
              </div>
              <div className="fr-mt-1w">
                <span className="fr-icon-team-fill fr-icon--sm fr-mr-2w" aria-hidden="true" title="authors" />
                <i>
                  {mention.authors.slice(0, 5).join(', ')}
                  {mention.authors.length > 5 ? '...' : ''}
                </i>
              </div>
              {
                mention.affiliations && mention.affiliations.length > 0 && (
                  <div className="fr-mt-1w">
                    <span className="fr-icon-building-fill fr-icon--sm fr-mr-2w" aria-hidden="true" title="authors" />
                    <i>
                      {mention.affiliations.slice(0, 5).join(', ')}
                      {mention.affiliations.length > 5 ? '...' : ''}
                    </i>
                  </div>
                )
              }
              <Button onClick={() => setExpanded(!expanded)} variant="text">
                hide details
              </Button>
            </div>
          )}
        </Col>
        <Col className="text-center">
          {(mention.mention_context.created) ? (
            <Badge className="fr-mr-1w" size="" color="green-bourgeon">
              created
            </Badge>
          ) : (
            <Badge className="fr-mr-1w" size="">
              not created
            </Badge>
          )}
        </Col>
        <Col className="text-center">
          {(mention.mention_context.used) ? (
            <Badge className="fr-mr-1w" size="" color="green-bourgeon">
              used
            </Badge>
          ) : (
            <Badge className="fr-mr-1w" size="">
              not used
            </Badge>
          )}
        </Col>
        <Col className="text-center">
          {(mention.mention_context.shared) ? (
            <Badge className="fr-mr-1w" size="" color="green-bourgeon">
              shared
            </Badge>
          ) : (
            <Badge className="fr-mr-1w" size="">
              not shared
            </Badge>
          )}
        </Col>
      </Row>
    </li>
  );
}
