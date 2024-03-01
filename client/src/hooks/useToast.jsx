import {
  createContext,
  useState,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import Toast from '../components/toast';

function ToastContainer({ children }) {
  return <div id="toast-container">{children}</div>;
}

ToastContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

const ToastContext = createContext();

// Provider
// ==============================
let toastCount = 0;

export function ToastContextProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((toastList) => toastList.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((toastObject) => {
    toastCount += 1;
    setToasts((toastList) => [...toastList, { ...toastObject, id: toastCount }]);
    return toastCount;
  }, []);
  const value = useMemo(() => ({
    toast, remove, toasts,
  }), [toast, remove, toasts]);
  const content = (
    <ToastContainer>
      {
        toasts.map((toastOptions) => (
          <Toast
            key={toastOptions.id}
            remove={remove}
            {...toastOptions}
          />
        ))
      }
    </ToastContainer>
  );
  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(content, document.body)}
    </ToastContext.Provider>
  );
}

ToastContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Hook
// ==============================
const useToast = () => useContext(ToastContext);

/* @component */
export default useToast;
