import { Route, Routes } from 'react-router-dom';

import Layout from './layout';
import Home from './pages/home';

export default function Router() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
      </Route>
    </Routes>
  );
}
