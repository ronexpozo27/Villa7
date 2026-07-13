import React from 'react';
import type { Servicio } from '../types';
import { Compass, Gift, BadgeCent } from 'lucide-react';
import { formatCurrency } from '../utils/format';

interface ServicioCardProps {
  servicio: Servicio;
}

export const ServicioCard: React.FC<ServicioCardProps> = ({ servicio }) => {
  const isFree = servicio.precio === 0;

  return (
    <div className="glass-card rounded-2xl p-6 shadow-md border border-white/5 flex gap-4 transition-all duration-300 hover:border-emerald-500/20 hover:shadow-emerald-950/5 group">
      {/* Icon Area */}
      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/10 group-hover:bg-accent-emerald group-hover:text-white text-accent-emerald transition-all duration-300">
        {isFree ? <Gift className="w-6 h-6" /> : <Compass className="w-6 h-6" />}
      </div>

      {/* Details Area */}
      <div className="flex-grow space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-bold text-lg text-white group-hover:text-accent-emerald transition-colors duration-300">
            {servicio.nombre}
          </h4>
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 flex items-center gap-1 ${
            isFree 
              ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/20' 
              : 'bg-white/5 text-gray-200 border border-white/10'
          }`}>
            {!isFree && <BadgeCent className="w-3.5 h-3.5 text-accent-emerald" />}
            {isFree ? 'Incluido' : formatCurrency(servicio.precio)}
          </span>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed">
          {servicio.descripcion}
        </p>
      </div>
    </div>
  );
};
