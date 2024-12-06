import { Navigate, Route, Routes } from 'react-router-dom';

import Layout from './layout';
import DatasetsResults from './pages/datasets/results';
import DatasetsSearch from './pages/datasets/search';
import Home from './pages/home';
import Mentions from './pages/mentions';
import OpenalexAffiliationsCorrections from './pages/openalex-affiliations/corrections';
import OpenalexaffiliationsResults from './pages/openalex-affiliations/results';
import OpenalexAffiliationsSearch from './pages/openalex-affiliations/search';
import PublicationsResults from './pages/publications/results';
import PublicationsSearch from './pages/publications/search';

export default function Router() {
  // TODO: Merge nested routes
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route
          path="/openalex-affiliations"
          element={<Navigate to="/openalex-affiliations/search" replace />}
        />
        <Route path="/openalex-affiliations/search" element={<OpenalexAffiliationsSearch />} />
        <Route
          path="/openalex-affiliations/results"
          element={
            <OpenalexaffiliationsResults />
          }
        />
        <Route path="/openalex-affiliations/corrections" element={<OpenalexAffiliationsCorrections />} />
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
