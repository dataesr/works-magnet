import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';

import Layout from './layout';
import Mentions from './pages/mentions';
import Home from './pages';

export default function Router() {
  const [isSticky, setIsSticky] = useState(false);

  return (
    <Routes>
      <Route element={<Layout isSticky={isSticky} />}>
        <Route path="/" element={<Home isSticky={isSticky} setIsSticky={setIsSticky} />} />
        <Route path="/mentions" element={<Mentions />} />
      </Route>
    </Routes>
  );
}
