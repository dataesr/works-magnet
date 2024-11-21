import {
  Badge,
  Button,
  Col,
  Container,
  Modal, ModalContent, ModalFooter, ModalTitle,
  Row,
  Tag,
  Text,
  TextInput,
  Title,
} from '@dataesr/dsfr-plus';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { status } from '../../../config';
import useToast from '../../../hooks/useToast';
import Header from '../../../layout/header';
import { getAffiliationsCorrections } from '../../../utils/curations';
import { getRorData, isRor } from '../../../utils/ror';
import { normalize, removeDiacritics } from '../../../utils/strings';
import { getTagColor } from '../../../utils/tags';
import { getWorks } from '../../../utils/works';
import ExportErrorsButton from '../components/export-errors-button';
import SendFeedbackButton from '../components/send-feedback-button';
import ViewsSelector from './views-selector';

import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';

const { VITE_APP_TAG_LIMIT } = import.meta.env;

export default function Affiliations() {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [affiliations, setAffiliations] = useState([]);
  const [allOpenalexCorrections, setAllOpenalexCorrections] = useState([]);
  const [body, setBody] = useState({});
  const { toast } = useToast();
  const [addList, setAddList] = useState([]);
  const [removeList, setRemoveList] = useState([]);

  const [filteredAffiliations, setFilteredAffiliations] = useState([]);
  const [filteredAffiliationName, setFilteredAffiliationName] = useState('');
  const [filteredStatus] = useState([
    status.tobedecided.id,
    status.validated.id,
    status.excluded.id,
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ror, setRor] = useState('');
  const [rorMessage, setRorMessage] = useState('');
  const [rorMessageType, setRorMessageType] = useState('');
  const [selectedOpenAlex, setSelectedOpenAlex] = useState([]);
  const [timer, setTimer] = useState();

  const { data, error, isFetched, isFetching, refetch } = useQuery({
    queryKey: ['openalex-ror', JSON.stringify(body)],
    // Search for works from affiliations for each affiliation strictly longer than 2 letters
    queryFn: () => getWorks({
      ...body,
      affiliationStrings: body.affiliations.filter((affiliation) => !affiliation.isDisabled).map((affiliation) => affiliation.label),
      rors: body.affiliations.filter((affiliation) => affiliation.isRor).map((affiliation) => affiliation.label),
    }, toast),
    enabled: false,
  });

  const undo = (id) => {
    const newAffiliations = affiliations.map((affiliation) => {
      if (affiliation.id === id) {
        // eslint-disable-next-line no-param-reassign
        affiliation.hasCorrection = false;
        // eslint-disable-next-line no-param-reassign
        affiliation.rorsToCorrect = affiliation.rors
          .map((r) => r.rorId)
          .join(';');
      }
      return affiliation;
    });
    setAffiliations(newAffiliations);
    setAllOpenalexCorrections(getAffiliationsCorrections(newAffiliations));
  };

  const listOfUniqueRors = {};
  selectedOpenAlex.forEach((affiliation) => {
    affiliation.rors.forEach((ror) => {
      if (!Object.keys(listOfUniqueRors).includes(ror.rorId)) {
        listOfUniqueRors[ror.rorId] = { ...ror, countAffiliations: 0 };
      }
      listOfUniqueRors[ror.rorId].countAffiliations += 1;
    });
  });

  const actionToOpenAlex = (action, _ror) => {
    selectedOpenAlex.map((item) => {
      let rorsToCorrect = item.rorsToCorrect.trim().split(';');
      if (action === 'add') {
        rorsToCorrect.push(_ror.rorId);
      } else if (action === 'remove') {
        rorsToCorrect = rorsToCorrect.filter((item2) => item2 !== _ror.rorId);
      }
      // eslint-disable-next-line no-param-reassign
      item.rorsToCorrect = [...new Set(rorsToCorrect)].join(';');
      // eslint-disable-next-line no-param-reassign
      item.hasCorrection = item.rors.map((r) => r.rorId).join(';') !== item.rorsToCorrect.trim();
      return item;
    });
    setAllOpenalexCorrections(getAffiliationsCorrections(selectedOpenAlex));
  };

  const applyActions = () => {
    removeList.forEach((rorId) => {
      const rorItem = listOfUniqueRors[rorId];
      actionToOpenAlex('remove', rorItem);
    });
  };

  useEffect(() => {
    const getData = async () => {
      const queryParams = {
        endYear: searchParams.get('endYear') ?? '2023',
        startYear: searchParams.get('startYear') ?? '2023',
      };
      queryParams.deletedAffiliations = [];
      queryParams.rorExclusions = [];
      queryParams.affiliations = await Promise.all(searchParams.getAll('affiliations').map(async (affiliation) => {
        const label = normalize(affiliation);
        let children = [];
        // Compute rorNames
        if (isRor(label)) {
          const rorNames = await getRorData(label);
          children = rorNames.map((item) => item.names).flat().map((name) => ({
            isDisabled: name.length < VITE_APP_TAG_LIMIT,
            isRor: false,
            label: name,
            source: 'ror',
          }));
        }
        return {
          children,
          isDisabled: label.length < VITE_APP_TAG_LIMIT,
          isRor: isRor(label),
          label,
          source: 'user',
        };
      }));

      searchParams.getAll('deletedAffiliations').forEach((item) => {
        if (isRor(item)) {
          queryParams.rorExclusions.push(item);
        } else {
          queryParams.deletedAffiliations.push(normalize(item));
        }
      });
      setBody(queryParams);
    };
    getData();
  }, [searchParams]);

  useEffect(() => {
    if (Object.keys(body).length > 0) refetch();
  }, [body, refetch]);

  useEffect(() => {
    setAffiliations(data?.affiliations ?? []);
  }, [data]);

  useEffect(() => {
    if (timer) {
      clearTimeout(timer);
    }
    const timerTmp = setTimeout(() => {
      const openAlexAffiliations = affiliations.filter((affiliation) => affiliation.source === 'OpenAlex');
      const filteredAffiliationsTmp = openAlexAffiliations.filter((affiliation) => {
        const regex = new RegExp(removeDiacritics(filteredAffiliationName));
        return regex.test(
          affiliation.key.replace('[ source: ', '').replace(' ]', ''),
        );
      });
      // Recompute corrections only when the array has changed
      if (filteredAffiliationsTmp.length !== filteredAffiliations.length) {
        setAllOpenalexCorrections(
          getAffiliationsCorrections(filteredAffiliationsTmp),
        );
      }
      setFilteredAffiliations(filteredAffiliationsTmp);
    }, 500);
    setTimer(timerTmp);
    // The timer should not be tracked
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [affiliations, filteredAffiliationName, filteredStatus]);

  useEffect(() => {
    if (ror === '') {
      setRorMessage('');
      setRorMessageType('');
    } else if (!isRor(ror)) {
      setRorMessage('Invalid ROR');
      setRorMessageType('error');
    } else if (Object.keys(listOfUniqueRors).includes(ror)) {
      setRorMessage('Already listed ROR');
      setRorMessageType('error');
    } else {
      setRorMessage('Valid ROR');
      setRorMessageType('valid');
    };
  }, [ror]);

  return (
    <>
      <Header id="openalex-tile-title" />
      <Container fluid as="main" className="wm-bg">
        {isFetching && (
          <Container style={{ textAlign: 'center', minHeight: '600px' }} className="fr-pt-5w wm-font">
            <div className="fr-mb-5w wm-message fr-pt-10w">
              Loading data from OpenAlex, please wait...
              <br />
              <br />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/OpenAlex_logo_2021.svg/320px-OpenAlex_logo_2021.svg.png" alt="OpenAlex" />
              <br />
              <span className="loader fr-my-5w">Loading</span>
            </div>
          </Container>
        )}

        {error && (
          <Row gutters className="fr-mb-16w">
            <Col xs="12">
              <Text>
                Error while fetching data, please try again later or contact the
                team (see footer).
              </Text>
            </Col>
          </Row>
        )}

        {!isFetching && isFetched && (
          <Row>
            <Col className="wm-menu" md={2}>
              <Row>
                <Button
                  className="fr-mt-1w"
                  color="blue-ecume"
                  icon="arrow-left-line"
                  onClick={() => navigate(`/${pathname.split('/')[1]}/search${search}`)}
                  size="sm"
                >
                  Back to search page
                </Button>
              </Row>
              <Row>
                <Col>
                  <div className="wm-title">
                    <span className="fr-icon-calendar-line fr-mr-1w" aria-hidden="true" />
                    Selected years
                  </div>
                  <div className="wm-content">
                    <Tag className="fr-mr-1w" color="blue-cumulus" key="tag-year-start">
                      {`Start: ${body.startYear}`}
                    </Tag>

                    <Tag color="blue-cumulus" key="tag-year-end">
                      {`End: ${body.endYear}`}
                    </Tag>
                  </div>
                </Col>
              </Row>

              <Row>
                <Col>
                  <div className="wm-title">
                    <span className="fr-icon-hotel-line fr-mr-1w" aria-hidden="true" />
                    Searched affiliations
                  </div>
                  <div className="wm-content">

                    {body.affiliations.map((affiliation) => (
                      <Row key={`row-${affiliation.label}`}>
                        <Tag
                          className={`fr-mr-1w ${affiliation.isDisabled ? 'scratched' : ''}`}
                          color={getTagColor(affiliation)}
                          key={`tag-${affiliation.label}`}
                        >
                          {affiliation.label}
                        </Tag>
                        {affiliation.children.map((child) => (
                          <Tag
                            className={`fr-mr-1w fr-mt-1w ${child.isDisabled ? 'scratched' : ''}`}
                            color={getTagColor(child)}
                            key={`tag-${child.label}`}
                          >
                            {child.label}
                          </Tag>
                        ))}
                      </Row>
                    ))}
                  </div>
                </Col>
              </Row>
            </Col>
            <Col md={10}>
              <div className="wm-bg wm-content">
                <Modal isOpen={isModalOpen} hide={() => setIsModalOpen((prev) => !prev)} size="xl">
                  <ModalTitle>
                    Modify ROR in
                    <Badge color="brown-opera" className="fr-ml-1w">{selectedOpenAlex.length}</Badge>
                    {` OpenAlex selected affiliation${selectedOpenAlex.length > 1 ? 's' : ''}`}
                  </ModalTitle>
                  <ModalContent>
                    <Row>
                      <Col>
                        <div className="fr-table fr-table--bordered" id="table-bordered-component">
                          <div className="fr-table__wrapper">
                            <div className="fr-table__container">
                              <div className="fr-table__content">
                                <table id="table-bordered">
                                  <thead>
                                    <tr>
                                      <th>ROR</th>
                                      <th>Name</th>
                                      <th>Number of affiliations</th>
                                      <th>Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {Object.values(listOfUniqueRors).map((rorItem) => (
                                      <tr>
                                        <td>
                                          <a href={`https://ror.org/${rorItem.rorId}`} target="_blank">
                                            <img alt="ROR logo" className="vertical-middle" src="https://raw.githubusercontent.com/ror-community/ror-logos/main/ror-icon-rgb.svg" height="16" />
                                            {
                                              removeList.includes(rorItem.rorId) ? (
                                                <strike>{` https://ror.org/${rorItem.rorId}`}</strike>
                                              ) : (
                                                  ` https://ror.org/${rorItem.rorId}`
                                              )
                                            }
                                          </a>
                                        </td>
                                        <td>
                                          <img
                                            alt={`${rorItem.rorCountry} flag`}
                                            src={`https://flagsapi.com/${rorItem.rorCountry}/flat/16.png`}
                                          />
                                          <span
                                            className="fr-ml-1w"
                                          >
                                            {
                                              removeList.includes(rorItem.rorId) ? (
                                                <strike>{rorItem.rorName}</strike>
                                              ) : (
                                                rorItem.rorName
                                              )
                                            }
                                          </span>
                                        </td>
                                        <td>{rorItem.countAffiliations}</td>
                                        <td style={{ minWidth: '160px' }}>
                                          {
                                            removeList.includes(rorItem.rorId) ? (
                                              <>
                                                <Button
                                                  aria-label="undo remove"
                                                  color="blue-ecume"
                                                  icon="arrow-go-back-line"
                                                  onClick={() => setRemoveList((prevList) => prevList.filter((item) => item !== rorItem.rorId))}
                                                  size="sm"
                                                />
                                                <Badge color="pink-tuile" className="fr-mr-1w">
                                                  Removed
                                                </Badge>
                                              </>
                                            ) : (
                                              <Button
                                                aria-label="Remove ROR"
                                                color="pink-tuile"
                                                disabled={removeList.includes(rorItem.rorId)}
                                                icon="delete-line"
                                                onClick={() => setRemoveList((prevList) => [...prevList, rorItem.rorId])}
                                                size="sm"
                                              />
                                            )
                                          }
                                          <Button onClick={() => setAddList((prevList) => [...prevList, rorItem.rorId])}>Apply to all</Button>
                                        </td>
                                      </tr>
                                    ))}
                                    {addList.map((add) => (
                                      <tr>
                                        <td>
                                          <a href={`https://ror.org/${add.rorId}`} target="_blank">
                                            <img alt="ROR logo" className="vertical-middle" src="https://raw.githubusercontent.com/ror-community/ror-logos/main/ror-icon-rgb.svg" height="16" />
                                            {
                                              removeList.includes(add.rorId) ? (
                                                <strike>{` https://ror.org/${add.rorId}`}</strike>
                                              ) : (
                                                  ` https://ror.org/${add.rorId}`
                                              )
                                            }
                                          </a>
                                        </td>
                                        <td>
                                          <img
                                            alt={`${add.country} flag`}
                                            src={`https://flagsapi.com/${add.country}/flat/16.png`}
                                          />
                                          <span
                                            className="fr-ml-1w"
                                          >
                                            {
                                              removeList.includes(add.rorId) ? (
                                                <strike>{add.names[0]}</strike>
                                              ) : (
                                                add.names[0]
                                              )
                                            }
                                          </span>
                                        </td>
                                        <td>{add?.countAffiliations}</td>
                                        <td style={{ minWidth: '160px' }}>
                                          {
                                            removeList.includes(add.rorId) ? (
                                              <>
                                                <Button
                                                  aria-label="Undo remove"
                                                  color="blue-ecume"
                                                  icon="arrow-go-back-line"
                                                  onClick={() => setRemoveList((prevList) => prevList.filter((item) => item !== add.rorId))}
                                                  size="sm"
                                                />
                                                <Badge color="pink-tuile" className="fr-mr-1w">
                                                  Removed
                                                </Badge>
                                              </>
                                            ) : (
                                              <Button
                                                aria-label="Remove ROR"
                                                color="pink-tuile"
                                                disabled={removeList.includes(add.rorId)}
                                                icon="delete-line"
                                                onClick={() => setRemoveList((prevList) => [...prevList, add.rorId])}
                                                size="sm"
                                              />
                                            )
                                          }
                                          <Button onClick={() => setAddList((prevList) => [...prevList, add.rorId])}>Apply to all</Button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Col>
                    </Row>
                    <Row verticalAlign="bottom">
                      <Col>
                        <TextInput
                          messageType={rorMessageType}
                          message={rorMessage}
                          onChange={(e) => setRor(e.target.value)}
                        />
                      </Col>
                      <Col md="2">
                        <Button
                          color="blue-ecume"
                          disabled={['', 'error'].includes(rorMessageType)}
                          onClick={async () => {
                            const rorData = await getRorData(ror);
                            setAddList([...addList, ...rorData]);
                            setRor('');
                          }}
                        >
                          + Add
                        </Button>
                      </Col>
                    </Row>
                  </ModalContent>
                  <ModalFooter>
                    Once you have made your changes (add or remove ROR id), you can apply the changes using the "Apply corrections" button,
                    continue with your corrections and submit them to openAlex using the "Send feedback to OpenAlex" button.
                    <Button
                      color="blue-ecume"
                      disabled={removeList.length === 0 && addList.length === 0}
                      onClick={() => {
                        applyActions();
                        setIsModalOpen((prev) => !prev);
                      }}
                      title="Close"
                    >
                      Apply corrections
                    </Button>
                  </ModalFooter>
                </Modal>
                <div className="wm-external-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="left-content">
                    <span className="wm-text fr-mb-3w fr-ml-1w">
                      <Badge color="brown-opera">{selectedOpenAlex.length}</Badge>
                      <i>
                        {` selected affiliation${selectedOpenAlex.length === 1 ? '' : 's'}`}
                      </i>
                    </span>
                    <Button
                      className="fr-ml-5w fr-mr-1w"
                      color="blue-ecume"
                      disabled={!selectedOpenAlex.length}
                      icon="add-circle-line"
                      key="add-ror"
                      onClick={() => setIsModalOpen((prev) => !prev)}
                      size="sm"
                      title="Modify selected ROR"
                    >
                      Modify selected ROR
                    </Button>
                  </div>
                  <div className="right-content fr-mr-1w">
                    <ExportErrorsButton
                      allOpenalexCorrections={allOpenalexCorrections}
                      options={body}
                    />
                    <SendFeedbackButton
                      allOpenalexCorrections={allOpenalexCorrections}
                    />
                  </div>
                </div>
                <ViewsSelector
                  allAffiliations={filteredAffiliations}
                  filteredAffiliationName={filteredAffiliationName}
                  selectedOpenAlex={selectedOpenAlex}
                  setAllOpenalexCorrections={setAllOpenalexCorrections}
                  setFilteredAffiliationName={setFilteredAffiliationName}
                  setSelectedOpenAlex={setSelectedOpenAlex}
                  undo={undo}
                />
              </div>
            </Col>
          </Row>
        )}
      </Container>
    </>
  );
}
