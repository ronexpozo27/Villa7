import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CalendarRange, Search, Compass, Shield, Heart, ArrowRight } from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const todayStr = new Date().toISOString().split('T')[0];

  const [fechaEntrada, setFechaEntrada] = useState('');
  const [fechaSalida, setFechaSalida] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fechaEntrada || !fechaSalida) {
      setErrorMsg('Debes ingresar ambas fechas.');
      return;
    }

    const entrada = new Date(fechaEntrada);
    const salida = new Date(fechaSalida);

    if (entrada < new Date(todayStr)) {
      setErrorMsg('La entrada no puede ser en el pasado.');
      return;
    }

    if (salida <= entrada) {
      setErrorMsg('La salida debe ser posterior a la entrada.');
      return;
    }

    navigate(`/habitaciones?fechaEntrada=${fechaEntrada}&fechaSalida=${fechaSalida}`);
  };

  return (
    <div className="space-y-20 py-8 relative">
      {/* Premium Hero Section */}
      <div className="relative text-center max-w-4xl mx-auto space-y-6 pt-8 pb-4">
        <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-accent-emerald text-xs font-semibold uppercase tracking-wider border border-emerald-500/20">
          Escapada Rural Exclusiva
        </span>
        <h1 className="text-5xl sm:text-7xl font-extrabold font-heading text-gradient tracking-tight leading-none">
          Villa7 Casa de Campo
        </h1>
        <p className="text-gray-400 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed">
          Descubre el balance perfecto entre confort y naturaleza en nuestras cabañas rústicas premium. Reserva tu estadía y actividades adicionales hoy mismo.
        </p>
      </div>

      {/* Quick Search Form */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-4xl mx-auto shadow-2xl relative z-10 border border-white/10">
        <form onSubmit={handleQuickSearch} className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
          <div className="space-y-2 text-left">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <CalendarRange className="w-3.5 h-3.5 text-accent-emerald" />
              <span>Fecha de Entrada</span>
            </label>
            <input
              type="date"
              min={todayStr}
              value={fechaEntrada}
              onChange={(e) => setFechaEntrada(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/60 border border-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-2 text-left">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <CalendarRange className="w-3.5 h-3.5 text-accent-emerald" />
              <span>Fecha de Salida</span>
            </label>
            <input
              type="date"
              min={fechaEntrada || todayStr}
              value={fechaSalida}
              onChange={(e) => setFechaSalida(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/60 border border-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:border-transparent transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-accent-emerald hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
          >
            <Search className="w-4 h-4" />
            <span>Buscar Cabañas</span>
          </button>
        </form>

        {errorMsg && (
          <p className="text-xs text-red-400 mt-4 text-left font-medium animate-pulse">{errorMsg}</p>
        )}
      </div>

      {/* Feature Grid / Key selling points */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto pt-10">
        <div className="glass-card p-8 rounded-2xl border border-white/5 space-y-4 text-center hover:border-emerald-500/10 transition-all duration-300">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-accent-emerald mx-auto border border-emerald-500/20">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold font-heading text-white">Naturaleza Pura</h3>
          <p className="text-gray-400 text-xs leading-relaxed">
            Rodeado de bosques autóctonos y vistas panorámicas. Disfruta de la tranquilidad del campo.
          </p>
        </div>

        <div className="glass-card p-8 rounded-2xl border border-white/5 space-y-4 text-center hover:border-emerald-500/10 transition-all duration-300">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-accent-emerald mx-auto border border-emerald-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold font-heading text-white">Reserva Confiable</h3>
          <p className="text-gray-400 text-xs leading-relaxed">
            Bloqueo atómico de disponibilidad en tiempo real para evitar cualquier doble reservación.
          </p>
        </div>

        <div className="glass-card p-8 rounded-2xl border border-white/5 space-y-4 text-center hover:border-emerald-500/10 transition-all duration-300">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-accent-emerald mx-auto border border-emerald-500/20">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold font-heading text-white">Experiencia Premium</h3>
          <p className="text-gray-400 text-xs leading-relaxed">
            Servicios complementarios de paseos a caballo, fogatas guiadas y canastas gourmet locales.
          </p>
        </div>
      </div>

      {/* Hero CTA Banner */}
      <div className="glass-panel p-8 sm:p-12 rounded-3xl max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10 relative overflow-hidden bg-gradient-to-br from-slate-900 to-emerald-950/20">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">¿Listo para desconectarte?</h3>
          <p className="text-gray-400 text-sm max-w-md">
            Mira nuestro catálogo de cabañas disponibles hoy mismo. Reservas atómicas instantáneas.
          </p>
        </div>
        <Link
          to="/habitaciones"
          className="px-8 py-4 bg-accent-emerald hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-2 transition-all duration-300 shadow-xl shadow-emerald-500/20 active:scale-[0.98] shrink-0"
        >
          <span>Ver Todas las Cabañas</span>
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
};
export default HomePage;
