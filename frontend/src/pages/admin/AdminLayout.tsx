import React from 'react';
import { Outlet } from 'react-router-dom';

export const AdminLayout: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="border-b border-white/5 pb-4 mb-6">
        <h1 className="text-3xl font-bold font-heading text-gradient tracking-tight">
          Panel de Administración
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Gestiona las habitaciones, servicios, reservas y clientes registrados.
        </p>
      </div>
      <Outlet />
    </div>
  );
};
export default AdminLayout;
