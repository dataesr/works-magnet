/* eslint-disable no-mixed-operators */
import PropTypes from 'prop-types';
import './gauge.scss';

export default function Gauge({ data }) {
  const gaugeValuesInPercent = data.map((item) => (
    { ...item, valuePercentage: item.value / data.reduce((acc, curr) => acc + curr.value, 0) * 100 }
  ));

  return (
    <div className="gauge-container">
      {gaugeValuesInPercent.map((item) => (
        <div className="gauge-bar" style={{ width: `${item.valuePercentage}%`, backgroundColor: item.color }} key={item.label}>
          {`${item.label} (${item.value} ie. ${item.valuePercentage.toFixed(1)} %)`}
        </div>
      ))}
    </div>
  );
}

Gauge.propTypes = {
  data: PropTypes.array.isRequired,
};
