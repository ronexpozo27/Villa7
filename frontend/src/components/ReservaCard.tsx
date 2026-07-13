import React, { useState } from 'react';
import type { Reserva } from '../types';
import { Calendar, Tag, ShieldCheck, HelpCircle, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency } from '../utils/format';

interface ReservaCardProps {
  reserva: Reserva;
  onCancel: (id: string) => Promise<void>;
}

export const ReservaCard: React.FC<ReservaCardProps> = ({ reserva, onCancel }) => {
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getStatusBadge = () => {
    switch (reserva.estado) {
      case 'Pendiente':
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 flex items-center gap-1.5 shrink-0">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Pendiente</span>
          </span>
        );
      case 'Confirmada':
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Confirmada</span>
          </span>
        );
      case 'Completada':
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1.5 shrink-0">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Completada</span>
          </span>
        );
      case 'Cancelada':
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1.5 shrink-0">
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancelada</span>
          </span>
        );
      default:
        return null;
    }
  };

  const handleCancelClick = async () => {
    setIsSubmitting(true);
    try {
      await onCancel(reserva.id);
      setIsConfirmingCancel(false);
    } catch (e) {
      alert('Error al cancelar la reserva.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Convert dates to human readable string
  const formatFriendlyDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC' // backend sends dates in UTC, let's keep it safe
    });
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/5 shadow-md flex flex-col gap-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
        <div>
          <span className="text-gray-500 text-xs uppercase tracking-wider block mb-1">
            Código de Reserva:
          </span>
          <code className="text-gray-300 font-mono text-sm">{reserva.id}</code>
        </div>
        <div>{getStatusBadge()}</div>
      </div>

      {/* Main Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side Info */}
        <div className="space-y-4">
          <div>
            <h4 className="text-gray-400 text-xs uppercase tracking-wider mb-1">Cabaña Reservada</h4>
            <p className="text-lg font-bold text-white">{reserva.habitacionNombre}</p>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-accent-emerald/80 shrink-0" />
            <div className="text-sm">
              <p className="text-gray-400 text-xs">Fechas de Estadía</p>
              <p className="text-white font-medium">
                {formatFriendlyDate(reserva.fechaEntrada)} — {formatFriendlyDate(reserva.fechaSalida)}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side Info: Services & Totals */}
        <div className="space-y-4 md:border-l md:border-white/5 md:pl-6">
          <div>
            <h4 className="text-gray-400 text-xs uppercase tracking-wider mb-2">Servicios Adicionales</h4>
            {reserva.serviciosContratados.length === 0 ? (
              <p className="text-gray-500 text-sm italic">Ningún servicio contratado</p>
            ) : (
              <ul className="space-y-1.5">
                {reserva.serviciosContratados.map((item, idx) => (
                  <li key={idx} className="text-sm flex items-center justify-between text-gray-300">
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-accent-emerald/70" />
                      {item.servicioNombre}
                    </span>
                    <span className="font-medium text-white">{formatCurrency(item.precioContratado)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-sm text-gray-400 font-semibold">Total Liquidado</span>
            <span className="text-xl font-extrabold text-accent-emerald">
              {formatCurrency(reserva.totalCalculado)}
            </span>
          </div>
        </div>
      </div>

      {/* Cancellation section */}
      {reserva.estado === 'Pendiente' && (
        <div className="pt-4 border-t border-white/5 flex justify-end">
          {isConfirmingCancel ? (
            <div className="flex items-center gap-3 animate-fade-in">
              <span className="text-xs text-red-300 font-medium">¿Estás seguro de cancelar esta reserva?</span>
              <button
                disabled={isSubmitting}
                onClick={handleCancelClick}
                className="px-3.5 py-1.5 bg-red-650 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                {isSubmitting ? 'Cancelando...' : 'Sí, confirmar'}
              </button>
              <button
                disabled={isSubmitting}
                onClick={() => setIsConfirmingCancel(false)}
                className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsConfirmingCancel(true)}
              className="px-4 py-2 border border-red-500/20 hover:border-red-500/50 bg-red-950/10 hover:bg-red-950/20 text-red-400 hover:text-red-300 text-xs font-semibold rounded-xl transition-all duration-300 cursor-pointer"
            >
              Cancelar Reserva
            </button>
          )}
        </div>
      )}
    </div>
  );
};
