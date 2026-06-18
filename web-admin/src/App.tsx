import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import LoginScreen from './pages/Login/LoginScreen';
import DashboardPage from './pages/DashboardPage';
import PDVPage from './pages/PDVPage';
import ProductsPage from './pages/ProductsPage';
import LayoutGlobalScreen from './pages/LayoutGlobal/LayoutGlobalScreen';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        
        {/* Protected Admin Routes */}
        <Route element={<AdminLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/geral" element={<LayoutGlobalScreen />} />
          <Route path="/pdv" element={<PDVPage />} />
          <Route path="/produtos" element={<ProductsPage />} />
          
          {/* Default catch-all for admin redirects to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
