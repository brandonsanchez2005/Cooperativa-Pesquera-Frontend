import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Faenas from './pages/Faenas';
import Inventario from './pages/Inventario';
import Liquidaciones from './pages/Liquidaciones';
import Login from './pages/Login';
import Pedidos from './pages/Pedidos';
import Procesamiento from './pages/Procesamiento';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<AppShell />}>
            <Route index element={<Dashboard />} />
            <Route path="modulos/faenas" element={<Faenas />} />
            <Route path="modulos/inventario" element={<Inventario />} />
            <Route path="modulos/procesamiento" element={<Procesamiento />} />
            <Route path="modulos/pedidos" element={<Pedidos />} />
            <Route path="modulos/liquidaciones" element={<Liquidaciones />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
