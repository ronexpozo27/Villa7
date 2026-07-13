import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut, Menu, X, User, Calendar, Settings, Home, Compass, Info } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const activeClassName = "text-accent-emerald border-b-2 border-accent-emerald pb-1 font-semibold";
  const inactiveClassName = "text-gray-300 hover:text-white transition-colors duration-200 pb-1";

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-white/5 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold font-heading text-gradient tracking-wider">
              VILLA7
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-8 items-center">
            {usuario?.rol === 'Administrador' ? (
              <>
                {/* Admin Menu */}
                <NavLink to="/admin" end className={({ isActive }) => isActive ? activeClassName : inactiveClassName}>
                  Panel de Control
                </NavLink>
                <NavLink to="/admin/habitaciones" className={({ isActive }) => isActive ? activeClassName : inactiveClassName}>
                  Habitaciones
                </NavLink>
                <NavLink to="/admin/servicios" className={({ isActive }) => isActive ? activeClassName : inactiveClassName}>
                  Servicios
                </NavLink>
                <NavLink to="/admin/reservas" className={({ isActive }) => isActive ? activeClassName : inactiveClassName}>
                  Reservas
                </NavLink>
                <NavLink to="/admin/clientes" className={({ isActive }) => isActive ? activeClassName : inactiveClassName}>
                  Clientes
                </NavLink>
              </>
            ) : (
              <>
                {/* Public / Customer Menu */}
                <NavLink to="/" end className={({ isActive }) => isActive ? activeClassName : inactiveClassName}>
                  Inicio
                </NavLink>
                <NavLink to="/habitaciones" className={({ isActive }) => isActive ? activeClassName : inactiveClassName}>
                  Habitaciones
                </NavLink>
                <NavLink to="/servicios" className={({ isActive }) => isActive ? activeClassName : inactiveClassName}>
                  Servicios
                </NavLink>
                {usuario && (
                  <NavLink to="/mis-reservas" className={({ isActive }) => isActive ? activeClassName : inactiveClassName}>
                    Mis Reservas
                  </NavLink>
                )}
              </>
            )}
          </div>

          {/* Action Button Section (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {usuario ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-200">
                  <User className="w-3.5 h-3.5 text-accent-emerald" />
                  <span>Hola, <strong className="font-semibold text-white">{usuario.nombre}</strong></span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-950/40 border border-red-500/20 text-red-200 hover:bg-red-500 hover:text-white transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Salir</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-accent-emerald hover:bg-emerald-500 text-white transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10 active:scale-[0.98]"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>

          {/* Hamburger Menu Icon (Mobile) */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-400 hover:text-white focus:outline-none p-2 rounded-lg bg-white/5 border border-white/5"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer/Menu */}
      {isOpen && (
        <div className="md:hidden glass-panel border-t border-white/5 px-2 pt-2 pb-4 space-y-1">
          {usuario?.rol === 'Administrador' ? (
            <>
              {/* Admin Mobile Links */}
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Settings className="w-5 h-5 text-accent-emerald" />
                <span>Panel de Control</span>
              </Link>
              <Link
                to="/admin/habitaciones"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Home className="w-5 h-5 text-accent-emerald" />
                <span>Habitaciones</span>
              </Link>
              <Link
                to="/admin/servicios"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Compass className="w-5 h-5 text-accent-emerald" />
                <span>Servicios</span>
              </Link>
              <Link
                to="/admin/reservas"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Calendar className="w-5 h-5 text-accent-emerald" />
                <span>Reservas</span>
              </Link>
              <Link
                to="/admin/clientes"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <User className="w-5 h-5 text-accent-emerald" />
                <span>Clientes</span>
              </Link>
            </>
          ) : (
            <>
              {/* Public/Customer Mobile Links */}
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Home className="w-5 h-5 text-accent-emerald" />
                <span>Inicio</span>
              </Link>
              <Link
                to="/habitaciones"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Compass className="w-5 h-5 text-accent-emerald" />
                <span>Habitaciones</span>
              </Link>
              <Link
                to="/servicios"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Info className="w-5 h-5 text-accent-emerald" />
                <span>Servicios</span>
              </Link>
              {usuario && (
                <Link
                  to="/mis-reservas"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Calendar className="w-5 h-5 text-accent-emerald" />
                  <span>Mis Reservas</span>
                </Link>
              )}
            </>
          )}

          {/* Mobile Login / User Profile & Logout */}
          <div className="pt-4 border-t border-white/5 mt-4">
            {usuario ? (
              <div className="space-y-3 px-4">
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <User className="w-5 h-5 text-accent-emerald" />
                  <span>Hola, <strong className="font-semibold text-white">{usuario.nombre}</strong></span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 px-4 text-sm font-semibold rounded-xl bg-red-950/40 border border-red-500/20 text-red-200 hover:bg-red-500 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            ) : (
              <div className="px-4">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-3 px-4 text-center font-semibold rounded-xl bg-accent-emerald hover:bg-emerald-500 text-white transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10"
                >
                  Iniciar Sesión
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
