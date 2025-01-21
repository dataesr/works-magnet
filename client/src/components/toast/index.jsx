import { Text, Row, Container } from '@dataesr/dsfr-plus';
import PropTypes from 'prop-types';
import { useCallback, useEffect } from 'react';

import usePausableTimer from '../../hooks/usePausableTimer';

import './index.scss';

function Toast({
  autoDismissAfter,
  description,
  id,
  remove,
  title,
  toastType,
}) {
  const removeSelf = useCallback(() => {
    document.getElementById(id).style.setProperty('animation', 'toast-unmount 1000ms');
    setTimeout(() => {
      remove(id);
    }, 1000);
  }, [id, remove]);
  const { pause, resume } = usePausableTimer(removeSelf, autoDismissAfter);

  useEffect(() => {
    const progressBar = document.getElementById(`progress-${id}`);
    if (progressBar) {
      progressBar.style.setProperty('animation-duration', `${autoDismissAfter}ms`);
    }
  }, [id, autoDismissAfter]);

  const icon = {
    info: 'ri-information-fill',
    warning: 'ri-error-warning-fill',
    success: 'ri-checkbox-circle-fill',
    error: 'ri-close-circle-fill',
  };

  return (
    <div
      className={`toast toast-${toastType}`}
      id={id}
      role="alert"
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      <div className="toast-colored-box">
        <i className={`${icon?.[toastType]} fr-mr-1w`} />
        {
          (autoDismissAfter !== 0)
            ? (<div id={`progress-${id}`} className="toast-progress-bar" />)
            : null
        }
      </div>
      <button
        aria-label="Close toast"
        className="toast-btn-close"
        onClick={() => remove(id)}
        type="button"
      >
        <i className="ri-close-line fr-mr-1w" />
      </button>
      <Container className="toast-content">
        <Row>
          {title && <Text bold spacing="mb-1w">{title}</Text>}
        </Row>
        {description && (
          <Row>
            <p dangerouslySetInnerHTML={{ __html: description }} />
          </Row>
        )}
      </Container>
    </div>
  );
}

Toast.propTypes = {
  autoDismissAfter: PropTypes.number,
  description: PropTypes.string,
  id: PropTypes.number.isRequired,
  remove: PropTypes.func,
  title: PropTypes.string,
  toastType: PropTypes.oneOf(['info', 'success', 'error', 'warning']),
};

Toast.defaultProps = {
  autoDismissAfter: 10000,
  description: null,
  remove: () => { },
  title: null,
  toastType: 'success',
};

export default Toast;
