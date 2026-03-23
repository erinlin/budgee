import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useThemeStore } from './stores/themeStore';
import { Home } from './pages/Home';
import { TripEdit } from './pages/TripEdit';

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
          <Route path="/trip/:id" element={<div className="p-4 text-center">旅行詳情頁面即將實作...</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
