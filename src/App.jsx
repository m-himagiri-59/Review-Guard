import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Reviews from './pages/Reviews';
import PriceTracker from './pages/PriceTracker';
import Dashboard from './pages/Dashboard';
import SubmitReview from './pages/SubmitReview';
import Flagged from './pages/Flagged';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/price-tracker" element={<PriceTracker />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/submit-review" element={<SubmitReview />} />
          <Route path="/flagged" element={<Flagged />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
