import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../hooks/useAuth';
import { LogIn, KeyRound, Mail, AlertTriangle, Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  correo: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('El formato del correo electrónico no es válido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      await login(data.correo, data.password);
      navigate('/');
    } catch (error: any) {
      setServerError(error.message || 'Credenciales inválidas o error de servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-dark px-4 py-12 relative overflow-hidden">
      {/* Background decorations for premium feel */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent-emerald/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-700/10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-2xl z-10 transition-all duration-300 hover:shadow-emerald-950/20">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block text-3xl font-bold font-heading text-gradient mb-2 tracking-tight">
            VILLA7
          </Link>
          <p className="text-gray-400 text-sm">Ingresa tus credenciales para acceder a tu cuenta</p>
        </div>

        {serverError && (
          <div className="mb-6 p-4 bg-red-950/30 border border-red-500/30 rounded-lg flex items-start gap-3 text-red-200 text-sm animate-pulse">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="email"
                {...register('correo')}
                className={`w-full pl-10 pr-4 py-3 bg-slate-900/60 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:border-transparent transition-all duration-300 ${
                  errors.correo ? 'border-red-500/50' : 'border-gray-800'
                }`}
                placeholder="ejemplo@correo.com"
              />
            </div>
            {errors.correo && (
              <p className="mt-2 text-xs text-red-400">{errors.correo.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <KeyRound className="w-5 h-5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                className={`w-full pl-10 pr-10 py-3 bg-slate-900/60 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:border-transparent transition-all duration-300 ${
                  errors.password ? 'border-red-500/50' : 'border-gray-800'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-2 text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-accent-emerald hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98]"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Iniciar Sesión</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400">
          ¿No tienes una cuenta?{' '}
          <Link to="/register" className="text-accent-emerald hover:underline font-medium">
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
};
