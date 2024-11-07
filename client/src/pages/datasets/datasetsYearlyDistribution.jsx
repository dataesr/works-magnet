import {
  Col,
  Row,
} from '@dataesr/dsfr-plus';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import PropTypes from 'prop-types';
import { useSearchParams } from 'react-router-dom';

import { range } from '../../utils/works';

export default function DatasetsYearlyDistribution({ allDatasets, field, subfield = undefined }) {
  const [searchParams] = useSearchParams();

  const categories = range(searchParams.get('startYear', 2023), searchParams.get('endYear', 2023));
  const allFields = {};
  allDatasets.filter((dataset) => dataset.status === 'validated').forEach((dataset) => {
    const publicationYear = dataset?.year;
    let currentValues = dataset[field];
    if (!Array.isArray(currentValues)) {
      currentValues = [currentValues];
    }
    currentValues.forEach((e) => {
      // eslint-disable-next-line no-nested-ternary
      const currentField = e ? (subfield ? e[subfield] : e) : `no ${field}`;
      if (!Object.keys(allFields).includes(currentField)) {
        allFields[currentField] = new Array(categories.length).fill(0);
      }
      const i = categories.indexOf(Number(publicationYear));
      allFields[currentField][i] += 1;
    });
  });
  // const colors = ['#ea5545', '#f46a9b', '#ef9b20', '#edbf33', '#ede15b', '#bdcf32', '#87bc45', '#27aeef', '#544fc5', '#b33dc6', '#d3d3d3']
  const colors = ['#5DA5DA', '#FAA43A', '#60BD68', '#F17CB0', '#B2912F', '#B276B2', '#DECF3F', '#F15854', '#265DAB', '#DF5C24', '#059748', '#E5126F', '#9D722A', '#7B3A96', '#C7B42E', '#CB2027'];
  const NB_TOP = 13;
  const series = Object.keys(allFields)
    .map((name) => ({
      name,
      data: allFields[name],
      total: allFields[name].reduce((accumulator, currentValue) => accumulator + currentValue, 0),
    }))
    .sort((a, b) => b.total - a.total)
    .map((item, index) => ({
      ...item,
      color: colors[index],
    }));
  const topSeries = series.slice(0, NB_TOP);
  const tailData = new Array(categories.length).fill(0);
  series.slice(NB_TOP).forEach((serie) => {
    serie.data.forEach((d, index) => {
      tailData[index] += d;
    });
  });
  topSeries.push({
    name: 'Others',
    data: tailData,
    color: colors[NB_TOP],
  });
  const options = {
    chart: {
      type: 'column',
      height: '600 px',
    },
    credits: { text: 'French Open Science Monitor - CC-BY MESR', enabled: true },
    legend: { reversed: true },
    plotOptions: {
      column: {
        stacking: 'normal',
        dataLabels: {
          enabled: true,
        },
      },
    },
    series: topSeries.reverse(),
    title: {
      text: `Yearly distribution of the number of datasets by ${field}`,
    },
    xAxis: {
      categories,
      title: {
        text: 'Publication year',
      },
    },
    yAxis: {
      title: {
        text: (subfield ? `Number of datasets x ${subfield}` : 'Number of datasets'),
      },
      stackLabels: {
        enabled: true,
      },
    },
  };

  return (
    <Row gutters>
      <Col xs="12">
        <HighchartsReact
          highcharts={Highcharts}
          options={options}
        />
      </Col>
    </Row>
  );
}

DatasetsYearlyDistribution.propTypes = {
  allDatasets: PropTypes.arrayOf(PropTypes.shape({
    affiliations: PropTypes.arrayOf(PropTypes.object),
    allIds: PropTypes.arrayOf(PropTypes.object).isRequired,
    datasource: PropTypes.arrayOf(PropTypes.string).isRequired,
    id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  })).isRequired,
  field: PropTypes.string.isRequired,
  subfield: PropTypes.string,
};

DatasetsYearlyDistribution.defaultProps = {
  subfield: undefined,
};
