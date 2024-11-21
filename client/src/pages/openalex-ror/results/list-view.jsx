import { Col, Row, Text } from '@dataesr/dsfr-plus';
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
                    <input
                      id={`affiliation-${affiliation.key}`}
                      type="checkbox"
                      checked={selectedOpenAlex.includes(affiliation)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOpenAlex([...selectedOpenAlex, affiliation]);
                        } else {
                          setSelectedOpenAlex(selectedOpenAlex.filter((a) => a.key !== affiliation.key));
                        }
                      }}
                    />
                    {
                      allOpenalexCorrections.find((correctedAffiliation) => correctedAffiliation.id === affiliation.id) && (
                        <span className="fr-icon-warning-fill fr-icon--sm" style={{ color: '#B34000' }} />
                      )
                    }
                  </div>
                  <div style={{ display: 'inline-block', maxWidth: '95%' }}>
                    <Text as="label" htmlFor={`affiliation-${affiliation.key}`}>
                      <div dangerouslySetInnerHTML={{ __html: affiliation.nameHtml }} />
                    </Text>
                    <WorksList works={affiliation.works} />
                  </div>
                </div>
              </Col>
              <Col md={4}>
                <table className="wm-table">
                  <tbody>
                    {affiliation.rors.map((ror) => (
                      <tr key={`openalex-ror-affiliations-${ror.rorId}`}>
                        <td>
                          <RorBadge
                            isRemoved={
                              (allOpenalexCorrections.find((correctedAffiliation) => correctedAffiliation.id === affiliation.id)
                              && allOpenalexCorrections.find((correctedAffiliation) => correctedAffiliation.id === affiliation.id)
                                ?.correctedRors.split(';')
                                .find((_ror) => _ror === ror.rorId) === undefined
                              ) || false
                            }
                            ror={ror}
                            rorColor={defineRorColor.find((item) => item.ror === ror.rorId)?.color || 'beige-gris-galet'}
                            setFilteredAffiliationName={setFilteredAffiliationName}
                          />
                          <br />
                          <RorName
                            isRemoved={
                              (allOpenalexCorrections.find((correctedAffiliation) => correctedAffiliation.id === affiliation.id)
                              && allOpenalexCorrections.find((correctedAffiliation) => correctedAffiliation.id === affiliation.id)
                                ?.correctedRors.split(';')
                                .find((_ror) => _ror === ror.rorId) === undefined
                              ) || false
                            }
                            ror={ror}
                          />
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
