import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';

import Router from './router';
import { ToastContextProvider } from './hooks/useToast';

import './styles/index.scss';
import 'react-tooltip/dist/react-tooltip.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <ToastContextProvider>
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools />
          <Router />
        </QueryClientProvider>
      </ToastContextProvider>
    </HashRouter>
  </React.StrictMode>,
);
