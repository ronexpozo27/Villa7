import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Habitacion } from '../types';
import { useAuth } from '../hooks/useAuth';
import { X, Users, CreditCard, MapPin, Sparkles, Info, CalendarRange } from 'lucide-react';
import { formatCurrency } from '../utils/format';

interface RoomDetailsModalProps {
  room: Habitacion;
  onClose: () => void;
  fechaEntrada?: string;
  fechaSalida?: string;
}

export const RoomDetailsModal: React.FC<RoomDetailsModalProps> = ({
  room,
  onClose,
  fechaEntrada,
  fechaSalida,
}) => {
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  const handleBooking = () => {
    if (!accessToken) {
      navigate('/login');
      return;
    }

    let url = `/reservas/crear/${room.id}`;
    const queryParams: string[] = [];
    if (fechaEntrada) queryParams.push(`fechaEntrada=${fechaEntrada}`);
    if (fechaSalida) queryParams.push(`fechaSalida=${fechaSalida}`);

    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }

    navigate(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel max-w-2xl w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[90vh]">
        {/* Header Visual Area */}
        <div className="h-64 w-full relative shrink-0 bg-slate-900 flex items-center justify-center">
          {room.imagenUrl ? (
            <img
              src={room.imagenUrl}
              alt={room.nombre}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 relative flex items-center justify-center">
              <div className="absolute inset-0 bg-emerald-500/5"></div>
              <Sparkles className="w-16 h-16 text-accent-emerald/25" />
            </div>
          )}
          
          {/* Close button top right */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-slate-950/70 hover:bg-slate-950 backdrop-blur-md text-gray-300 hover:text-white rounded-full transition-colors border border-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Room status badge */}
          <div className="absolute bottom-4 left-4 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-accent-emerald font-semibold backdrop-blur-md">
            Cabaña Activa
          </div>
        </div>

        {/* Scrollable details area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-grow">
          {/* Title and Location */}
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold font-heading text-white">{room.nombre}</h2>
            {room.ubicacion ? (
              <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                <MapPin className="w-4 h-4 text-accent-emerald shrink-0" />
                <span>{room.ubicacion}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-gray-500 text-xs italic">
                <MapPin className="w-4 h-4 text-gray-600 shrink-0" />
                <span>Ubicación no especificada</span>
              </div>
            )}
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-white/2 border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center text-accent-emerald">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Capacidad</p>
                <p className="text-sm font-semibold text-white">Hasta {room.capacidadMax} personas</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center text-accent-emerald">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Precio por Noche</p>
                <p className="text-sm font-semibold text-white">{formatCurrency(room.precioPorNoche)} / Noche</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Descripción Completa</h4>
            <p className="text-sm text-gray-300 leading-relaxed font-light whitespace-pre-line">{room.descripcion}</p>
          </div>

          {/* Services Section (placeholder / not available) */}
          <div className="space-y-2 pt-4 border-t border-white/5">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Servicios Incluidos</h4>
            <div className="p-3 bg-white/2 border border-white/5 rounded-xl flex items-center gap-2.5 text-gray-400 text-xs italic">
              <Info className="w-4 h-4 text-gray-500 shrink-0" />
              <span>Servicios incluidos: Información no disponible en esta iteración.</span>
            </div>
          </div>
        </div>

        {/* Footer Area */}
        <div className="p-6 border-t border-white/5 bg-slate-950/40 shrink-0 flex items-center justify-between gap-4 flex-col sm:flex-row">
          <div className="text-left">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Total estimado por noche</p>
            <p className="text-xl font-extrabold text-accent-emerald">{formatCurrency(room.precioPorNoche)}</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-5 py-3 text-xs font-semibold rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer w-full sm:w-auto"
            >
              Cerrar
            </button>
            <button
              onClick={handleBooking}
              className="px-6 py-3 bg-accent-emerald hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-500/10 active:scale-[0.98] w-full sm:w-auto flex items-center justify-center gap-1.5"
            >
              <CalendarRange className="w-4 h-4" />
              <span>Reservar ahora</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
