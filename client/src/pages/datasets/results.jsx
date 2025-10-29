import { Col, Container, Row, Spinner } from '@dataesr/dsfr-plus';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { status } from '../../config';
import useToast from '../../hooks/useToast';
import Header from '../../layout/header';
import { getRorData, isRor } from '../../utils/ror';
import { normalize } from '../../utils/strings';
import { getWorks } from '../../utils/works';
import Datasets from '../views/datasets';

import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';

const { VITE_APP_DEFAULT_YEAR, VITE_APP_TAG_LIMIT } = import.meta.env;

export default function Affiliations() {
  const [searchParams] = useSearchParams();

  const [affiliations, setAffiliations] = useState([]);
  const [options, setOptions] = useState({});
  const [selectedAffiliations, setSelectedAffiliations] = useState([]);
  const [selectedDatasets, setSelectedDatasets] = useState([]);
  const { toast } = useToast();

  const { data, error, isFetched, isFetching, refetch } = useQuery({
    queryKey: ['datasets', JSON.stringify(options)],
    queryFn: () => getWorks({ options, toast, type: 'datasets' }),
    enabled: false,
  });

  const tagDatasets = (datasets, action) => {
    const datasetsIds = datasets.map((dataset) => dataset.id);
    data?.datasets?.results
      ?.filter((dataset) => datasetsIds.includes(dataset.id))
      .map((dataset) => (dataset.status = action));
    setSelectedDatasets([]);
  };

  const tagAffiliations = (_affiliations, action) => {
    if (_affiliations.length > 0) {
      // If no affiliationIds, it means it comes from a restored file so d o a match on affiliation key
      if (_affiliations?.[0]?.id === undefined) {
        const affiliationKeys = _affiliations.map((affiliation) => affiliation?.key).filter((key) => !!key);
        // eslint-disable-next-line no-param-reassign
        _affiliations = affiliations.filter((aff) => affiliationKeys.includes(aff.key));
      }
      if (action !== status.excluded.id) {
        const worksIds = _affiliations
          .map((affiliation) => affiliation.works)
          .flat();
        data?.datasets?.results
          ?.filter((dataset) => worksIds.includes(dataset.id))
          .map((dataset) => (dataset.status = action));
      }
      // Filter non existing ids
      const affiliationIds = _affiliations.map((affiliation) => affiliation.id).filter((id) => !!id);
      setAffiliations(
        affiliations
          .map((affiliation) => {
            if (affiliationIds.includes(affiliation.id)) {
              affiliation.status = action;
            }
            return affiliation;
          }),
      );
    }
    setSelectedAffiliations([]);
  };

  useEffect(() => {
    const getData = async () => {
      const queryParams = {
        endYear: searchParams.get('endYear') ?? VITE_APP_DEFAULT_YEAR,
        startYear: searchParams.get('startYear') ?? VITE_APP_DEFAULT_YEAR,
      };
      queryParams.affiliationStrings = [];
      queryParams.deletedAffiliations = [];
      queryParams.rors = [];
      queryParams.rorExclusions = [];
      searchParams.getAll('affiliations').forEach((item) => {
        if (isRor(item)) {
          queryParams.rors.push(item);
        } else {
          queryParams.affiliationStrings.push(normalize(item));
        }
      });
      let rorData = await Promise.all(queryParams.rors.map((ror) => getRorData(ror, searchParams.get('getRorChildren') === '1')));
      rorData = rorData.flat();
      const rorChildren = rorData.map((ror) => ror.rorId);
      queryParams.rors = queryParams.rors.concat(rorChildren);
      const rorNames = rorData.map((ror) => ror.names.map((name) => name.value)).flat();
      queryParams.affiliationStrings = queryParams.affiliationStrings.concat(rorNames);
      if (
        queryParams.affiliationStrings.length === 0
        && queryParams.rors.length === 0
      ) {
        console.error(
          `You must provide at least one affiliation longer than ${VITE_APP_TAG_LIMIT} letters.`,
        );
        return;
      }
      setOptions(queryParams);
    };

    getData();
  }, [searchParams]);

  useEffect(() => {
    if (Object.keys(options).length > 0) refetch();
  }, [options, refetch]);

  useEffect(() => {
    setAffiliations(data?.affiliations ?? []);
  }, [data]);

  return (
    <>
      <Header />
      <Container as="section" className="fr-mt-4w">
        {isFetching && (
          <Row>
            <Col xs="2" offsetXs="6">
              <Spinner size={48} />
            </Col>
          </Row>
        )}

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

        {!isFetching && isFetched && (
          <Datasets
            allAffiliations={affiliations}
            allDatasets={data?.datasets?.results ?? []}
            data={data}
            options={options}
            selectedAffiliations={selectedAffiliations}
            selectedDatasets={selectedDatasets}
            setSelectedAffiliations={setSelectedAffiliations}
            setSelectedDatasets={setSelectedDatasets}
            tagAffiliations={tagAffiliations}
            tagDatasets={tagDatasets}
          />
        )}
      </Container>
    </>
  );
}
