import { Badge, Checkbox, Col, Row, Text } from '@dataesr/dsfr-plus';
import PropTypes from 'prop-types';

import WorksList from '../components/works-list';
import RorBadge from '../components/ror-badge_old';
import RorName from '../components/ror-name';

export default function ListView({
  allAffiliations,
  allOpenalexCorrections,
  selectedOpenAlex,
  setFilteredAffiliationName,
  setSelectedOpenAlex,
}) {
  const defineRorColor = [];
  const dsColors = ['green-archipel', 'purple-glycine', 'pink-tuile', 'green-menthe', 'brown-cafe-creme'];
  const rorCount = {};
  allAffiliations.forEach((affiliation) => {
    affiliation.rors.forEach((ror) => {
      if (rorCount[ror.rorId]) {
        rorCount[ror.rorId] += 1;
      } else {
        rorCount[ror.rorId] = 1;
      }
    });
  });
  const sortedRor = Object.keys(rorCount).sort((a, b) => rorCount[b] - rorCount[a]);
  defineRorColor.push(...sortedRor.slice(0, 5).map((ror, index) => ({ ror, color: dsColors[index % dsColors.length] })));

  return (
    <ul className="wm-list">
      {
        allAffiliations.map((affiliation) => (
          <li key={affiliation.key}>
            <Row>
              <Col>
                <div style={{ display: 'inline-flex' }}>
                  <div style={{ display: 'inline-block', width: '20px' }}>
                    <Checkbox
                      checked={selectedOpenAlex.includes(affiliation)}
                      name="affiliations"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOpenAlex([...selectedOpenAlex, affiliation]);
                        } else {
                          setSelectedOpenAlex(selectedOpenAlex.filter((a) => a.key !== affiliation.key));
                        }
                      }}
                    />
                    <br />
                    {
                      (affiliation.hasCorrection) && (
                        <span className="fr-icon-warning-fill fr-icon--sm" style={{ color: '#B34000' }} />
                      )
                    }
                  </div>
                  <div className="fr-ml-1w" style={{ display: 'inline-block', maxWidth: '95%' }}>
                    <Text as="label" htmlFor={`affiliation-${affiliation.key}`} style={{ cursor: 'pointer' }}>
                      <div dangerouslySetInnerHTML={{ __html: affiliation.nameHtml.replace(' [ source: OpenAlex ]', '') }} />
                    </Text>
                    <WorksList works={affiliation.works} />
                  </div>
                </div>
              </Col>
              <Col md={4}>
                <table className="wm-table">
                  <tbody>
                    {affiliation.rorsToCorrect.map((rorToCorrect) => (
                      <tr key={`openalex-ror-affiliations-${rorToCorrect.rorId}`}>
                        <td>
                          <RorBadge
                            isRemoved={
                              allOpenalexCorrections.find((correctedAffiliation) => correctedAffiliation.id === affiliation.id)
                                ?.correctedRors?.find((_ror) => _ror.rorId === rorToCorrect.rorId)?.action === 'remove' ?? false
                            }
                            ror={rorToCorrect}
                            rorColor={defineRorColor.find((item) => item.ror === rorToCorrect.rorId)?.color || 'beige-gris-galet'}
                            setFilteredAffiliationName={setFilteredAffiliationName}
                          />
                          <br />
                          <RorName
                            isRemoved={
                              allOpenalexCorrections.find((correctedAffiliation) => correctedAffiliation.id === affiliation.id)
                                ?.correctedRors?.find((_ror) => _ror.rorId === rorToCorrect.rorId)?.action === 'remove' ?? false
                            }
                            ror={rorToCorrect}
                          />
                        </td>
                      </tr>
                    ))}
                    {(allOpenalexCorrections.find((correctedAffiliation) => correctedAffiliation.id === affiliation.id)
                      ?.correctedRors?.filter((_ror) => _ror.action === 'add') ?? []).map((rorToCorrect) => (
                      <tr key={`openalex-ror-affiliations-${rorToCorrect.rorId}`}>
                        <td>
                          <RorBadge
                            isRemoved={
                              allOpenalexCorrections.find((correctedAffiliation) => correctedAffiliation.id === affiliation.id)
                                ?.correctedRors?.find((_ror) => _ror.rorId === rorToCorrect.rorId)?.action === 'remove' ?? false
                            }
                            ror={rorToCorrect}
                            rorColor={defineRorColor.find((item) => item.ror === rorToCorrect.rorId)?.color || 'beige-gris-galet'}
                            setFilteredAffiliationName={setFilteredAffiliationName}
                          />
                          <br />
                          <RorName
                            isRemoved={
                              allOpenalexCorrections.find((correctedAffiliation) => correctedAffiliation.id === affiliation.id)
                                ?.correctedRors?.find((_ror) => _ror.rorId === rorToCorrect.rorId)?.action === 'remove' ?? false
                            }
                            ror={rorToCorrect}
                          />
                          <Badge
                            className="fr-ml-1w"
                            color="warning"
                          >
                            Added
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Col>
            </Row>
          </li>
        ))
      }
    </ul>
  );
}

ListView.propTypes = {
  allAffiliations: PropTypes.array.isRequired,
  allOpenalexCorrections: PropTypes.array.isRequired,
  setSelectedOpenAlex: PropTypes.func.isRequired,
  selectedOpenAlex: PropTypes.array.isRequired,
  setFilteredAffiliationName: PropTypes.func.isRequired,
};
