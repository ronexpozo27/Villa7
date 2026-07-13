import React from 'react';
import { useClientes } from '../../hooks/useClientes';
import { ShieldAlert, Users, CalendarDays } from 'lucide-react';

export const ClientesAdminPage: React.FC = () => {
  const { clientes, isLoading, isError, error } = useClientes();

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <Users className="w-6 h-6 text-accent-emerald" />
        <h2 className="text-2xl font-bold font-heading text-white">Listado de Clientes Registrados</h2>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-emerald"></div>
          <p className="text-gray-400 text-sm">Cargando clientes...</p>
        </div>
      ) : isError ? (
        <div className="text-center py-16 bg-red-950/10 border border-red-500/10 rounded-2xl p-8 max-w-md mx-auto">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Error al recuperar clientes</h3>
          <p className="text-gray-400 text-sm">{(error as any)?.message || 'No se pudo cargar la lista.'}</p>
        </div>
      ) : clientes.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/30 border border-white/5 rounded-2xl p-8 max-w-md mx-auto text-gray-500">
          No hay clientes registrados en el sistema.
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden shadow-xl border border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm text-gray-300">
              <thead>
                <tr className="bg-slate-950/40 text-gray-400 border-b border-white/5 font-semibold">
                  <th className="p-4 pl-6 uppercase text-xs tracking-wider">Cliente</th>
                  <th className="p-4 uppercase text-xs tracking-wider">Correo Electrónico</th>
                  <th className="p-4 uppercase text-xs tracking-wider">ID de Usuario</th>
                  <th className="p-4 pr-6 uppercase text-xs tracking-wider">Fecha de Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-slate-900/10">
                {clientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-white/2 transition-colors duration-150">
                    <td className="p-4 pl-6 font-semibold text-white">{cliente.nombre}</td>
                    <td className="p-4">{cliente.correo}</td>
                    <td className="p-4 font-mono text-xs text-gray-500">{cliente.id}</td>
                    <td className="p-4 pr-6 text-xs text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 text-accent-emerald/80" />
                        <span>{formatDate(cliente.fechaCreacion)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
export default ClientesAdminPage;
