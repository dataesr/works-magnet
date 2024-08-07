import { DSFRConfig } from '@dataesr/dsfr-plus';
import {
  createInstance,
  MatomoProvider,
  useMatomo,
} from '@m4tt72/matomo-tracker-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Link, useLocation } from 'react-router-dom';

import { ToastContextProvider } from './hooks/useToast';
import Router from './router';

import 'react-tooltip/dist/react-tooltip.css';
import './styles/index.scss';

const { MODE, VITE_APP_MATOMO_BASE_URL, VITE_APP_MATOMO_SITE_ID } = import.meta
  .env;

const queryClient = new QueryClient();

const matomo = MODE === 'development'
  ? undefined
  : createInstance({
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

// eslint-disable-next-line react/prop-types
function RouterLink({ href, replace, target, ...props }) {
  // eslint-disable-next-line jsx-a11y/anchor-has-content
  if (target === '_blank') return <a href={href} target={target} {...props} />;
  return <Link to={href} replace={replace} {...props} />;
}

document.documentElement.setAttribute('data-fr-scheme', 'light');

function App() {
  useEffect(() => {
    document.documentElement.setAttribute('data-fr-scheme', 'light');
  }, []);

  return (
    <MatomoProvider value={matomo}>
      <DSFRConfig routerComponent={RouterLink}>
        <BrowserRouter>
          <PageTracker />
          <ToastContextProvider>
            <QueryClientProvider client={queryClient}>
              <ReactQueryDevtools />
              <Router />
            </QueryClientProvider>
          </ToastContextProvider>
        </BrowserRouter>
      </DSFRConfig>
    </MatomoProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
