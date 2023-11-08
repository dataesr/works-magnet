/* eslint-disable no-mixed-operators */
import PropTypes from 'prop-types';

import { Tooltip } from 'react-tooltip';

import './gauge.scss';

export default function Gauge({ data }) {
  const gaugeValuesInPercent = data.map((item) => (
    { ...item, valuePercentage: (item.value / data.reduce((acc, curr) => acc + curr.value, 0) * 100).toFixed(0) }
  ));

  return (
    <div className="gauge-container">
      {gaugeValuesInPercent.filter((item) => item.value > 0).map((item) => (
        <>
          <div
            className={item?.className ? `gauge-bar ${item.className}` : 'gauge-bar'}
            data-tooltip-id={`gauge-bar-${item.id}`}
            key={item.id}
            style={item?.color ? { width: `${item.valuePercentage}%`, backgroundColor: item.color } : { width: `${item.valuePercentage}%` }}
          >
            {`${item.label} (${item.value} ie. ${item.valuePercentage} %)`}
          </div>
          <Tooltip id={`gauge-bar-${item.id}`} key={`tooltip-${item.id}`}>
            {`${item.label} (${item.value} ie. ${item.valuePercentage} %)`}
          </Tooltip>
        </>
      ))}
    </div>
  );
}

Gauge.propTypes = {
  data: PropTypes.array.isRequired,
};
