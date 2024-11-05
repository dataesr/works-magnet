import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';

import Layout from './layout';
import Home from './pages';
import Affiliations from './pages/affiliations';
import Mentions from './pages/mentions';

export default function Router() {
  const [isSticky, setIsSticky] = useState(false);

  return (
    <Routes>
      <Route element={<Layout isSticky={isSticky} />}>
        <Route path="/" element={<Home />} />
        <Route path="/affiliations" element={<Affiliations isSticky={isSticky} setIsSticky={setIsSticky} />} />
        <Route path="/mentions" element={<Mentions />} />
      </Route>
    </Routes>
  );
}
