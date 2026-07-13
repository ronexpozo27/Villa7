import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export const Layout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-bg-dark text-white font-sans selection:bg-accent-emerald/30 selection:text-white">
      {/* Decorative gradient lights */}
      <div className="absolute top-0 right-0 w-[40%] h-[30%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[45%] h-[35%] rounded-full bg-accent-emerald/5 blur-[140px] pointer-events-none"></div>

      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <Outlet />
      </main>

      <footer className="border-t border-white/5 bg-slate-950/20 backdrop-blur-sm py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <span className="text-lg font-bold font-heading text-gradient tracking-wide">
              VILLA7
            </span>
            <p className="text-gray-500 text-xs mt-1">Experiencia premium en armonía con la naturaleza.</p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-gray-500 text-xs">
              &copy; {new Date().getFullYear()} Villa7 S.A. Todos los derechos reservados.
            </p>
            <p className="text-[10px] text-gray-600 mt-0.5">Desarrollado bajo metodología Spec-Driven Development (SDD).</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
