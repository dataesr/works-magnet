import { Text, Row, Icon, Container } from '@dataesr/react-dsfr';
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
      id={id}
      role="alert"
      className={`toast toast-${toastType}`}
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      <div className="toast-colored-box">
        <Icon color="#ffffff" name={icon[toastType]} />
        {
          (autoDismissAfter !== 0)
            ? (<div id={`progress-${id}`} className="toast-progress-bar" />)
            : null
        }
      </div>
      <button
        type="button"
        onClick={() => remove(id)}
        className="toast-btn-close"
      >
        <Icon size="lg" name="ri-close-line" />
      </button>
      <Container fluid className="toast-content">
        <Row>
          {title && <Text bold spacing="mb-1w">{title}</Text>}
        </Row>
        <Row>
          {description && (<Text spacing="mb-2w" size="sm">{description}</Text>)}
        </Row>
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
