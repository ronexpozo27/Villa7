import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useHabitacionDetails } from '../hooks/useHabitaciones';
import { useServicios } from '../hooks/useServicios';
import { useReservas } from '../hooks/useReservas';
import { Tag, ShieldAlert, CheckCircle2, ChevronLeft, CalendarRange, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../utils/format';

export const ReservaPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const paramEntrada = searchParams.get('fechaEntrada') || '';
  const paramSalida = searchParams.get('fechaSalida') || '';

  const todayStr = new Date().toISOString().split('T')[0];

  // Forms states
  const [fechaEntrada, setFechaEntrada] = useState(paramEntrada);
  const [fechaSalida, setFechaSalida] = useState(paramSalida);
  const [selectedServicios, setSelectedServicios] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // APIs Hooks
  const { data: room, isLoading: isRoomLoading, isError: isRoomError } = useHabitacionDetails(roomId || '');
  const { services, isLoading: isServicesLoading } = useServicios();
  const { crearReserva, isCreando } = useReservas();

  // Reactive calculations
  const [noches, setNoches] = useState(0);
  const [costoHabitacion, setCostoHabitacion] = useState(0);
  const [costoServicios, setCostoServicios] = useState(0);
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    if (fechaEntrada && fechaSalida) {
      const entrada = new Date(fechaEntrada);
      const salida = new Date(fechaSalida);

      if (salida > entrada) {
        const diffTime = Math.abs(salida.getTime() - entrada.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setNoches(diffDays);

        if (room) {
          setCostoHabitacion(diffDays * room.precioPorNoche);
        }
      } else {
        setNoches(0);
        setCostoHabitacion(0);
      }
    } else {
      setNoches(0);
      setCostoHabitacion(0);
    }
  }, [fechaEntrada, fechaSalida, room]);

  useEffect(() => {
    let sum = 0;
    selectedServicios.forEach((id) => {
      const serviceObj = services.find((s) => s.id === id);
      if (serviceObj) {
        sum += serviceObj.precio;
      }
    });
    setCostoServicios(sum);
  }, [selectedServicios, services]);

  useEffect(() => {
    setTotalCost(costoHabitacion + costoServicios);
  }, [costoHabitacion, costoServicios]);

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServicios((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    );
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setApiError(null);

    // Initial check
    if (!fechaEntrada || !fechaSalida) {
      setValidationError('Por favor completa las fechas de entrada y salida.');
      return;
    }

    const entradaDate = new Date(fechaEntrada);
    const salidaDate = new Date(fechaSalida);

    if (entradaDate < new Date(todayStr)) {
      setValidationError('La fecha de entrada no puede ser anterior al día de hoy.');
      return;
    }

    if (salidaDate <= entradaDate) {
      setValidationError('La fecha de salida debe ser posterior a la fecha de entrada.');
      return;
    }

    if (!roomId) return;

    try {
      await crearReserva({
        habitacionId: roomId,
        fechaEntrada,
        fechaSalida,
        serviciosIds: selectedServicios,
      });
      setShowSuccessModal(true);
    } catch (err: any) {
      setApiError(err.message || 'Ocurrió un error al intentar crear la reservación.');
    }
  };

  if (isRoomLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-emerald"></div>
        <p className="text-gray-400 text-sm">Cargando detalles de cabaña...</p>
      </div>
    );
  }

  if (isRoomError || !room) {
    return (
      <div className="text-center py-16 bg-red-950/10 border border-red-500/10 rounded-2xl max-w-md mx-auto p-8">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Error al recuperar habitación</h3>
        <p className="text-gray-400 text-sm mb-4">No pudimos cargar la cabaña seleccionada.</p>
        <Link to="/habitaciones" className="text-accent-emerald hover:underline text-sm font-semibold">
          Volver a Habitaciones
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {/* Back CTA Button */}
      <div>
        <Link
          to="/habitaciones"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Volver al Catálogo</span>
        </Link>
      </div>

      <div className="border-b border-white/5 pb-4">
        <h1 className="text-3xl font-extrabold font-heading text-gradient tracking-tight">
          Confirmación de Estadía
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Revisa y configura las opciones de tu reserva en <strong className="text-white">{room.nombre}</strong>.
        </p>
      </div>

      {/* Main Form Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form Selection Area */}
        <form onSubmit={handleBookingSubmit} className="lg:col-span-2 space-y-6">
          {/* Validation Alert */}
          {validationError && (
            <div className="p-4 bg-red-950/30 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-200 text-sm">
              <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {/* API Error Alert */}
          {apiError && (
            <div className="p-4 bg-red-950/30 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-200 text-sm">
              <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Date Picker Form Panel */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 font-semibold text-sm border-b border-white/5 pb-3">
              <CalendarRange className="w-4 h-4 text-accent-emerald" />
              <span>Configuración de Fechas</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">
                  Check-in (Entrada)
                </label>
                <input
                  type="date"
                  min={todayStr}
                  required
                  value={fechaEntrada}
                  onChange={(e) => setFechaEntrada(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900/60 border border-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">
                  Check-out (Salida)
                </label>
                <input
                  type="date"
                  min={fechaEntrada || todayStr}
                  required
                  value={fechaSalida}
                  onChange={(e) => setFechaSalida(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900/60 border border-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Services Selector Form Panel */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 font-semibold text-sm border-b border-white/5 pb-3">
              <Tag className="w-4 h-4 text-accent-emerald" />
              <span>Añadir Servicios Adicionales (Opcional)</span>
            </div>

            {isServicesLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-accent-emerald"></div>
              </div>
            ) : services.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No hay servicios adicionales registrados.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => handleServiceToggle(service.id)}
                    className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none flex items-start gap-3 ${
                      selectedServicios.includes(service.id)
                        ? 'border-emerald-500/50 bg-emerald-950/20'
                        : 'border-white/5 bg-slate-950/20 hover:border-white/10 hover:bg-slate-950/40'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedServicios.includes(service.id)}
                      onChange={() => {}} // handled by click container
                      className="mt-1 rounded text-accent-emerald focus:ring-accent-emerald border-white/10"
                    />
                    <div className="flex-grow space-y-1">
                      <div className="flex items-center justify-between gap-1 text-sm font-semibold">
                        <span className={selectedServicios.includes(service.id) ? 'text-accent-emerald' : 'text-white'}>
                          {service.nombre}
                        </span>
                        <span className="text-xs text-gray-400">{formatCurrency(service.precio)}</span>
                      </div>
                      <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">
                        {service.descripcion}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Right Financial Summary Side Panel */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col h-full justify-between">
            <div className="space-y-6">
              <h3 className="text-lg font-bold font-heading text-white border-b border-white/5 pb-3">
                Resumen de Compra
              </h3>

              {/* Room Stats */}
              <div className="space-y-4 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span className="text-gray-400">Cabaña:</span>
                  <span className="font-semibold text-white">{room.nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tarifa / noche:</span>
                  <span className="font-semibold text-white">{formatCurrency(room.precioPorNoche)}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-4">
                  <span className="text-gray-400">Estadía total:</span>
                  <span className="font-semibold text-white">
                    {noches > 0 ? `${noches} ${noches === 1 ? 'Noche' : 'Noches'}` : 'Fechas no seleccionadas'}
                  </span>
                </div>
              </div>

              {/* Booking Ledger */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Costo Habitación:</span>
                  <span className="text-white font-medium">{formatCurrency(costoHabitacion)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Servicios adicionales:</span>
                  <span className="text-white font-medium">{formatCurrency(costoServicios)}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold border-t border-white/10 pt-4">
                  <span className="text-white">Total Final:</span>
                  <span className="text-accent-emerald text-lg">{formatCurrency(totalCost)}</span>
                </div>
              </div>
            </div>

            {/* Confirm CTA */}
            <div className="pt-6 mt-6 border-t border-white/5">
              <button
                disabled={isCreando || noches <= 0}
                onClick={handleBookingSubmit}
                className="w-full py-3.5 px-4 bg-accent-emerald hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer shadow-lg shadow-emerald-500/10 active:scale-[0.98]"
              >
                {isCreando ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <>
                    <span>Confirmar Reservación</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              {noches <= 0 && (
                <p className="text-[10px] text-gray-500 mt-2 text-center">
                  * Selecciona un rango de fechas válido para habilitar la confirmación.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal Overlay */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel p-8 rounded-2xl max-w-md w-full text-center space-y-6 shadow-2xl border border-emerald-500/20">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-accent-emerald mx-auto border border-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold font-heading text-white">¡Reservación Creada con éxito!</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Tu solicitud ha sido guardada en estado <strong className="text-yellow-400">Pendiente</strong>. El administrador del establecimiento confirmará tu estadía en breve.
              </p>
            </div>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                navigate('/mis-reservas');
              }}
              className="w-full py-3 px-4 bg-accent-emerald hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all cursor-pointer"
            >
              Ir a Mis Reservas
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default ReservaPage;
