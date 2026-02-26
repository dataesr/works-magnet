import { Navigate, Route, Routes } from 'react-router-dom';

import Layout from './layout';
import About from './pages/about';
import DatasetsResults from './pages/datasets/results';
import DatasetsSearch from './pages/datasets/search';
import Home from './pages/home';
import MentionsResults from './pages/mentions/results';
import MentionsSearch from './pages/mentions/search';
import NotFount from './pages/notFound';
import OpenalexAffiliationsCorrections from './pages/openalex-affiliations/corrections';
import OpenalexaffiliationsResults from './pages/openalex-affiliations/results';
import OpenalexAffiliationsSearch from './pages/openalex-affiliations/search';
import PublicationsResults from './pages/publications/results';
import PublicationsSearch from './pages/publications/search';

export default function Router() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="about" element={<About />} />
        <Route
          path="/datasets/*"
          element={(
            <Routes>
              <Route path="/" element={<Navigate to="/datasets/search" replace />} />
              <Route path="/results" element={<DatasetsResults />} />
              <Route path="/search" element={<DatasetsSearch />} />
            </Routes>
          )}
        />
        <Route
          path="/mentions/*"
          element={(
            <Routes>
              <Route path="/" element={<Navigate to="/mentions/search" replace />} />
              <Route path="/results" element={<MentionsResults />} />
              <Route path="/search" element={<MentionsSearch />} />
            </Routes>
          )}
        />
        <Route
          path="/openalex-affiliations/*"
          element={(
            <Routes>
              <Route path="/" element={<Navigate to="/openalex-affiliations/search" replace />} />
              <Route path="/corrections" element={<OpenalexAffiliationsCorrections />} />
              <Route path="/results" element={<OpenalexaffiliationsResults />} />
              <Route path="/search" element={<OpenalexAffiliationsSearch />} />
            </Routes>
          )}
        />
        <Route
          path="/publications/*"
          element={(
            <Routes>
              <Route path="/" element={<Navigate to="/publications/search" replace />} />
              <Route path="/results" element={<PublicationsResults />} />
              <Route path="/search" element={<PublicationsSearch />} />
            </Routes>
          )}
        />
      </Route>
      <Route path="*" element={<NotFount />} />
    </Routes>
  );
}
