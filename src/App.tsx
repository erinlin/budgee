import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useThemeStore } from './stores/themeStore';
import { Home } from './pages/Home';
import { TripEdit } from './pages/TripEdit';
import { TripDetail } from './pages/trip/TripDetail';
import { Members } from './pages/trip/Members';
import { TripSettings } from './pages/trip/TripSettings';
import { Expenses } from './pages/trip/Expenses';
import { Collections } from './pages/trip/Collections';
import { Personal } from './pages/trip/Personal';
import { AppSettings } from './pages/AppSettings';

function App() {
  const { initialize } = useThemeStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <div className="budgee-app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/trip/new" element={<TripEdit />} />
          <Route path="/trip/:id/edit" element={<TripEdit />} />
          <Route path="/trip/:id" element={<TripDetail />}>
            <Route index element={<Navigate to="expenses" replace />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="collections" element={<Collections />} />
            <Route path="personal" element={<Personal />} />
            <Route path="members" element={<Members />} />
            <Route path="settings" element={<TripSettings />} />
          </Route>
          <Route path="/settings" element={<AppSettings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
