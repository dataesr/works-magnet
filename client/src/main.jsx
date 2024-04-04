import React, { useEffect } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { createInstance, MatomoProvider, useMatomo } from '@m4tt72/matomo-tracker-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import ReactDOM from 'react-dom/client';

import Router from './router';
import { ToastContextProvider } from './hooks/useToast';

import './styles/index.scss';
import 'react-tooltip/dist/react-tooltip.css';

const { MODE, VITE_APP_MATOMO_BASE_URL, VITE_APP_MATOMO_SITE_ID } = import.meta.env;

const queryClient = new QueryClient();

const matomo = MODE === 'development' ? undefined : createInstance({
  urlBase: VITE_APP_MATOMO_BASE_URL,
  siteId: VITE_APP_MATOMO_SITE_ID,
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
      <BrowserRouter>
        <PageTracker />
        <ToastContextProvider>
          <QueryClientProvider client={queryClient}>
            <ReactQueryDevtools />
            <Router />
          </QueryClientProvider>
        </ToastContextProvider>
      </BrowserRouter>
    </MatomoProvider>
  </React.StrictMode>,
);
