import { Badge, Col, Link, Row, Tag, TagGroup, Text } from '@dataesr/dsfr-plus';

export default function ListView({
  onRowEditComplete,
  setSelectedOpenAlex,
  selectedOpenAlex,
  allAffiliations,
}) {
  console.log(allAffiliations);

  return (
    <ul className="wm-list">
      {
        allAffiliations.map((affiliation) => (
          <li key={affiliation.key}>
            <Row>
              <Col>
                <input type="checkbox" id={`affiliation-${affiliation.key}`} />
              </Col>
              <Col md={11}>
                <Text as="label" htmlFor={`affiliation-${affiliation.key}`}>
                  <div dangerouslySetInnerHTML={{ __html: affiliation.nameHtml }} />
                </Text>
                <div>
                  ror list:
                  {affiliation.rors.map((ror) => (
                    <>
                      <Tag
                        color="blue-cumulus"
                        size="sm"
                        className="fr-mr-1w"
                        aria-describedby={`tooltip-${affiliation.key}-ror-${ror.rorId}`}
                      >
                        <Link className="fr-mr-1w" href={`https://ror.org/${ror.rorId}`} target="_blank">
                          {ror.rorId}
                        </Link>
                      </Tag>
                      <div
                        className="fr-tooltip fr-placement text-center"
                        id={`tooltip-${affiliation.key}-ror-${ror.rorId}`}
                        role="tooltip"
                        aria-hidden="true"
                      >
                        <img src={`https://flagsapi.com/${ror.rorCountry}/flat/48.png`} alt={`${ror.rorCountry} flag`} />
                        <br />
                        {ror.rorName}
                      </div>
                    </>
                  ))}
                </div>
                <div>
                  openAlex works:
                  {affiliation.works.slice(0, 5).map((work) => (
                    <Link className="fr-mr-1w" href="http://toto.com" target="_blank">
                      {work}
                    </Link>
                  ))}
                </div>
              </Col>
            </Row>
          </li>
        ))
      }
    </ul>
  );
}
