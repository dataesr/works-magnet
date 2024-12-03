import {
  Button,
  Col,
  Container,
  Modal,
  ModalContent,
  Row,
  Select,
  SelectOption,
  TextInput,
} from '@dataesr/dsfr-plus';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import TagInput from '../../components/tag-input';
import Header from '../../layout/header';
import { cleanRor, getRorData, isRor } from '../../utils/ror';

const { VITE_APP_TAG_LIMIT } = import.meta.env;

const START_YEAR = 2010;
// Generate an array of objects with all years from START_YEAR
const years = [...Array(new Date().getFullYear() - START_YEAR + 1).keys()]
  .map((year) => (year + START_YEAR).toString())
  .map((year) => ({ label: year, value: year }));

export default function DatasetsSearch() {
  // State
  const [currentSearchParams, setCurrentSearchParams] = useState({});
  const [deletedAffiliations, setDeletedAffiliations] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [getRorChildren, setGetRorChildren] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [onInputAffiliationsHandler, setOnInputAffiliationsHandler] = useState(false);
  const [rorExclusions, setRorExclusions] = useState('');
  const [searchedAffiliations, setSearchedAffiliations] = useState([]);
  const [tags, setTags] = useState([]);

  // Hooks
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const { data, error, isFetching, refetch } = useQuery({
    queryKey: [
      'ror',
      deletedAffiliations.join(),
      searchedAffiliations.join(),
      getRorChildren,
    ],
    queryFn: () => {
      const queries = searchedAffiliations
        .filter((affiliation) => !deletedAffiliations.includes(affiliation))
        .map((affiliation) => getRorData(affiliation, getRorChildren));
      return Promise.all(queries);
    },
    enabled: false,
  });
  const [searchParams, setSearchParams] = useSearchParams();

  // Effects
  useEffect(() => {
    if (searchParams.size < 2) {
      // Set default params values
      const searchParamsTmp = {
        affiliations: searchParams.getAll('affiliations') ?? [],
        deletedAffiliations: searchParams.getAll('deletedAffiliations') ?? [],
        endYear: searchParams.get('endYear') ?? '2023',
        startYear: searchParams.get('startYear') ?? '2023',
      };
      setSearchParams(searchParamsTmp);
      setTags([]);
    } else {
      const affiliations = searchParams.getAll('affiliations') || [];
      const deletedAffiliations1 = searchParams.getAll('deletedAffiliations') || [];
      setCurrentSearchParams({
        affiliations,
        deletedAffiliations: deletedAffiliations1,
        endYear: searchParams.get('endYear', '2023'),
        startYear: searchParams.get('startYear', '2023'),
      });
      const newSearchedAffiliations = affiliations.filter(
        (affiliation) => !searchedAffiliations.includes(affiliation),
      );
      if (newSearchedAffiliations.length > 0) {
        setSearchedAffiliations(affiliations);
      }
      const newDeletedAffiliations = deletedAffiliations1.filter(
        (affiliation) => !deletedAffiliations.includes(affiliation),
      )
        + deletedAffiliations.filter(
          (affiliation) => !deletedAffiliations1.includes(affiliation),
        );
      if (newDeletedAffiliations.length > 0) {
        setDeletedAffiliations(deletedAffiliations1);
      }
    }
  }, [
    deletedAffiliations,
    getRorChildren,
    searchedAffiliations,
    searchParams,
    setSearchParams,
  ]);

  useEffect(() => {
    refetch();
  }, [deletedAffiliations, refetch, searchedAffiliations]);

  useEffect(() => {
    if (data) {
      const rorNames = data.filter(
        (rorName) => !deletedAffiliations.includes(rorName),
      );
      const allTags = [];
      const knownTags = {};
      searchedAffiliations
        .filter((affiliation) => !deletedAffiliations.includes(affiliation))
        .forEach((affiliation) => {
          const label = cleanRor(affiliation);
          if (isRor(label)) {
            allTags.push({
              disable: label.length < VITE_APP_TAG_LIMIT,
              label,
              source: 'user',
              type: 'rorId',
            });
          } else {
            allTags.push({
              disable: affiliation.length < VITE_APP_TAG_LIMIT,
              label: affiliation,
              source: 'user',
              type: 'affiliationString',
            });
          }
          knownTags[label.toLowerCase()] = 1;
        });
      rorNames.flat().forEach((rorElt) => {
        if (knownTags[rorElt.rorId.toLowerCase()] === undefined) {
          if (!deletedAffiliations.includes(rorElt.rorId)) {
            allTags.push({
              disable: rorElt.rorId.length < VITE_APP_TAG_LIMIT,
              label: rorElt.rorId,
              source: 'ror',
              type: 'rorId',
            });
            knownTags[rorElt.rorId.toLowerCase()] = 1;
          }
        }
        rorElt.names.forEach((rorName) => {
          if (knownTags[rorName.toLowerCase()] === undefined) {
            if (!deletedAffiliations.includes(rorName)) {
              const isDangerous = rorName.length < 4;
              allTags.push({
                disable: rorName.length < VITE_APP_TAG_LIMIT,
                isDangerous,
                label: rorName,
                rorId: rorElt.rorId,
                source: 'ror',
                type: 'affiliationString',
              });
              knownTags[rorName.toLowerCase()] = 1;
            }
          }
        });
      });
      setTags(allTags);
    }
  }, [data, deletedAffiliations, searchedAffiliations]);

  const onTagsChange = async (_affiliations, _deletedAffiliations) => {
    const affiliations = _affiliations
      .filter((affiliation) => affiliation.source === 'user')
      .map((affiliation) => affiliation.label);
    const deletedAffiliations1 = [
      ...new Set(
        _deletedAffiliations
          .map((affiliation) => affiliation.label)
          .concat(currentSearchParams.deletedAffiliations || []),
      ),
    ].filter(
      (item) => !_affiliations.map((affiliation) => affiliation.label).includes(item),
    );
    setSearchParams({
      ...currentSearchParams,
      affiliations,
      deletedAffiliations: deletedAffiliations1,
    });
  };

  const checkAndSendQuery = () => {
    if (onInputAffiliationsHandler) {
      setMessageType('error');
      setMessage(
        "Don't forget to validate the Affiliations input by pressing the return key.",
      );
      return;
    }
    if (searchedAffiliations.length === 0) {
      setMessageType('error');
      setMessage('You must provide at least one affiliation.');
      return;
    }
    setMessageType('');
    setMessage('');
    const queryParams = search.length === 0 ? '?datasets=true' : `${search}&datasets=true`;
    navigate(`/${pathname.split('/')[1]}/results${queryParams}`);
  };

  const NB_TAGS_STICKY = 2;
  const tagsDisplayed = tags.slice(0, NB_TAGS_STICKY);

  if (tags.length > NB_TAGS_STICKY) {
    tagsDisplayed.push({ label: '...' });
  }

  return (
    <>
      <Header />
      <Modal isOpen={isOpen} hide={() => setIsOpen(false)} size="xl">
        <ModalContent>
          <Container as="section" className="filters fr-my-5w">
            <Row className="fr-p-2w">
              <Col xs="12" className="fr-pb-3w">
                <Row gutters verticalAlign="bottom">
                  <Col>
                    <Select
                      aria-label="Select a start year for search"
                      buttonLabel={currentSearchParams.startYear}
                      label="Start year"
                      onSelectionChange={(startYear) => setSearchParams({ ...currentSearchParams, startYear })}
                    >
                      {years.map((year) => (
                        <SelectOption
                          color="blue-cumulus"
                          key={year.value}
                          selected={
                            year.value === currentSearchParams.startYear
                          }
                        >
                          {year.label}
                        </SelectOption>
                      ))}
                    </Select>
                  </Col>
                  <Col>
                    <Select
                      aria-label="Select an end year for search"
                      buttonLabel={currentSearchParams.endYear}
                      label="End year"
                      onSelectionChange={(endYear) => setSearchParams({ ...currentSearchParams, endYear })}
                    >
                      {years.map((year) => (
                        <SelectOption
                          color="blue-cumulus"
                          key={year.value}
                          selected={
                            year.value === currentSearchParams.startYear
                          }
                        >
                          {year.label}
                        </SelectOption>
                      ))}
                    </Select>
                  </Col>
                </Row>
              </Col>
              <Col xs="12">
                <TagInput
                  deletedAffiliations={deletedAffiliations}
                  getRorChildren={getRorChildren}
                  hint="Press ENTER to search for several terms / expressions. If several, an OR operator is used."
                  isLoading={isFetching}
                  isRequired
                  label="Affiliation name, ROR of your institution"
                  message={message}
                  messageType={messageType}
                  onInputHandler={setOnInputAffiliationsHandler}
                  onTagsChange={onTagsChange}
                  seeMoreAfter={0}
                  setGetRorChildren={setGetRorChildren}
                  tags={tags}
                />
              </Col>
              <Col xs="12">
                <TextInput
                  hint="You can focus on recall issues in OpenAlex (missing ROR). This way, only affiliation strings that are NOT matched in OpenAlex to this specific ROR will be retrieved. If several ROR to exclude, separate them by space."
                  label="ROR to exclude: exclude affiliation strings already mapped to a specific ROR in OpenAlex"
                  onChange={(e) => setRorExclusions(e.target.value)}
                  value={rorExclusions}
                />
              </Col>
              <Col xs="12">
                <Button
                  className="fr-mt-2w"
                  disabled={searchParams.getAll('affiliations').length === 0}
                  icon="search-line"
                  onClick={checkAndSendQuery}
                >
                  Search works
                </Button>
              </Col>
            </Row>
          </Container>
        </ModalContent>
      </Modal>

      {error && (
        <Row gutters className="fr-mb-16w">
          <Col xs="12">
            <div>
              Error while fetching data, please try again later or contact the
              team (see footer).
            </div>
          </Col>
        </Row>
      )}

      <Container as="section" className="filters fr-my-5w">
        <Row className="fr-pt-2w fr-pr-2w fr-pb-0 fr-pl-2w">
          <Col xs="8">
            <TagInput
              deletedAffiliations={deletedAffiliations}
              getRorChildren={getRorChildren}
              hint="Press ENTER to search for several terms / expressions. If several, an OR operator is used."
              isLoading={isFetching}
              isRequired
              label="Affiliation name, ROR of your institution"
              message={message}
              messageType={messageType}
              onInputHandler={setOnInputAffiliationsHandler}
              onTagsChange={onTagsChange}
              seeMoreAction={(e) => {
                setIsOpen(true);
                e.preventDefault();
              }}
              setGetRorChildren={setGetRorChildren}
              tags={tags}
            />
          </Col>
          <Col offsetXs="1" className="text-right fr-pl-3w">
            <Row gutters verticalAlign="bottom">
              <Col>
                <Select
                  aria-label="Select a start year for search"
                  buttonLabel={currentSearchParams.startYear}
                  label="Start year"
                  onSelectionChange={(startYear) => setSearchParams({ ...currentSearchParams, startYear })}
                >
                  {years.map((year) => (
                    <SelectOption
                      color="blue-cumulus"
                      key={year.value}
                      selected={year.value === currentSearchParams.startYear}
                    >
                      {year.label}
                    </SelectOption>
                  ))}
                </Select>
              </Col>
              <Col>
                <Select
                  aria-label="Select an end year for search"
                  buttonLabel={currentSearchParams.endYear}
                  label="End year"
                  onSelectionChange={(endYear) => setSearchParams({ ...currentSearchParams, endYear })}
                >
                  {years.map((year) => (
                    <SelectOption
                      color="blue-cumulus"
                      key={year.value}
                      selected={year.value === currentSearchParams.startYear}
                    >
                      {year.label}
                    </SelectOption>
                  ))}
                </Select>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className="fr-pt-0 fr-pr-2w fr-pb-2w fr-pl-2w">
          <Col xs="8">
            <TextInput
              hint="You can focus on recall issues in OpenAlex (missing ROR). This way, only affiliation strings that are NOT matched in OpenAlex to this specific ROR will be retrieved. If several ROR to exclude, separate them by space."
              label="ROR to exclude: exclude affiliation strings already mapped to a specific ROR in OpenAlex"
              onChange={(e) => setRorExclusions(e.target.value)}
              value={rorExclusions}
            />
          </Col>
          <Col offsetXs="1" className="text-right fr-pl-3w">
            <Button
              className="fr-mt-2w"
              disabled={searchParams.getAll('affiliations').length === 0}
              icon="search-line"
              onClick={checkAndSendQuery}
            >
              Search works
            </Button>
          </Col>
        </Row>
      </Container>
    </>
  );
}
