import { Button, Col, Link, Row, Tag, Text } from '@dataesr/dsfr-plus';
import { useState } from 'react';

import WorksList from '../components/works-list';

export default function ListView({
  onRowEditComplete,
  setSelectedOpenAlex,
  selectedOpenAlex,
  allAffiliations,
  highlightRor,
  setFilteredAffiliationName,
}) {
  const defineRorColor = [];
  const dsColors = ['green-tilleul-verveine', 'green-bourgeon', 'green-emeraude', 'green-menthe',
    'green-archipel', 'blue-ecume', 'blue-cumulus', 'purple-glycine', 'pink-macaron',
    'pink-tuile', 'yellow-tournesol', 'yellow-moutarde', 'orange-terre-battue',
    'brown-cafe-creme', 'brown-caramel', 'brown-opera', 'beige-gris-galet'];
  if (highlightRor) {
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
    defineRorColor.push(...sortedRor.map((ror, index) => ({ ror, color: dsColors[index % dsColors.length] })));
    console.log('defineRorColor', defineRorColor);
  }
  console.log(allAffiliations);

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
                />
              </Col>
              <Col md={7}>
                <Text as="label" htmlFor={`affiliation-${affiliation.key}`}>
                  <div dangerouslySetInnerHTML={{ __html: affiliation.nameHtml }} />
                </Text>
                <WorksList works={affiliation.works} />
              </Col>
              <Col md={4}>
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
                        <Tag
                          className="fr-mr-1w"
                          color={defineRorColor.find((r) => r.ror === ror.rorId)?.color || 'blue-cumulus'}
                          size="sm"
                        >
                          <Link className="fr-mr-1w" href={`https://ror.org/${ror.rorId}`} target="_blank">
                            {ror.rorId}
                          </Link>
                        </Tag>
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
