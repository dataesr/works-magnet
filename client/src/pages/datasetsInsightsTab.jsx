import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import PropTypes, { object } from 'prop-types';
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
  const series = Object.keys(publishers).map((name) => ({
    name,
    data: publishers[name],
  }));

  const options = {
    chart: {
      type: 'area',
    },
    plotOptions: {
      area: {
        stacking: 'normal',
      },
    },
    series,
    title: {
      text: 'Part of datasets publishers by publication year',
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
