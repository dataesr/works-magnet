import {
  Breadcrumb,
  Button,
  Col,
  Container,
  Link,
  Modal,
  ModalContent,
  ModalTitle,
  Notice,
  Row,
  Spinner,
  Tag,
  Text,
  TextInput,
  Title,
} from '@dataesr/dsfr-plus';
import { useQuery } from '@tanstack/react-query';
import introJs from 'intro.js';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import useToast from '../../../hooks/useToast';
import Header from '../../../layout/header';
import getFlagEmoji from '../../../utils/flags';
import { getRorData, isRor } from '../../../utils/ror';
import { normalize, removeDiacritics } from '../../../utils/strings';
import { getTagColor } from '../../../utils/tags';
import { getOpenAlexAffiliations } from '../../../utils/works';
import ExportErrorsButton from '../components/export-errors-button';
import SendFeedbackButton from '../components/send-feedback-button';
import ListView from './list-view';

import 'intro.js/introjs.css';
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import '../../../styles/index.scss';

const { VITE_APP_DEFAULT_YEAR, VITE_APP_TAG_LIMIT } = import.meta.env;

export default function Affiliations() {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const [addList] = useState([]); // TODO: still used ?
  const [affiliations, setAffiliations] = useState([]);
  const [cleanRor, setCleanRor] = useState('');
  const [filteredAffiliationName, setFilteredAffiliationName] = useState('');
  const [filteredAffiliations, setFilteredAffiliations] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRor, setIsLoadingRor] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [notices, setNotices] = useState([]);
  const [options, setOptions] = useState({});
  const [ror, setRor] = useState('');
  const [rorMessage, setRorMessage] = useState('');
  const [rorMessageType, setRorMessageType] = useState('');
  const [rorsToRemove, setRorsToRemove] = useState([]);
  const [uniqueRors, setUniqueRors] = useState({});

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

  const addRor = () => {
    const updatedAffiliations = affiliations.map((affiliation) => {
      if (affiliation.selected
        && !affiliation.addList.some((item) => item.rorId === cleanRor.rorId)
        && !affiliation.rors.some((item) => item.rorId === cleanRor.rorId)
      ) {
        return {
          ...affiliation,
          addList: [...affiliation.addList, cleanRor],
        };
      }
      return affiliation;
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
      if (affiliationIds.length === 1) {
        if (affiliationIds[0] === affiliation.id) {
          return { ...affiliation, selected: !affiliation.selected };
        }
        return affiliation;
      } // check/uncheck all
      if (affiliationIds.length > 1 && affiliationIds.includes(affiliation.id)) {
        return { ...affiliation, selected: true };
      }
      return { ...affiliation, selected: false };
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

  const { data, error, isFetched, isFetching, refetch } = useQuery({
    queryKey: ['openalex-affiliations', JSON.stringify(options)],
    // Search for works from affiliations for each affiliation strictly longer than 2 letters
    queryFn: () => {
      const affiliationStrings = options.affiliations
        .filter((affiliation) => !affiliation.isDisabled)
        .map((affiliation) => {
          const childernLabels = affiliation.children.filter((child) => !child.isDisabled).map((child) => normalize(child.label));
          return [normalize(affiliation.label), ...childernLabels];
        }).flat();
      const deletedAffiliations = options.deletedAffiliations.map((deletedAffiliation) => normalize(deletedAffiliation));
      return getOpenAlexAffiliations(
        {
          ...options,
          affiliationStrings,
          deletedAffiliations,
          rors: options.affiliations
            .filter((affiliation) => affiliation.isRor)
            .map((affiliation) => affiliation.label),
        },
        toast,
      );
    },
    enabled: false,
  });

  const addNotice = (notice) => {
    setNotices([...notices, notice]);
  };

  const removeNotice = (index) => {
    if (index > -1) {
      setNotices(notices.filter((_, i) => (i !== index)));
    }
  };

  useEffect(() => {
    const getUniquesRors = async () => {
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

    getUniquesRors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addList]);

  useEffect(() => {
    const getData = async () => {
      const queryParams = {
        endYear: searchParams.get('endYear') ?? VITE_APP_DEFAULT_YEAR,
        excludedRors: searchParams.getAll('excludedRors') ?? [],
        getRorChildren: searchParams.get('getRorChildren') ?? '0',
        startYear: searchParams.get('startYear') ?? VITE_APP_DEFAULT_YEAR,
      };
      queryParams.rorExclusions = [];
      queryParams.deletedAffiliations = [];
      searchParams.getAll('deletedAffiliations').forEach((item) => {
        if (isRor(item)) {
          queryParams.rorExclusions.push(item);
        } else {
          queryParams.deletedAffiliations.push(item);
        }
      });
      queryParams.affiliations = await Promise.all(
        searchParams.getAll('affiliations').map(async (affiliation) => {
          const label = affiliation;
          const children = [];
          // Compute rorNames
          if (isRor(label)) {
            const rors = await getRorData(label, queryParams.getRorChildren === '1');
            rors
              .forEach((item) => {
                item.names.map((name) => name.value).forEach((name) => {
                  if (!queryParams.deletedAffiliations.includes(name)) {
                    children.push({
                      isDisabled: name.length < VITE_APP_TAG_LIMIT,
                      label: name,
                      source: 'ror',
                      type: 'affiliationString',
                    });
                  }
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
      setOptions(queryParams);
    };
    getData();
  }, [searchParams]);

  useEffect(() => {
    if (Object.keys(options).length > 0) refetch();
  }, [options, refetch]);

  useEffect(() => {
    setAffiliations(data?.affiliations?.map((affiliation) => ({
      ...affiliation,
      addList: [],
      removeList: [],
      selected: false,
    })) ?? []);
  }, [data]);

  useEffect(() => {
    setIsLoading(true);
    if (filteredAffiliationName !== '') {
      const regex = new RegExp(removeDiacritics(filteredAffiliationName));
      const filteredAffiliationsTmp = affiliations.filter(
        (affiliation) => regex.test(
          `${affiliation.key.replace('[ source: ', '').replace(' ]', '')} ${affiliation.rors.map((_ror) => _ror.rorId).join(' ')}`,
        ),
      );
      setFilteredAffiliations(filteredAffiliationsTmp);
    } else {
      setFilteredAffiliations(affiliations);
    }
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

  useEffect(() => {
    if (rorMessageType !== 'valid') {
      setCleanRor({});
    }
  }, [rorMessageType]);

  useEffect(() => {
    if (filteredAffiliations.length > 0) {
      introJs().setOptions({
        dontShowAgain: true,
        dontShowAgainCookie: 'introjs-dontShowAgain-results',
        showStepNumbers: true,
        steps: [
          {
            element: document.querySelector('.step-search-summary'),
            intro: 'Here is your search',
            title: 'Tutorial',
          },
          {
            element: document.querySelector('.step-search-go-back'),
            intro: 'Click here to modify your search',
            title: 'Tutorial',
          },
          {
            element: document.querySelector('.step-action-add-remove-ror'),
            intro: 'Click here to add or remove ROR from selected affiliations',
            title: 'Tutorial',
          },
          {
            element: document.querySelector('.step-action-export'),
            intro: 'Click here to export corrections, choose between CSV and JSONL format',
            title: 'Tutorial',
          },
          {
            element: document.querySelector('.step-action-feedback'),
            intro: 'Click here to send feedback to OpenAlex',
            title: 'Tutorial',
          },
          {
            element: document.querySelector('.step-affiliations-select'),
            intro: 'Select all affiliations',
            title: 'Tutorial',
          },
          {
            element: document.querySelector('.step-affiliations-search'),
            intro: 'Search through affiliations names',
            title: 'Tutorial',
          },
          {
            element: document.querySelector('.step-affiliations-sort'),
            intro: 'Open menu to filter affiliations by country and sort them',
            title: 'Tutorial',
          },
          {
            element: document.querySelector('.step-affiliations-colors'),
            intro: 'Explanation about the colors of ROR',
            title: 'Tutorial',
          },
          {
            element: document.querySelector('.step-affiliation-checkbox'),
            intro: 'Select affiliation one by one',
            title: 'Tutorial',
          },
          {
            element: document.querySelector('.step-affiliation-badge'),
            intro: '<ul><li>Colors are given to the most 5 frequent ROR</li><li>Click here to see the ROR matched</li><li><i className="fr-fi-filter-line fr-icon--sm" /> Filter on this ROR</li><li><i className="ri-file-copy-line" /> Copy ROR</li><li><i className="fr-fi-delete-line fr-icon--sm" /> Delete this ROR from this affiliation</li></ul>',
            title: 'Tutorial',
          },
        ],
      }).start();
      document.getElementById('introjs-dontShowAgain')?.click();
    }
  }, [filteredAffiliations]);

  return (
    <>
      <Header />
      <Modal isOpen={isModalOpen} hide={() => setIsModalOpen(!isModalOpen)}>
        <ModalTitle>
          New affiliation curation tool by OpenAlex
        </ModalTitle>
        <ModalContent>
          As announced on the OpenAlex
          {' '}
          <a href="https://blog.openalex.org/affiliation-curation-is-coming-to-openalex/" rel="noreferrer" target="_blank">blog post of February 19, 2026</a>
          ,
          an affiliation curation tool is now available. Therefore the curation feature of the Works-magnet is now deprecated.
          <br />
          All the curations previously submitted have been integrated by the OpenAlex team.
        </ModalContent>
      </Modal>
      {notices.map((notice, index) => (
        <Notice
          closeMode="controlled"
          className="fr-mb-2w"
          // eslint-disable-next-line react/no-array-index-key
          key={`notice-${index}`}
          onClose={() => { removeNotice(index); }}
          style={{ overflow: 'hidden', position: 'fixed', top: index * 56, width: '100%', zIndex: 1001 }}
          type={notice.type}
        >
          <span dangerouslySetInnerHTML={{ __html: notice.message }} />
        </Notice>
      ))}
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
            <Row>
              <Col md="8" offsetMd="2">
                <div className="fr-callout fr-callout--pink-tuile">
                  <Title as="h3" look="h6">
                    New affiliation curation tool by OpenAlex
                  </Title>
                  <p className="fr-callout__text fr-text--sm">
                    As announced on the OpenAlex
                    {' '}
                    <a href="https://blog.openalex.org/affiliation-curation-is-coming-to-openalex/" rel="noreferrer" target="_blank">blog post of February 19, 2026</a>
                    ,
                    an affiliation curation tool is now available. Therefore the curation feature of the Works-magnet is now deprecated.
                    <br />
                    All the curations previously submitted have been integrated by the OpenAlex team.
                  </p>
                </div>
              </Col>
            </Row>
            <Row>
              <Breadcrumb className="fr-pt-4w fr-mt-0 fr-mb-2w fr-ml-8w">
                <Link href="/">
                  Home
                </Link>
                <Link href="/openalex-affiliations">
                  Search raw affiliations and ROR in OpenAlex
                </Link>
                <Link current>
                  See results and make corrections
                </Link>
              </Breadcrumb>
            </Row>
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
                              as="button"
                              className={`fr-mr-1w fr-mt-1w ${affiliation.isDisabled ? 'scratched' : ''
                                }`}
                              color={getTagColor(affiliation)}
                              key={`openalex-affiliations-tag-${affiliation.label}`}
                            >
                              {affiliation.label}
                            </Tag>
                            {affiliation.children.map((child) => (
                              <Tag
                                as="button"
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
                          {options.excludedRors.map((excludedRor) => (
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
                        size="lg"
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
                                  hint='Enter a valid ROR id and "check" it with ROR API'
                                  label="ROR"
                                  message={rorMessage}
                                  messageType={rorMessageType}
                                  onChange={(e) => setRor(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && ror.length > 0) {
                                      getCleanRor();
                                    }
                                  }}
                                  value={ror}
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
                        size="lg"
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
                                          <button
                                            aria-label="Remove this ROR"
                                            className={`fr-icon fr-icon--md  ${_ror.removed ? 'fr-fi-arrow-go-back-line' : 'fr-fi-delete-line'}`}
                                            onClick={() => setRorsToRemove(rorsToRemove.map((_r) => (_r.rorId === _ror.rorId ? { ..._r, removed: !_r.removed } : _r)))}
                                            title="Remove this ROR"
                                            type="button"
                                          />
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
                                          <br />
                                          <span className="fr-icon-arrow-right-s-fill" aria-hidden="true" />
                                          <i>
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
                                          </i>
                                        </li>
                                      ))}
                                    </ul>
                                  )
                                }
                              </Col>
                            </Row>
                            <Row>
                              <Col>
                                <Button color="pink-tuile" disabled={rorsToRemove.filter((_ror) => _ror.removed).length === 0} onClick={removeRorMultiple}>
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
                        addNotice={addNotice}
                        className="step-action-feedback"
                        corrections={affiliations.filter((affiliation) => affiliation.addList.length > 0 || affiliation.removeList.length > 0)}
                        options={options}
                        resetCorrections={resetCorrections}
                      />
                    </div>
                  </div>
                  <ListView
                    affiliationsCount={affiliations.length}
                    filteredAffiliations={filteredAffiliations}
                    removeRorFromAddList={removeRorFromAddList}
                    setFilteredAffiliationName={setFilteredAffiliationName}
                    setSelectAffiliations={setSelectAffiliations}
                    toggleRemovedRor={toggleRemovedRor}
                  />
                </div>
              </Col>
            </Row>
          </>
        )}
      </Container>
    </>
  );
}
