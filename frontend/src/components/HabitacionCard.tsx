import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Habitacion } from '../types';
import { useAuth } from '../hooks/useAuth';
import { Users, CreditCard, Sparkles, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../utils/format';

interface HabitacionCardProps {
  habitacion: Habitacion;
  fechaEntrada?: string;
  fechaSalida?: string;
  onOpenDetails: (room: Habitacion) => void;
}

export const HabitacionCard: React.FC<HabitacionCardProps> = ({
  habitacion,
  fechaEntrada,
  fechaSalida,
  onOpenDetails,
}) => {
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  const handleBooking = () => {
    if (!accessToken) {
      navigate('/login');
      return;
    }

    let url = `/reservas/crear/${habitacion.id}`;
    const queryParams: string[] = [];
    if (fechaEntrada) queryParams.push(`fechaEntrada=${fechaEntrada}`);
    if (fechaSalida) queryParams.push(`fechaSalida=${fechaSalida}`);

    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }

    navigate(url);
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-1.5 hover:shadow-emerald-950/15 flex flex-col h-full border border-white/5 group">
      {/* Visual Image Area */}
      <div 
        onClick={() => onOpenDetails(habitacion)}
        className="h-48 w-full relative overflow-hidden border-b border-white/5 bg-slate-900 flex items-center justify-center cursor-pointer"
      >
        {habitacion.imagenUrl ? (
          <img
            src={habitacion.imagenUrl}
            alt={habitacion.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 relative flex items-center justify-center">
            <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors duration-300"></div>
            <Sparkles className="w-12 h-12 text-accent-emerald/25 group-hover:scale-110 transition-transform duration-300" />
          </div>
        )}
        <div className="absolute bottom-3 right-3 px-3 py-1 bg-slate-950/80 backdrop-blur-md rounded-lg border border-white/10 text-xs text-accent-emerald font-semibold">
          Activa
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 
          onClick={() => onOpenDetails(habitacion)}
          className="text-xl font-bold font-heading text-white group-hover:text-accent-emerald transition-colors duration-300 mb-2 cursor-pointer"
        >
          {habitacion.nombre}
        </h3>
        <p className="text-gray-400 text-sm mb-5 line-clamp-3 flex-grow">
          {habitacion.descripcion}
        </p>

        {/* Room Attributes Grid */}
        <div className="grid grid-cols-2 gap-4 py-4 border-t border-white/5 mb-5 text-sm">
          <div className="flex items-center gap-2 text-gray-300">
            <Users className="w-4 h-4 text-accent-emerald/75" />
            <span>Capacidad: {habitacion.capacidadMax} {habitacion.capacidadMax === 1 ? 'persona' : 'pers.'}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300 justify-end">
            <CreditCard className="w-4 h-4 text-accent-emerald/75" />
            <span>{formatCurrency(habitacion.precioPorNoche)} / Noche</span>
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex gap-2.5">
          <button
            onClick={() => onOpenDetails(habitacion)}
            className="flex-1 py-3 px-4 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white text-gray-300 font-medium rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer text-xs"
          >
            Ver Detalles
          </button>
          <button
            onClick={handleBooking}
            className="flex-1 py-3 px-4 bg-accent-emerald hover:bg-emerald-500 text-white font-medium rounded-xl flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer shadow-md hover:shadow-emerald-500/15 active:scale-[0.98] text-xs"
          >
            <span>Reservar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
