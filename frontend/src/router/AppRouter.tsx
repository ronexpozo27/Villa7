import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';

// Pages
import { HomePage } from '../pages/HomePage';
import { HabitacionesPage } from '../pages/HabitacionesPage';
import { ServiciosPage } from '../pages/ServiciosPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ReservaPage } from '../pages/ReservaPage';
import { MisReservasPage } from '../pages/MisReservasPage';

// Admin Pages
import { AdminLayout } from '../pages/admin/AdminLayout';
import { HabitacionesAdminPage } from '../pages/admin/HabitacionesAdminPage';
import { ServiciosAdminPage } from '../pages/admin/ServiciosAdminPage';
import { ReservasAdminPage } from '../pages/admin/ReservasAdminPage';
import { ClientesAdminPage } from '../pages/admin/ClientesAdminPage';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes outside the standard Layout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Client / Public routes inside the Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/habitaciones" element={<HabitacionesPage />} />
          <Route path="/servicios" element={<ServiciosPage />} />

          {/* Protected Customer Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/reservas/crear/:roomId" element={<ReservaPage />} />
            <Route path="/mis-reservas" element={<MisReservasPage />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<Navigate to="/admin/reservas" replace />} />
              <Route path="/admin/habitaciones" element={<HabitacionesAdminPage />} />
              <Route path="/admin/servicios" element={<ServiciosAdminPage />} />
              <Route path="/admin/reservas" element={<ReservasAdminPage />} />
              <Route path="/admin/clientes" element={<ClientesAdminPage />} />
            </Route>
          </Route>
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
