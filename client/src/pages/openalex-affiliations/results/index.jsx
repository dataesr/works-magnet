import {
  Button,
  Col,
  Container,
  Link,
  Modal,
  ModalContent,
  ModalTitle,
  Row,
  Spinner,
  Tag,
  Text,
  TextInput,
} from '@dataesr/dsfr-plus';
import { useQuery } from '@tanstack/react-query';
import { Steps } from 'intro.js-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import useToast from '../../../hooks/useToast';
import Header from '../../../layout/header';
import getFlagEmoji from '../../../utils/flags';
import { getRorData, isRor } from '../../../utils/ror';
import { normalize, removeDiacritics } from '../../../utils/strings';
import { getTagColor } from '../../../utils/tags';
import { getWorks } from '../../../utils/works';
import ExportErrorsButton from '../components/export-errors-button';
import SendFeedbackButton from '../components/send-feedback-button';
import ListView from './list-view';

import 'intro.js/introjs.css';
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';

const { VITE_APP_TAG_LIMIT } = import.meta.env;

export default function Affiliations() {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const [addList, setAddList] = useState([]); // TODO: still used ?
  const [affiliations, setAffiliations] = useState([]);
  const [cleanRor, setCleanRor] = useState('');
  const [filteredAffiliationName, setFilteredAffiliationName] = useState('');
  const [filteredAffiliations, setFilteredAffiliations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRor, setIsLoadingRor] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [options, setOptions] = useState({});
  const [ror, setRor] = useState('');
  const [rorMessage, setRorMessage] = useState('');
  const [rorMessageType, setRorMessageType] = useState('');
  const [rorsToRemove, setRorsToRemove] = useState([]);
  const [stepsEnabled, setStepsEnabled] = useState(false);
  const [stepsEnabledList, setStepsEnabledList] = useState(false);
  const [uniqueRors, setUniqueRors] = useState({});

  const steps = [
    {
      element: '.step-search-summary',
      intro: 'Here is your search',
    },
    {
      element: '.step-search-go-back',
      intro: 'Click here to modify your search',
    },
    {
      element: '.step-action-add-remove-ror',
      intro: 'Click here to add or remove ROR from selected affiliations',
    },
    {
      element: '.step-action-export',
      intro: 'Click here to export corrections, choose between CSV and JSONL format',
    },
    {
      element: '.step-action-feedback',
      intro: 'Click here to send feedback to OpenAlex',
    },
  ];

  const { data, error, isFetched, isFetching, refetch } = useQuery({
    queryKey: ['works', JSON.stringify(options)],
    // Search for works from affiliations for each affiliation strictly longer than 2 letters
    queryFn: () => getWorks(
      {
        ...options,
        affiliationStrings: options.affiliations
          .filter((affiliation) => !affiliation.isDisabled)
          .map((affiliation) => affiliation.label),
        rors: options.affiliations
          .filter((affiliation) => affiliation.isRor)
          .map((affiliation) => affiliation.label),
      },
      toast,
    ),
    enabled: false,
  });

  useEffect(() => {
    // Enable guided tour only for the first visit
    if (localStorage.getItem('works-magnet-tour-results') !== 'done') setStepsEnabled(true);
  }, [setStepsEnabled]);

  useEffect(() => {
    const get = async () => {
      const addedRors = await Promise.all(
        addList.map((add) => getRorData(add)),
      );
      const uniqueRorsTmp = {};
      addedRors.flat().forEach((addedRor) => {
        if (!Object.keys(uniqueRors).includes(addedRor.rorId)) {
          uniqueRorsTmp[addedRor.rorId] = { ...addedRor };
        }
      });
      setUniqueRors({ ...uniqueRors, ...uniqueRorsTmp });
    };

    get();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addList]);

  useEffect(() => {
    const getData = async () => {
      const queryParams = {
        endYear: searchParams.get('endYear') ?? '2023',
        excludedRors: searchParams.get('excludedRors') ?? '',
        getRorChildren: searchParams.get('getRorChildren') ?? '0',
        startYear: searchParams.get('startYear') ?? '2023',
      };
      queryParams.deletedAffiliations = [];
      queryParams.rorExclusions = [];
      queryParams.affiliations = await Promise.all(
        searchParams.getAll('affiliations').map(async (affiliation) => {
          const label = normalize(affiliation);
          const children = [];
          // Compute rorNames
          if (isRor(label)) {
            const rors = await getRorData(label, queryParams.getRorChildren === '1');
            rors
              .forEach((item) => {
                children.push({
                  isDisabled: false,
                  label: item.rorId,
                  source: 'ror',
                  type: 'rorId',
                });
                item.names.forEach((name) => {
                  children.push({
                    isDisabled: name.length < VITE_APP_TAG_LIMIT,
                    label: name,
                    source: 'ror',
                    type: 'affiliationString',
                  });
                });
              });
          }
          return {
            children,
            isDisabled: label.length < VITE_APP_TAG_LIMIT,
            isRor: isRor(label),
            label,
            source: 'user',
          };
        }),
      );

      searchParams.getAll('deletedAffiliations').forEach((item) => {
        if (isRor(item)) {
          queryParams.rorExclusions.push(item);
        } else {
          queryParams.deletedAffiliations.push(normalize(item));
        }
      });
      setOptions(queryParams);
    };
    getData();
  }, [searchParams]);

  useEffect(() => {
    if (Object.keys(options).length > 0) refetch();
  }, [options, refetch]);

  useEffect(() => {
    setAffiliations(data?.affiliations?.filter(
      (affiliation) => affiliation.source === 'OpenAlex',
    ).map((affiliation) => ({
      ...affiliation,
      addList: [],
      removeList: [],
      selected: false,
    })) ?? []);
  }, [data]);

  useEffect(() => {
    setIsLoading(true);
    const regex = new RegExp(removeDiacritics(filteredAffiliationName));
    const filteredAffiliationsTmp = affiliations.filter(
      (affiliation) => regex.test(
        `${affiliation.key.replace('[ source: ', '').replace(' ]', '')} ${affiliation.rors.map((_ror) => _ror.rorId).join(' ')}`,
      ),
    );
    setFilteredAffiliations(filteredAffiliationsTmp);
    setIsLoading(false);
  }, [affiliations, filteredAffiliationName]);

  useEffect(() => {
    if (ror === '') {
      setRorMessage('');
      setRorMessageType('');
    } else if (!isRor(ror)) {
      setRorMessage('Invalid ROR');
      setRorMessageType('error');
    } else if (Object.keys(uniqueRors).includes(ror)) {
      setRorMessage('Already listed ROR');
      setRorMessageType('error');
    } else {
      setRorMessage('Valid ROR');
      setRorMessageType('valid');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ror]);

  const toggleRemovedRor = (affiliationId, rorId) => {
    const updatedAffiliations = affiliations.map((affiliation) => {
      if (affiliation.id === affiliationId) {
        return {
          ...affiliation,
          removeList: affiliation.removeList.includes(rorId)
            ? affiliation.removeList.filter((item) => item !== rorId)
            : [...affiliation.removeList, rorId],
        };
      }
      return affiliation;
    });
    setAffiliations(updatedAffiliations);
  };

  const removeRorMultiple = () => {
    const selectedRorIds = rorsToRemove.filter((_ror) => _ror.removed).map((_ror) => _ror.rorId);
    const affiliationsTmp = affiliations.map((affiliation) => {
      if (affiliation.selected) {
        return {
          ...affiliation,
          addList: affiliation.addList.filter((item) => !selectedRorIds.includes(item.rorId)),
          removeList: [...new Set([...affiliation.removeList, ...selectedRorIds])].filter((item) => affiliation.rors.map((_ror) => _ror.rorId).includes(item)),
          selected: false,
        };
      }
      return affiliation;
    });
    setAffiliations(affiliationsTmp);
    setRorsToRemove([]);
    setIsRemoveModalOpen(false);
  };

  const removeRorFromAddList = (affiliationId, rorId) => {
    const updatedAffiliations = affiliations.map((affiliation) => {
      if (affiliation.id === affiliationId) {
        if (affiliation.addList.find((item) => item.rorId === rorId)) {
          return { ...affiliation, addList: affiliation.addList.filter((item) => item.rorId !== rorId) };
        }
      }
      return affiliation;
    });

    setAffiliations(updatedAffiliations);
  };

  useEffect(() => {
    if (rorMessageType !== 'valid') {
      setCleanRor({});
    }
  }, [rorMessageType]);

  const addRor = () => {
    const updatedAffiliations = affiliations.map((affiliation) => {
      if (affiliation.selected
        && !affiliation.addList.some((item) => item.rorId === cleanRor.rorId)
        && !affiliation.rors.some((item) => item.rorId === cleanRor.rorId)
      ) {
        return {
          ...affiliation,
          addList: [...affiliation.addList, cleanRor],
          selected: false,
        };
      }
      return {
        ...affiliation,
        selected: false,
      };
    });
    setAffiliations(updatedAffiliations);
    setRor('');
    setCleanRor({});
    setIsAddModalOpen(false);
  };

  const getCleanRor = async () => {
    setIsLoadingRor(true);
    const cleanRorData = await getRorData(ror);
    setCleanRor(cleanRorData[0]);
    setIsLoadingRor(false);
  };

  const setSelectAffiliations = (affiliationIds) => {
    const updatedAffiliations = affiliations.map((affiliation) => {
      if (affiliationIds.includes(affiliation.id)) {
        return { ...affiliation, selected: !affiliation.selected };
      }
      return affiliation;
    });
    setAffiliations(updatedAffiliations);
  };

  const getUniqueRors = () => {
    const selectedRors = {};
    const selectedAffiliations = filteredAffiliations.filter((affiliation) => affiliation.selected);

    // initial RORs
    selectedAffiliations.forEach((affiliation) => {
      affiliation.rors.forEach((_ror) => {
        if (affiliation.removeList.includes(_ror.rorId)) return;
        if (!selectedRors[_ror.rorId]) {
          selectedRors[_ror.rorId] = { ..._ror, count: 0 };
        }
        selectedRors[_ror.rorId].count += 1;
      });
    });

    // added RORs
    selectedAffiliations.forEach((affiliation) => {
      affiliation.addList.forEach((_ror) => {
        if (!selectedRors[_ror.rorId]) {
          selectedRors[_ror.rorId] = { ..._ror, count: 0 };
        }
        selectedRors[_ror.rorId].count += 1;
      });
    });

    const rorArray = Object.keys(selectedRors).map((rorId) => ({
      rorId,
      rorName: selectedRors[rorId].rorName,
      rorCountry: selectedRors[rorId].rorCountry,
      count: selectedRors[rorId].count,
      removed: false,
    }));
    return rorArray;
  };

  const resetCorrections = () => {
    const affiliationsTmp = affiliations.map((affiliation) => ({
      ...affiliation,
      addList: [],
      removeList: [],
      rorToCorrect: affiliation.rors,
    }));
    setAffiliations(affiliationsTmp);
  };

  return (
    <>
      <Header />
      <Container fluid as="main" className="wm-bg">
        {(isFetching || isLoading) && (
          <Container
            style={{ textAlign: 'center', minHeight: '600px' }}
            className="fr-pt-5w wm-font"
          >
            <div className="fr-mb-5w wm-message fr-pt-10w">
              Loading data from OpenAlex, please wait...
              <br />
              <br />
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/OpenAlex_logo_2021.svg/320px-OpenAlex_logo_2021.svg.png"
                alt="OpenAlex"
              />
              <br />
              <span className="loader fr-my-5w">Loading</span>
            </div>
          </Container>
        )}

        {isLoading && (
          <Spinner size={48} />
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
          <>
            <Steps
              enabled={stepsEnabled}
              initialStep={0}
              onExit={() => {
                setStepsEnabled(false);
                setStepsEnabledList(true);
              }}
              steps={steps}
            />
            <Row>
              <Col
                className="wm-menu"
                md={2}
              >
                <div
                  style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1000,
                  }}
                >
                  <Row className="step-search-go-back">
                    <Button
                      aria-label="Back to search page"
                      className="fr-mt-1w"
                      color="blue-ecume"
                      icon="arrow-left-line"
                      onClick={() => navigate(`/${pathname.split('/')[1]}/search${search}`)}
                      size="sm"
                      title="Back to search page"
                    >
                      Back to search page
                    </Button>
                  </Row>
                  <Row className="step-search-summary">
                    <Col xs="12">
                      <div className="wm-title">
                        <span
                          className="fr-icon-calendar-line fr-mr-1w"
                          aria-hidden="true"
                        />
                        Selected years
                      </div>
                      <div className="wm-content">
                        <Tag
                          className="fr-mr-1w"
                          color="blue-cumulus"
                          key="openalex-affiliations-tag-year-start"
                        >
                          {`Start: ${options.startYear}`}
                        </Tag>
                        <Tag color="blue-cumulus" key="openalex-affiliations-tag-year-end">
                          {`End: ${options.endYear}`}
                        </Tag>
                      </div>
                    </Col>
                    <Col xs="12">
                      <div className="wm-title">
                        <span
                          className="fr-icon-hotel-line fr-mr-1w"
                          aria-hidden="true"
                        />
                        Searched affiliations
                      </div>
                      <div className="wm-content">
                        {options.affiliations.map((affiliation) => (
                          <Row key={`openalex-affiliations-search-${affiliation.label}`}>
                            <Tag
                              className={`fr-mr-1w ${affiliation.isDisabled ? 'scratched' : ''
                                }`}
                              color={getTagColor(affiliation)}
                              key={`openalex-affiliations-tag-${affiliation.label}`}
                            >
                              {affiliation.label}
                            </Tag>
                            {affiliation.children.map((child) => (
                              <Tag
                                className={`fr-mr-1w fr-mt-1w ${child.isDisabled ? 'scratched' : ''
                                  }`}
                                color={getTagColor(child)}
                                key={`openalex-affiliations-tag-${child.label}`}
                              >
                                {child.label}
                              </Tag>
                            ))}
                          </Row>
                        ))}
                      </div>
                    </Col>
                  </Row>
                  {(options.excludedRors.length > 0) && (
                    <Row>
                      <Col>
                        <div className="wm-title">
                          <span>
                            <i className="ri-forbid-2-line fr-mr-1w" />
                            Excluded RORs
                          </span>
                        </div>
                        <div className="wm-content">
                          {options.excludedRors.split(' ').map((excludedRor) => (
                            <Tag
                              className="fr-mr-1w"
                              color="green-archipel"
                              key="openalex-affiliations-rors-excluded"
                            >
                              {excludedRor}
                            </Tag>
                          ))}
                        </div>
                      </Col>
                    </Row>
                  )}
                </div>
              </Col>
              <Col md={10}>
                <div
                  className="wm-bg wm-content"
                  style={{ overflow: 'unset' }}
                >
                  <div
                    className="wm-external-actions"
                    style={{
                      alignItems: 'center',
                      display: 'flex',
                      justifyContent: 'space-between',
                      position: 'sticky',
                      top: 0,
                      zIndex: 1000,
                    }}
                  >
                    <div className="left-content step-action-add-remove-ror">
                      <Button
                        aria-label="Add ROR to selected affiliations"
                        className="fr-mx-1w"
                        color="blue-ecume"
                        disabled={filteredAffiliations.filter((affiliation) => affiliation.selected).length === 0}
                        icon="add-circle-line"
                        onClick={() => setIsAddModalOpen((prev) => !prev)}
                        size="sm"
                        title="Add ROR to selected affiliations"
                      >
                        Add ROR to selected affiliations
                      </Button>
                      <Modal
                        isOpen={isAddModalOpen}
                        hide={() => setIsAddModalOpen((prev) => !prev)}
                      >
                        <ModalTitle>
                          Add ROR to &nbsp;
                          {filteredAffiliations.filter((affiliation) => affiliation.selected).length}
                          &nbsp;
                          {`OpenAlex selected affiliation${filteredAffiliations.filter((affiliation) => affiliation.selected).length > 1 ? 's' : ''}`}
                        </ModalTitle>
                        <ModalContent>
                          <Container fluid>
                            <Row>
                              <Col className="text-right">
                                <Link href="https://ror.org/" target="_blank">
                                  ROR website
                                </Link>
                              </Col>
                            </Row>
                            <Row verticalAlign="bottom">
                              <Col>
                                <TextInput
                                  messageType={rorMessageType}
                                  message={rorMessage}
                                  onChange={(e) => setRor(e.target.value)}
                                  value={ror}
                                  label="ROR"
                                  hint='Enter a valid ROR id and "check" it with ROR API'
                                />
                              </Col>
                              <Col md="3">
                                <Button
                                  aria-label="Check ROR"
                                  color="blue-ecume"
                                  disabled={['', 'error'].includes(rorMessageType)}
                                  onClick={() => getCleanRor()}
                                  size="sm"
                                  variant="secondary"
                                >
                                  Check it
                                </Button>
                              </Col>
                            </Row>
                            <Row>
                              <Col>
                                {isLoadingRor ? (<Spinner size={48} />) : (
                                  rorMessageType === 'valid' && cleanRor.rorName && cleanRor.rorCountry
                                  && (
                                    <>
                                      <div>
                                        <span className="fr-icon-arrow-right-s-fill" aria-hidden="true" />
                                        <span className="fr-mx-1w">
                                          {cleanRor.rorName}
                                        </span>
                                        {getFlagEmoji(cleanRor.rorCountry)}
                                      </div>
                                      <Button
                                        aria-label="Add ROR"
                                        className="fr-mt-3w"
                                        color="blue-ecume"
                                        disabled={['', 'error'].includes(rorMessageType) || !cleanRor.rorName || !cleanRor.rorCountry}
                                        onClick={() => addRor()}
                                        size="sm"
                                        title="Add ROR"
                                      >
                                        Add this ROR to selected affiliations
                                      </Button>
                                    </>
                                  )
                                )}
                              </Col>
                            </Row>
                          </Container>
                        </ModalContent>
                      </Modal>
                      <Button
                        aria-label="Remove ROR from selected affiliations"
                        color="pink-tuile"
                        disabled={filteredAffiliations.filter((affiliation) => affiliation.selected).length === 0}
                        icon="delete-line"
                        onClick={() => { setRorsToRemove(getUniqueRors()); setIsRemoveModalOpen(true); }}
                        size="sm"
                        title="Remove ROR from selected affiliations"
                      >
                        Remove ROR from selected affiliations
                      </Button>
                      <Modal
                        isOpen={isRemoveModalOpen}
                        hide={() => setIsRemoveModalOpen((prev) => !prev)}
                      >
                        <ModalTitle>
                          Remove ROR to
                          {' '}
                          {filteredAffiliations.filter((affiliation) => affiliation.selected).length}
                          {` selected affiliation${filteredAffiliations.filter((affiliation) => affiliation.selected).length > 1 ? 's' : ''}`}
                        </ModalTitle>
                        <ModalContent>
                          <Container fluid>
                            <Row>
                              <Col className="text-right">
                                <Link href="https://ror.org/" target="_blank">
                                  ROR website
                                </Link>
                              </Col>
                            </Row>
                            <Row verticalAlign="bottom">
                              <Col>
                                {
                                  rorsToRemove && rorsToRemove.length > 0 && (
                                    <ul>
                                      {rorsToRemove.map((_ror) => (
                                        <li key={`openalex-affiliations-remove-${_ror.rorId}`} style={{ listStyle: 'none', marginBottom: '16px' }}>
                                          <img
                                            alt="ROR logo"
                                            className="vertical-middle fr-mx-1w"
                                            height="16"
                                            src="https://raw.githubusercontent.com/ror-community/ror-logos/main/ror-icon-rgb.svg"
                                          />
                                          {
                                            _ror.removed ? (
                                              <strike>
                                                <Link href={`https://ror.org/${_ror.rorId}`} target="_blank" style={{ fontFamily: 'monospace' }}>
                                                  {`https://ror.org/${_ror.rorId}`}
                                                </Link>
                                              </strike>
                                            ) : (
                                              <Link href={`https://ror.org/${_ror.rorId}`} target="_blank" style={{ fontFamily: 'monospace' }}>
                                                {`https://ror.org/${_ror.rorId}`}
                                              </Link>
                                            )
                                          }
                                          <button
                                            aria-label="Remove this ROR"
                                            className={`fr-icon fr-icon--sm  ${_ror.removed ? 'fr-fi-arrow-go-back-line' : 'fr-fi-delete-line'}`}
                                            onClick={() => setRorsToRemove(rorsToRemove.map((_r) => (_r.rorId === _ror.rorId ? { ..._r, removed: !_r.removed } : _r)))}
                                            title="Remove this ROR"
                                            type="button"
                                          />
                                          <br />
                                          {
                                            _ror.removed ? (
                                              <strike>
                                                <span className="fr-mx-1w">
                                                  {_ror.rorName}
                                                </span>
                                                <span className="fr-ml-1w">
                                                  {getFlagEmoji(_ror.rorCountry)}
                                                </span>
                                              </strike>
                                            ) : (
                                              <>
                                                <span className="fr-mx-1w">
                                                  {_ror.rorName}
                                                </span>
                                                <span className="fr-ml-1w">
                                                  {getFlagEmoji(_ror.rorCountry)}
                                                </span>
                                              </>
                                            )
                                          }
                                        </li>
                                      ))}
                                    </ul>
                                  )
                                }
                              </Col>
                            </Row>
                            <Row>
                              <Col>
                                <Button color="pink-tuile" onClick={removeRorMultiple}>
                                  Apply to selected affiliations
                                </Button>
                              </Col>
                            </Row>
                          </Container>
                        </ModalContent>
                      </Modal>
                    </div>
                    <div className="fr-mr-1w right-content">
                      <ExportErrorsButton
                        className="step-action-export"
                        corrections={affiliations.filter((affiliation) => affiliation.addList.length > 0 || affiliation.removeList.length > 0)}
                      />
                      <SendFeedbackButton
                        className="step-action-feedback"
                        corrections={affiliations.filter((affiliation) => affiliation.addList.length > 0 || affiliation.removeList.length > 0)}
                        resetCorrections={resetCorrections}
                      />
                    </div>
                  </div>
                  {filteredAffiliations.length === 0 ? (
                    <Spinner size={48} /> // TODO replace spinner by skeleton
                  ) : (
                    <ListView
                      affiliationsCount={affiliations.length}
                      filteredAffiliations={filteredAffiliations}
                      removeRorFromAddList={removeRorFromAddList}
                      setFilteredAffiliationName={setFilteredAffiliationName}
                      setSelectAffiliations={setSelectAffiliations}
                      setStepsEnabledList={setStepsEnabledList}
                      stepsEnabledList={stepsEnabledList}
                      toggleRemovedRor={toggleRemovedRor}
                    />
                  )}
                </div>
              </Col>
            </Row>
          </>
        )}
      </Container>
    </>
  );
}
