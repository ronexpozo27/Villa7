import React from 'react';
import { useReservas } from '../hooks/useReservas';
import { ReservaCard } from '../components/ReservaCard';
import { ShieldAlert, Compass, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MisReservasPage: React.FC = () => {
  const { misReservas, isMisLoading, isMisError, cancelarReserva } = useReservas();

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-3xl font-extrabold font-heading text-gradient tracking-tight">
          Mis Reservas
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Historial y estado de tus solicitudes de hospedaje en Villa7.
        </p>
      </div>

      {/* Bookings Area */}
      <div className="max-w-4xl mx-auto">
        {isMisLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-emerald"></div>
            <p className="text-gray-400 text-sm">Cargando historial de reservas...</p>
          </div>
        ) : isMisError ? (
          <div className="text-center py-16 bg-red-950/10 border border-red-500/10 rounded-2xl p-8 max-w-md mx-auto">
            <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Error al recuperar reservas</h3>
            <p className="text-gray-400 text-sm">No pudimos obtener tu historial. Por favor intenta de nuevo.</p>
          </div>
        ) : misReservas.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/30 border border-white/5 rounded-2xl p-8 max-w-md mx-auto space-y-5">
            <Compass className="w-12 h-12 text-accent-emerald mx-auto" />
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-white">No tienes reservaciones aún</h3>
              <p className="text-gray-400 text-sm">
                ¿Planeas una escapada al campo? Revisa nuestras habitaciones disponibles.
              </p>
            </div>
            <Link
              to="/habitaciones"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-emerald hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-emerald-500/10 active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explorar Habitaciones</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {misReservas.map((reserva) => (
              <ReservaCard
                key={reserva.id}
                reserva={reserva}
                onCancel={cancelarReserva}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default MisReservasPage;
