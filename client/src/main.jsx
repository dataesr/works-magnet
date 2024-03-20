import { createInstance, MatomoProvider, useMatomo } from '@m4tt72/matomo-tracker-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, useLocation } from 'react-router-dom';

import Router from './router';
import { ToastContextProvider } from './hooks/useToast';

import './styles/index.scss';
import 'react-tooltip/dist/react-tooltip.css';

const { VITE_APP_MATOMO_BASE_URL, VITE_APP_MATOMO_SITE_ID } = import.meta.env;

const queryClient = new QueryClient();

const matomo = createInstance({
  urlBase: VITE_APP_MATOMO_BASE_URL,
  siteId: VITE_APP_MATOMO_SITE_ID,
  disabled: !VITE_APP_MATOMO_BASE_URL || !VITE_APP_MATOMO_SITE_ID,
  configurations: {
    disableCookies: true,
  },
});

function PageTracker() {
  const { pathname } = useLocation();
  const { trackPageView } = useMatomo();

  useEffect(() => {
    trackPageView({ documentTitle: pathname });
  }, [pathname, trackPageView]);

  return null;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MatomoProvider value={matomo}>
      <HashRouter>
        <PageTracker />
        <ToastContextProvider>
          <QueryClientProvider client={queryClient}>
            <ReactQueryDevtools />
            <Router />
          </QueryClientProvider>
        </ToastContextProvider>
      </HashRouter>
    </MatomoProvider>
  </React.StrictMode>,
);
