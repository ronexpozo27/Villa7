import React from 'react';
import { useServicios } from '../hooks/useServicios';
import { ServicioCard } from '../components/ServicioCard';
import { Sparkles, Info } from 'lucide-react';

export const ServiciosPage: React.FC = () => {
  const { services, isLoading, isError, error } = useServicios();

  return (
    <div className="space-y-10">
      {/* Title Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold font-heading text-gradient tracking-tight">
          Servicios Adicionales
        </h1>
        <p className="text-gray-400 text-base sm:text-lg">
          Complementa tu estadía en Villa7 con nuestras actividades al aire libre y servicios de relajación diseñados para que disfrutes al máximo de tu desconexión.
        </p>
      </div>

      {/* Services Grid */}
      <div className="max-w-5xl mx-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-emerald"></div>
            <p className="text-gray-400 text-sm">Cargando catálogo de servicios...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-16 bg-red-950/10 border border-red-500/10 rounded-2xl max-w-md mx-auto p-8">
            <Info className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Error al cargar servicios</h3>
            <p className="text-gray-400 text-sm">
              {(error as any)?.message || 'Ocurrió un problema de comunicación con el servidor.'}
            </p>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/30 border border-white/5 rounded-2xl max-w-md mx-auto p-8">
            <Sparkles className="w-12 h-12 text-accent-emerald mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No hay servicios disponibles</h3>
            <p className="text-gray-400 text-sm">
              Pronto agregaremos nuevas experiencias para tu estadía.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service) => (
              <ServicioCard key={service.id} servicio={service} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default ServiciosPage;
