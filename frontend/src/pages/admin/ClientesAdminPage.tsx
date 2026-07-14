import React, { useState, useEffect } from 'react';
import { useClientes } from '../../hooks/useClientes';
import { ShieldAlert, Users, CalendarDays } from 'lucide-react';
import type { Usuario } from '../../types';

export const ClientesAdminPage: React.FC = () => {
  const { clientes, isLoading, isError, error, toggleStatus } = useClientes();

  // Filtros de estado
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Activos' | 'Inactivos'>('Todos');

  // Confirmar cambio de estado
  const [confirmingCliente, setConfirmingCliente] = useState<Usuario | null>(null);
  const [statusMotive, setStatusMotive] = useState('');

  // Toast notifications
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (isToastOpen) {
      const timer = setTimeout(() => setIsToastOpen(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isToastOpen]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleOpenConfirmStatus = (cliente: Usuario) => {
    setConfirmingCliente(cliente);
    setStatusMotive('');
  };

  const handleToggleStatus = async () => {
    if (!confirmingCliente) return;
    try {
      const currentActive = confirmingCliente.activo !== false; // default is true
      const res = await toggleStatus({
        id: confirmingCliente.id,
        activo: !currentActive,
        motivo: statusMotive.trim() || undefined
      });
      setToastType('success');
      setToastMessage(res?.message || `Cliente ${!currentActive ? 'activado' : 'desactivado'} correctamente.`);
      setIsToastOpen(true);
      setConfirmingCliente(null);
    } catch (e: any) {
      setToastType('error');
      setToastMessage(e.message || 'No se pudo cambiar el estado del cliente.');
      setIsToastOpen(true);
    }
  };

  const filteredClientes = clientes.filter(cliente => {
    const isActivo = cliente.activo !== false;
    if (statusFilter === 'Activos') return isActivo;
    if (statusFilter === 'Inactivos') return !isActivo;
    return true;
  });

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between border-b border-white/5 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-accent-emerald" />
          <h2 className="text-2xl font-bold font-heading text-white">Listado de Clientes Registrados</h2>
        </div>
      </div>

      {/* Filtros de Estado */}
      <div className="flex gap-2 bg-slate-950/20 p-1 rounded-xl border border-white/5 w-fit">
        {(['Todos', 'Activos', 'Inactivos'] as const).map((filterOpt) => (
          <button
            key={filterOpt}
            onClick={() => setStatusFilter(filterOpt)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              statusFilter === filterOpt
                ? 'bg-accent-emerald text-white shadow-md shadow-emerald-500/10'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {filterOpt}
          </button>
        ))}
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
      ) : filteredClientes.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/30 border border-white/5 rounded-2xl p-8 max-w-md mx-auto text-gray-500">
          No hay clientes que coincidan con el filtro seleccionado.
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden shadow-xl border border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm text-gray-300">
              <thead>
                <tr className="bg-slate-950/40 text-gray-400 border-b border-white/5 font-semibold">
                  <th className="p-4 pl-6 uppercase text-xs tracking-wider">Cliente</th>
                  <th className="p-4 uppercase text-xs tracking-wider">Correo Electrónico</th>
                  <th className="p-4 uppercase text-xs tracking-wider">Estado</th>
                  <th className="p-4 uppercase text-xs tracking-wider">Fecha de Registro</th>
                  <th className="p-4 pr-6 uppercase text-xs tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-slate-900/10">
                {filteredClientes.map((cliente) => {
                  const isActivo = cliente.activo !== false;
                  return (
                    <tr key={cliente.id} className="hover:bg-white/2 transition-colors duration-150">
                      <td className="p-4 pl-6 font-semibold text-white">{cliente.nombre}</td>
                      <td className="p-4">{cliente.correo}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isActivo
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {isActivo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <CalendarDays className="w-3.5 h-3.5 text-accent-emerald/80" />
                          <span>{formatDate(cliente.fechaCreacion)}</span>
                        </div>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <button
                          onClick={() => handleOpenConfirmStatus(cliente)}
                          className={`px-3 py-2 border rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            isActivo
                              ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                          }`}
                        >
                          {isActivo ? 'Desactivar' : 'Activar'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de confirmación de Estado */}
      {confirmingCliente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel p-6 rounded-2xl max-w-md w-full shadow-2xl border border-white/10 flex flex-col gap-4">
            <h3 className="text-lg font-bold font-heading text-white">
              ¿Estás seguro de que deseas {confirmingCliente.activo !== false ? 'desactivar' : 'activar'} la cuenta de "{confirmingCliente.nombre}"?
            </h3>
            <p className="text-gray-400 text-xs">
              {confirmingCliente.activo !== false 
                ? 'Al desactivar el cliente, se bloqueará su inicio de sesión en la plataforma y no podrá registrar nuevas reservas.'
                : 'Al activar el cliente, recuperará el acceso completo a la plataforma.'}
            </p>
            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Motivo del cambio de estado
              </label>
              <textarea
                value={statusMotive}
                onChange={(e) => setStatusMotive(e.target.value)}
                placeholder="Indique el motivo..."
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-900/60 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:border-transparent transition-all"
              />
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-white/5 mt-2">
              <button
                type="button"
                onClick={() => setConfirmingCliente(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleToggleStatus}
                className={`px-4 py-2 text-xs font-semibold rounded-lg text-white transition-all cursor-pointer shadow-md ${
                  confirmingCliente.activo !== false 
                    ? 'bg-red-500 hover:bg-red-600 shadow-red-500/10' 
                    : 'bg-accent-emerald hover:bg-emerald-500 shadow-emerald-500/10'
                }`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {isToastOpen && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-fade-in ${
          toastType === 'success' 
            ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200' 
            : 'bg-red-950/90 border-red-500/30 text-red-200'
        }`}>
          <ShieldAlert className={`w-5 h-5 ${toastType === 'success' ? 'text-emerald-400' : 'text-red-400'}`} />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
export default ClientesAdminPage;

