import PropTypes from 'prop-types';

import './index.scss';

export default function StepProgress({ current }) {
  return (
    <div className="arrow-steps clearfix">
      <div className={`step ${ current === 1 ? 'current' : null } ${ current > 1 ? 'done' : null } `}>
        <span>1. Requests</span>
      </div>
      <div className={`step ${ current === 2 ? 'current' : null } ${ current > 2 ? 'done' : null } `}>
        <span>2. Concat</span>
      </div>
      <div className={`step ${ current === 3 ? 'current' : null } ${ current > 3 ? 'done' : null } `}>
        <span>3. Dedup</span>
      </div>
      <div className={`step ${ current === 4 ? 'current' : null } ${ current > 4 ? 'done' : null } `}>
        <span>4. GroupBy</span>
      </div>
      <div className={`step ${ current === 5 ? 'current' : null } ${ current > 5 ? 'done' : null } `}>
        <span>5. Sort</span>
      </div>
      <div className={`step ${ current === 6 ? 'current' : null } ${ current > 6 ? 'done' : null } `}>
        <span>6. Facet</span>
      </div>
      <div className={`step ${ current === 7 ? 'current' : null } ${ current > 7 ? 'done' : null } `}>
        <span>7. Serialization</span>
      </div>
    </div>
  );
}

StepProgress.propTypes = {
  current: PropTypes.number.isRequired,
};
