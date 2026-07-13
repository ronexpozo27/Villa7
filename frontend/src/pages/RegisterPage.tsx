import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../hooks/useAuth';
import { UserPlus, User, KeyRound, Mail, AlertTriangle, Eye, EyeOff } from 'lucide-react';

const registerSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder los 100 caracteres'),
  correo: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('El formato del correo electrónico no es válido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      await registerUser(data.nombre, data.correo, data.password);
      navigate('/');
    } catch (error: any) {
      setServerError(error.message || 'Ocurrió un error al registrar el usuario.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-dark px-4 py-12 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent-emerald/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-700/10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-2xl z-10 transition-all duration-300 hover:shadow-emerald-950/20">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block text-3xl font-bold font-heading text-gradient mb-2 tracking-tight">
            VILLA7
          </Link>
          <p className="text-gray-400 text-sm">Regístrate para crear tu cuenta y hacer reservaciones</p>
        </div>

        {serverError && (
          <div className="mb-6 p-4 bg-red-950/30 border border-red-500/30 rounded-lg flex items-start gap-3 text-red-200 text-sm animate-pulse">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Nombre Completo
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <User className="w-5 h-5" />
              </span>
              <input
                type="text"
                {...register('nombre')}
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:border-transparent transition-all duration-300 ${
                  errors.nombre ? 'border-red-500/50' : 'border-gray-800'
                }`}
                placeholder="Juan Pérez"
              />
            </div>
            {errors.nombre && (
              <p className="mt-1.5 text-xs text-red-400">{errors.nombre.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="email"
                {...register('correo')}
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:border-transparent transition-all duration-300 ${
                  errors.correo ? 'border-red-500/50' : 'border-gray-800'
                }`}
                placeholder="juan.perez@ejemplo.com"
              />
            </div>
            {errors.correo && (
              <p className="mt-1.5 text-xs text-red-400">{errors.correo.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <KeyRound className="w-5 h-5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                className={`w-full pl-10 pr-10 py-2.5 bg-slate-900/60 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:border-transparent transition-all duration-300 ${
                  errors.password ? 'border-red-500/50' : 'border-gray-800'
                }`}
                placeholder="Mínimo 8 caracteres"
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
              <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>
            )}
            <div className="mt-2 text-[10px] text-gray-500 space-y-0.5">
              <p>Requisitos de contraseña (RN-003):</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Mínimo 8 caracteres de longitud</li>
                <li>Al menos una letra mayúscula y una minúscula</li>
                <li>Al menos un número (0-9)</li>
              </ul>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-accent-emerald hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98] mt-6"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                <span>Registrarse</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="text-accent-emerald hover:underline font-medium">
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
};
