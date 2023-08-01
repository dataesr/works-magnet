/* eslint-disable no-mixed-operators */
import PropTypes from 'prop-types';
import './gauge.scss';

export default function Gauge({ data }) {
  const gaugeValuesInPercent = data.map((item) => (
    { ...item, valuePct: item.value / data.reduce((acc, curr) => acc + curr.value, 0) * 100 }
  ));

  return (
    <div className="gauge-container">
      {gaugeValuesInPercent.map((item) => (
        <div className="gauge-bar" style={{ width: `${item.valuePct}%`, backgroundColor: item.color }}>
          {`${item.label} (${item.value})`}
        </div>
      ))}
    </div>
  );
}

Gauge.propTypes = {
  data: PropTypes.array.isRequired,
};
