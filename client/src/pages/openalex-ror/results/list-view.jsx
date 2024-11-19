import { Badge, Button, Col, Link, Row, Text } from '@dataesr/dsfr-plus';
import PropTypes from 'prop-types';

import WorksList from '../components/works-list';

export default function ListView({
  onRowEditComplete,
  setSelectedOpenAlex,
  selectedOpenAlex,
  allAffiliations,
  setFilteredAffiliationName,
}) {
  const defineRorColor = [];
  const dsColors = ['green-archipel', 'blue-ecume', 'blue-cumulus', 'purple-glycine', 'pink-macaron',
    'pink-tuile', 'orange-terre-battue',
    'brown-cafe-creme', 'brown-caramel', 'brown-opera', 'beige-gris-galet'];
    // tri des ror mar nombre
    // creation d'un tableau de ror avec un index pour chaque ror et son nombre d'occurences
    // ajout des couleurs pour chaque ror
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
                      </td>
                      <td>
                        <img
                          alt="ROR logo"
                          className="vertical-middle fr-mx-1w"
                          src="https://raw.githubusercontent.com/ror-community/ror-logos/main/ror-icon-rgb.svg"
                          height="16"
                        />
                        https://ror.org/
                        <Badge
                          className="fr-mr-1w"
                          color={defineRorColor.find((r) => r.ror === ror.rorId)?.color || 'yellow-tournesol'}
                          size="sm"
                        >
                          <Link className="fr-mr-1w" href={`https://ror.org/${ror.rorId}`} target="_blank">
                            {/* <strong>
                              ROR
                            </strong> */}
                            {` ${ror.rorId}`}
                          </Link>
                        </Badge>
                        <Button
                          icon="filter-line"
                          onClick={() => setFilteredAffiliationName(ror.rorId)}
                          size="sm"
                          variant="text"
                        />
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
