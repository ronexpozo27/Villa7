import React, { useState } from 'react';
import { useHabitaciones } from '../hooks/useHabitaciones';
import { HabitacionCard } from '../components/HabitacionCard';
import { RoomDetailsModal } from '../components/RoomDetailsModal';
import { Search, CalendarRange, SlidersHorizontal, Info } from 'lucide-react';
import type { Habitacion } from '../types';

export const HabitacionesPage: React.FC = () => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [fechaEntrada, setFechaEntrada] = useState('');
  const [fechaSalida, setFechaSalida] = useState('');
  const [filterEntrada, setFilterEntrada] = useState('');
  const [filterSalida, setFilterSalida] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // State for detail modal
  const [selectedRoomForDetails, setSelectedRoomForDetails] = useState<Habitacion | null>(null);

  const { rooms, isLoading, isError, error } = useHabitaciones(filterEntrada, filterSalida);

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (fechaEntrada || fechaSalida) {
      if (!fechaEntrada || !fechaSalida) {
        setErrorMsg('Debes especificar ambas fechas (Entrada y Salida) para filtrar la disponibilidad.');
        return;
      }

      const entradaDate = new Date(fechaEntrada);
      const salidaDate = new Date(fechaSalida);

      if (entradaDate < new Date(todayStr)) {
        setErrorMsg('La fecha de entrada no puede ser anterior al día de hoy.');
        return;
      }

      if (salidaDate <= entradaDate) {
        setErrorMsg('La fecha de salida debe ser posterior a la fecha de entrada.');
        return;
      }
    }

    setFilterEntrada(fechaEntrada);
    setFilterSalida(fechaSalida);
  };

  const handleClearFilter = () => {
    setFechaEntrada('');
    setFechaSalida('');
    setFilterEntrada('');
    setFilterSalida('');
    setErrorMsg(null);
  };

  return (
    <div className="space-y-10">
      {/* Title Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold font-heading text-gradient tracking-tight">
          Nuestras Habitaciones
        </h1>
        <p className="text-gray-400 text-base sm:text-lg">
          Explora y reserva nuestras exclusivas cabañas rústicas de campo. Elige las fechas de tu estadía para consultar la disponibilidad en tiempo real.
        </p>
      </div>

      {/* Filter Form Panel */}
      <div className="glass-panel p-6 rounded-2xl max-w-4xl mx-auto">
        <form onSubmit={handleApplyFilter} className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-white font-semibold text-sm mb-2">
            <SlidersHorizontal className="w-4 h-4 text-accent-emerald" />
            <span>Filtrar por Disponibilidad</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                Fecha de Entrada
              </label>
              <input
                type="date"
                min={todayStr}
                value={fechaEntrada}
                onChange={(e) => setFechaEntrada(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/80 border border-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                Fecha de Salida
              </label>
              <input
                type="date"
                min={fechaEntrada || todayStr}
                value={fechaSalida}
                onChange={(e) => setFechaSalida(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/80 border border-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:border-transparent transition-all"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="text-xs text-red-400 bg-red-950/20 border border-red-500/20 p-3 rounded-lg flex items-center gap-2 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-2">
            {(filterEntrada || filterSalida) && (
              <button
                type="button"
                onClick={handleClearFilter}
                className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                Limpiar Filtros
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-semibold rounded-lg bg-accent-emerald hover:bg-emerald-500 text-white transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-500/10 active:scale-[0.98]"
            >
              <Search className="w-4 h-4" />
              <span>Consultar Disponibilidad</span>
            </button>
          </div>
        </form>
      </div>

      {/* Filter Status Badge */}
      {(filterEntrada && filterSalida) && (
        <div className="max-w-4xl mx-auto flex items-center gap-2 text-xs bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 px-4 py-3 rounded-xl">
          <CalendarRange className="w-4 h-4 text-accent-emerald shrink-0" />
          <span>
            Mostrando habitaciones disponibles desde el <strong>{filterEntrada}</strong> hasta el <strong>{filterSalida}</strong>.
          </span>
        </div>
      )}

      {/* Rooms Listing Grid */}
      <div className="max-w-7xl mx-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-emerald"></div>
            <p className="text-gray-400 text-sm">Consultando catálogo de habitaciones...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-16 bg-red-950/10 border border-red-500/10 rounded-2xl max-w-md mx-auto p-8">
            <Info className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Error al cargar habitaciones</h3>
            <p className="text-gray-400 text-sm mb-4">
              {(error as any)?.message || 'Ocurrió un problema de comunicación con el servidor.'}
            </p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/30 border border-white/5 rounded-2xl max-w-md mx-auto p-8">
            <Info className="w-12 h-12 text-accent-emerald mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No hay habitaciones disponibles</h3>
            <p className="text-gray-400 text-sm">
              {filterEntrada
                ? 'No encontramos cabañas disponibles para el rango de fechas seleccionado. Intenta con otras fechas.'
                : 'Actualmente no hay habitaciones registradas en el catálogo.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room) => (
              <HabitacionCard
                key={room.id}
                habitacion={room}
                fechaEntrada={filterEntrada}
                fechaSalida={filterSalida}
                onOpenDetails={(r) => setSelectedRoomForDetails(r)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedRoomForDetails && (
        <RoomDetailsModal
          room={selectedRoomForDetails}
          onClose={() => setSelectedRoomForDetails(null)}
          fechaEntrada={filterEntrada}
          fechaSalida={filterSalida}
        />
      )}
    </div>
  );
};
export default HabitacionesPage;
