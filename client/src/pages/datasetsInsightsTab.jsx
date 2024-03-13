import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import PropTypes from 'prop-types';
import React from 'react';
import { useSearchParams } from 'react-router-dom';

import { range } from '../utils/works';

export default function DatasetsInsightsTab({ allDatasets }) {
  const [searchParams] = useSearchParams();

  const categories = range(searchParams.get('startYear', 2023), searchParams.get('endYear', 2023));

  const publishers = {};
  allDatasets.forEach((dataset) => {
    const publisher = dataset?.publisher;
    const publicationYear = dataset?.year;
    if (!Object.keys(publishers).includes(publisher)) {
      publishers[publisher] = new Array(categories.length).fill(0);
    }
    const i = categories.indexOf(Number(publicationYear));
    publishers[publisher][i] += 1;
  });
  const colors = ['#ea5545', '#f46a9b', '#ef9b20', '#edbf33', '#ede15b', '#bdcf32', '#87bc45', '#27aeef', '#b33dc6'];
  const NB_TOP = 8;
  const series = Object.keys(publishers)
    .map((name) => ({
      name,
      data: publishers[name],
      total: publishers[name].reduce((accumulator, currentValue) => accumulator + currentValue, 0),
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
      type: 'area',
      height: '600 px',
    },
    plotOptions: {
      area: {
        stacking: 'normal',
      },
    },
    series: topSeries.reverse(),
    legend: {
      reversed: true,
    },
    title: {
      text: `Yearly distribution of the number of datasets by repositories (top ${NB_TOP})`,
    },
    xAxis: {
      categories,
      title: {
        text: 'Publication year',
      },
    },
    yAxis: {
      title: {
        text: 'Number of datasets',
      },
    },
  };

  return (
    <div>
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
      />
    </div>
  );
}

DatasetsInsightsTab.propTypes = {
  allDatasets: PropTypes.arrayOf(PropTypes.shape({
    affiliations: PropTypes.arrayOf(PropTypes.object),
    allIds: PropTypes.arrayOf(PropTypes.object).isRequired,
    datasource: PropTypes.arrayOf(PropTypes.string).isRequired,
    id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  })).isRequired,
};
