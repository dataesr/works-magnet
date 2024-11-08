import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import Layout from './layout';
import DatasetsResults from './pages/datasets/results';
import DatasetsSearch from './pages/datasets/search';
import Home from './pages/home';
import Mentions from './pages/mentions';
import OpenalexRorResults from './pages/openalex-ror/results';
import OpenalexRorSearch from './pages/openalex-ror/search';
import PublicationsResults from './pages/publications/results';
import PublicationsSearch from './pages/publications/search';

export default function Router() {
  const [isSticky] = useState(false);

  return (
    <Routes>
      <Route element={<Layout isSticky={isSticky} />}>
        <Route path="/" element={<Home />} />
        <Route
          path="/openalex-ror"
          element={<Navigate to="/openalex-ror/search" replace />}
        />
        <Route path="/openalex-ror/search" element={<OpenalexRorSearch />} />
        <Route
          path="/openalex-ror/results"
          element={
            <OpenalexRorResults />
          }
        />
        <Route
          path="/publications"
          element={<Navigate to="/publications/search" replace />}
        />
        <Route path="/publications/search" element={<PublicationsSearch />} />
        <Route
          path="/publications/results"
          element={
            <PublicationsResults />
          }
        />
        <Route
          path="/datasets"
          element={<Navigate to="/datasets/search" replace />}
        />
        <Route path="/datasets/search" element={<DatasetsSearch />} />
        <Route
          path="/datasets/results"
          element={
            <DatasetsResults />
          }
        />
        <Route path="mentions" element={<Mentions />} />
      </Route>
    </Routes>
  );
}
