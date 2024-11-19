import { Badge, Button, Col, Link, Row, Text } from '@dataesr/dsfr-plus';
import PropTypes from 'prop-types';

import WorksList from '../components/works-list';
import RorBadge from '../components/ror-badge';

export default function ListView({
  onRowEditComplete,
  setSelectedOpenAlex,
  selectedOpenAlex,
  allAffiliations,
  setFilteredAffiliationName,
}) {
  const defineRorColor = [];
  const dsColors = ['ror-1', 'ror-2', 'ror-3', 'ror-4', 'ror-5'];
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
  console.log('defineRorColor', defineRorColor);

  return (
    <ul className="wm-list">
      {
        allAffiliations.map((affiliation) => (
          <li key={affiliation.key}>
            <Row>
              <Col md={1}>
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
              </Col>
              <Col md={6}>
                <Text as="label" htmlFor={`affiliation-${affiliation.key}`}>
                  <div dangerouslySetInnerHTML={{ __html: affiliation.nameHtml }} />
                </Text>
                <WorksList works={affiliation.works} />
              </Col>
              <Col md={5}>
                <table className="wm-table">
                  {affiliation.rors.map((ror) => (
                    <tr>
                      <td>
                        <RorBadge
                          ror={ror}
                          rorColor={defineRorColor.find((item) => item.ror === ror.rorId)?.color || 'ror-x'}
                        />
                      </td>
                      <td>
                        <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center' }}>
                          <img
                            alt={`${ror.rorCountry} flag`}
                            src={`https://flagsapi.com/${ror.rorCountry}/flat/16.png`}
                          />
                          <span
                            className="fr-ml-1w"
                            style={{
                              width: '300px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: 'inline-block',
                            }}
                          >
                            {ror.rorName}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
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
  setSelectedOpenAlex: PropTypes.func.isRequired,
  selectedOpenAlex: PropTypes.array.isRequired,
  allAffiliations: PropTypes.array.isRequired,
  setFilteredAffiliationName: PropTypes.func.isRequired,
};
