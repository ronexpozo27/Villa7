import React, { useEffect, useState } from 'react';
import { useReservas } from '../../hooks/useReservas';
import { Calendar, Check, X, ClipboardList, ShieldAlert } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

export const ReservasAdminPage: React.FC = () => {
  const [estadoFilter, setEstadoFilter] = useState<string>('');
  const {
    adminReservas,
    isAdminLoading,
    fetchAdminReservas,
    cambiarEstadoReserva,
    anularReserva,
    cancelarReservaConMotivo,
  } = useReservas(estadoFilter === '' ? undefined : estadoFilter);

  // Confirmar cancelar o anular
  const [confirmingReserva, setConfirmingReserva] = useState<{ id: string; action: 'Cancelar' | 'Anular' } | null>(null);
  const [statusMotive, setStatusMotive] = useState('');

  // Toast notifications
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    fetchAdminReservas();
  }, [estadoFilter]);

  useEffect(() => {
    if (isToastOpen) {
      const timer = setTimeout(() => setIsToastOpen(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isToastOpen]);

  const handleStatusTransition = async (id: string, nuevoEstado: string) => {
    try {
      await cambiarEstadoReserva({ id, nuevoEstado });
      fetchAdminReservas();
    } catch (e: any) {
      alert(e.message || 'No se pudo realizar el cambio de estado de la reserva.');
    }
  };

  const handleOpenConfirmStatus = (id: string, action: 'Cancelar' | 'Anular') => {
    setConfirmingReserva({ id, action });
    setStatusMotive('');
  };

  const handleToggleStatus = async () => {
    if (!confirmingReserva) return;
    try {
      if (confirmingReserva.action === 'Anular') {
        const res = await anularReserva({ id: confirmingReserva.id, motivo: statusMotive });
        setToastType('success');
        setToastMessage(res?.message || 'Reserva anulada correctamente.');
      } else {
        const res = await cancelarReservaConMotivo({ id: confirmingReserva.id, motivo: statusMotive });
        setToastType('success');
        setToastMessage(res?.message || 'Reserva cancelada correctamente.');
      }
      setIsToastOpen(true);
      setConfirmingReserva(null);
      fetchAdminReservas();
    } catch (e: any) {
      setToastType('error');
      setToastMessage(e.message || 'No se pudo procesar la solicitud.');
      setIsToastOpen(true);
    }
  };

  const formatFriendlyDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC'
    });
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'Pendiente':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Pendiente</span>;
      case 'Confirmada':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Confirmada</span>;
      case 'Completada':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">Completada</span>;
      case 'Cancelada':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Cancelada</span>;
      case 'Anulada':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">Anulada</span>;
      default:
        return null;
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-6 h-6 text-accent-emerald" />
          <h2 className="text-2xl font-bold font-heading text-white">Gestionar Reservas de Clientes</h2>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Estado:</label>
          <select
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:border-transparent transition-all"
          >
            <option value="">Todas</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Confirmada">Confirmada</option>
            <option value="Completada">Completada</option>
            <option value="Cancelada">Cancelada</option>
            <option value="Anulada">Anulada</option>
          </select>
        </div>
      </div>


      {/* Grid List */}
      {isAdminLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-emerald"></div>
          <p className="text-gray-400 text-sm">Consultando historial de reservas...</p>
        </div>
      ) : adminReservas.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/30 border border-white/5 rounded-2xl p-8 max-w-md mx-auto text-gray-500">
          No hay reservas registradas {estadoFilter ? 'bajo este estado' : ''}.
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden shadow-xl border border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm text-gray-300">
              <thead>
                <tr className="bg-slate-950/40 text-gray-400 border-b border-white/5 font-semibold">
                  <th className="p-4 pl-6 uppercase text-xs tracking-wider">Cliente</th>
                  <th className="p-4 uppercase text-xs tracking-wider">Cabaña</th>
                  <th className="p-4 uppercase text-xs tracking-wider">Fechas</th>
                  <th className="p-4 uppercase text-xs tracking-wider">Total</th>
                  <th className="p-4 uppercase text-xs tracking-wider">Estado</th>
                  <th className="p-4 pr-6 uppercase text-xs tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-slate-900/10">
                {adminReservas.map((reserva) => (
                  <tr key={reserva.id} className="hover:bg-white/2 transition-colors duration-150">
                    <td className="p-4 pl-6 font-semibold text-white">{reserva.usuarioNombre}</td>
                    <td className="p-4">{reserva.habitacionNombre}</td>
                    <td className="p-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-accent-emerald/80 shrink-0" />
                        <span>
                          {formatFriendlyDate(reserva.fechaEntrada)} — {formatFriendlyDate(reserva.fechaSalida)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-white">{formatCurrency(reserva.totalCalculado)}</td>
                    <td className="p-4">{getStatusBadge(reserva.estado)}</td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {reserva.estado === 'Pendiente' && (
                          <>
                            <button
                              onClick={() => handleStatusTransition(reserva.id, 'Confirmada')}
                              className="px-2.5 py-1.5 bg-emerald-950/45 hover:bg-emerald-500 border border-emerald-500/20 text-emerald-400 hover:text-white text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                              title="Confirmar Reserva"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Confirmar</span>
                            </button>
                            <button
                              onClick={() => handleOpenConfirmStatus(reserva.id, 'Cancelar')}
                              className="px-2.5 py-1.5 bg-red-950/45 hover:bg-red-500 border border-red-500/20 text-red-400 hover:text-white text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                              title="Cancelar Reserva"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Cancelar</span>
                            </button>
                            <button
                              onClick={() => handleOpenConfirmStatus(reserva.id, 'Anular')}
                              className="px-2.5 py-1.5 bg-purple-950/45 hover:bg-purple-500 border border-purple-500/20 text-purple-400 hover:text-white text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                              title="Anular Reserva"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Anular</span>
                            </button>
                          </>
                        )}
                        {reserva.estado === 'Confirmada' && (
                          <>
                            <button
                              onClick={() => handleStatusTransition(reserva.id, 'Completada')}
                              className="px-2.5 py-1.5 bg-blue-950/45 hover:bg-blue-500 border border-blue-500/20 text-blue-400 hover:text-white text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                              title="Completar Reserva"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Completar</span>
                            </button>
                            <button
                              onClick={() => handleOpenConfirmStatus(reserva.id, 'Cancelar')}
                              className="px-2.5 py-1.5 bg-red-950/45 hover:bg-red-500 border border-red-500/20 text-red-400 hover:text-white text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                              title="Cancelar Reserva"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Cancelar</span>
                            </button>
                            <button
                              onClick={() => handleOpenConfirmStatus(reserva.id, 'Anular')}
                              className="px-2.5 py-1.5 bg-purple-950/45 hover:bg-purple-500 border border-purple-500/20 text-purple-400 hover:text-white text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                              title="Anular Reserva"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Anular</span>
                            </button>
                          </>
                        )}
                        {(reserva.estado === 'Cancelada' || reserva.estado === 'Completada' || reserva.estado === 'Anulada') && (
                          <span className="text-xs text-gray-500 italic">Sin acciones</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de confirmación de Estado */}
      {confirmingReserva && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel p-6 rounded-2xl max-w-md w-full shadow-2xl border border-white/10 flex flex-col gap-4">
            <h3 className="text-lg font-bold font-heading text-white">
              ¿Estás seguro de que deseas {confirmingReserva.action.toLowerCase()} esta reserva?
            </h3>
            <p className="text-gray-400 text-xs">
              Esta acción es irreversible y liberará la habitación para las fechas indicadas.
            </p>
            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Motivo de la {confirmingReserva.action.toLowerCase() === 'cancelar' ? 'cancelación' : 'anulación'}
              </label>
              <textarea
                value={statusMotive}
                onChange={(e) => setStatusMotive(e.target.value)}
                placeholder="Indique el motivo (obligatorio)..."
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-900/60 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:border-transparent transition-all"
              />
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-white/5 mt-2">
              <button
                type="button"
                onClick={() => setConfirmingReserva(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={!statusMotive.trim()}
                className={`px-4 py-2 text-xs font-semibold rounded-lg text-white transition-all cursor-pointer shadow-md disabled:opacity-50 ${
                  confirmingReserva.action === 'Anular' 
                    ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/10' 
                    : 'bg-red-500 hover:bg-red-600 shadow-red-500/10'
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
export default ReservasAdminPage;

