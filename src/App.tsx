import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useThemeStore } from './stores/themeStore';
import { Home } from './pages/Home';
import { TripEdit } from './pages/TripEdit';
import { TripDetail } from './pages/trip/TripDetail';
import { Members } from './pages/trip/Members';
import { TripSettings } from './pages/trip/TripSettings';
import { ExpenseTypes } from './pages/trip/ExpenseTypes';

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
            <Route path="expenses" element={<div className="p-4">在此新增花費列表...</div>} />
            <Route path="collections" element={<div className="p-4">在此新增收款列表...</div>} />
            <Route path="members" element={<Members />} />
            <Route path="settings" element={<TripSettings />} />
            <Route path="expense-types" element={<ExpenseTypes />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
