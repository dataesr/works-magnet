/* eslint-disable no-mixed-operators */
import PropTypes from 'prop-types';
import React from 'react';

import { Tooltip } from 'react-tooltip';

import './index.scss';

export default function Gauge({ data }) {
  const dataWithPercent = data.map((item) => (
    { ...item, percentage: (item.value / data.reduce((acc, curr) => acc + curr.value, 0) * 100).toFixed(0) }
  ));

  return (
    <div className="gauge-container">
      {dataWithPercent.filter((item) => item.value > 0).map((item) => (
        <React.Fragment key={item.id}>
          <div
            className={item?.id ? `gauge-bar ${item.id}` : 'gauge-bar'}
            data-tooltip-id={`gauge-bar-${item.id}`}
            style={item?.color ? { width: `${item.percentage}%`, backgroundColor: item.color } : { width: `${item.percentage}%` }}
          >
            {`${item.label} (${item.value} ie. ${item.percentage} %)`}
          </div>
          <Tooltip id={`gauge-bar-${item.id}`} key={`tooltip-${item.id}`}>
            {`${item.label} (${item.value} ie. ${item.percentage} %)`}
          </Tooltip>
        </React.Fragment>
      ))}
    </div>
  );
}

Gauge.propTypes = {
  data: PropTypes.array.isRequired,
};
