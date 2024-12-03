import { Badge, Checkbox, Col, Row, Text } from '@dataesr/dsfr-plus';
import PropTypes from 'prop-types';

import RorBadge from '../components/ror-badge';
import RorName from '../components/ror-name';
import WorksList from '../components/works-list';

export default function ListView({
  allAffiliations,
  removeRorFromAddList,
  setFilteredAffiliationName,
  setSelectAffiliations,
  toggleRemovedRor,
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
          <li
            className={affiliation.selected ? 'selected' : ''}
            key={affiliation.key}
          >
            <Row>
              <Col>
                <div style={{ display: 'inline-flex' }}>
                  <div style={{ display: 'inline-block', width: '20px' }}>
                    <Checkbox
                      checked={affiliation.selected}
                      name="affiliations"
                      onChange={() => setSelectAffiliations([affiliation.id])}
                    />
                    <br />
                    {
                      (affiliation.hasCorrection) && (
                        <span className="fr-icon-warning-fill fr-icon--sm" style={{ color: '#B34000' }} />
                      )
                    }
                  </div>
                  <div className="fr-ml-1w" style={{ display: 'inline-block', maxWidth: '95%' }}>
                    <Text
                      as="span"
                      onClick={() => setSelectAffiliations([affiliation.id])}
                      style={{ cursor: 'pointer' }}
                    >
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
                      <tr key={`openalex-affiliations-affiliations-${rorToCorrect.rorId}`}>
                        <td>
                          <RorBadge
                            isRemoved={affiliation.removeList.includes(rorToCorrect.rorId)}
                            ror={rorToCorrect}
                            rorColor={defineRorColor.find((item) => item.ror === rorToCorrect.rorId)?.color || 'beige-gris-galet'}
                            setFilteredAffiliationName={setFilteredAffiliationName}
                            removeRor={() => toggleRemovedRor(affiliation.id, rorToCorrect.rorId)}
                          />
                          <br />
                          <RorName
                            isRemoved={affiliation.removeList.includes(rorToCorrect.rorId)}
                            ror={rorToCorrect}
                          />
                        </td>
                      </tr>
                    ))}
                    {affiliation.addList.map((ror) => (
                      <tr key={`openalex-affiliations-affiliations-${ror.rorId}`}>
                        <td>
                          <RorBadge
                            ror={ror}
                            rorColor={defineRorColor.find((item) => item.ror === ror.rorId)?.color || 'beige-gris-galet'}
                            setFilteredAffiliationName={setFilteredAffiliationName}
                            removeRor={() => removeRorFromAddList(affiliation.id, ror.rorId)}
                          />
                          <br />
                          <RorName ror={ror} />
                          <Badge
                            className="fr-ml-1w"
                            color="blue-cumulus"
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
  removeRorFromAddList: PropTypes.func.isRequired,
  setFilteredAffiliationName: PropTypes.func.isRequired,
  setSelectAffiliations: PropTypes.func.isRequired,
  toggleRemovedRor: PropTypes.func.isRequired,
};
