import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import Layout from './layout';
import Affiliations from './pages/affiliations';
import Filters from './pages/filters';
import Home from './pages/home';
import Mentions from './pages/mentions';

export default function Router() {
  const [isSticky, setIsSticky] = useState(false);

  return (
    <Routes>
      <Route element={<Layout isSticky={isSticky} />}>
        <Route path="/" element={<Home />} />
        <Route
          path="/openalex-ror"
          element={<Navigate to="/openalex-ror/search" replace />}
        />
        <Route path="/openalex-ror/search" element={<Filters />} />
        <Route
          path="/openalex-ror/results"
          element={
            <Affiliations isSticky setIsSticky={setIsSticky} />
          }
        />
        <Route
          path="/publications"
          element={<Navigate to="/publications/search" replace />}
        />
        <Route path="/publications/search" element={<Filters />} />
        <Route
          path="/publications/results"
          element={
            <Affiliations isStick setIsSticky={setIsSticky} />
          }
        />
        <Route
          path="/datasets"
          element={<Navigate to="/datasets/search" replace />}
        />
        <Route path="/datasets/search" element={<Filters />} />
        <Route
          path="/datasets/results"
          element={
            <Affiliations isSticky setIsSticky={setIsSticky} />
          }
        />
        <Route path="mentions" element={<Mentions />} />
      </Route>
    </Routes>
  );
}
