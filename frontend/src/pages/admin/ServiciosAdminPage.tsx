import React, { useEffect, useState } from 'react';
import { useServicios } from '../../hooks/useServicios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Servicio } from '../../types';
import { ShieldAlert, Plus, Edit2, X, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

const serviceSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  descripcion: z
    .string()
    .min(1, 'La descripción es obligatoria'),
  precio: z.number().min(0, 'El precio debe ser un número igual o mayor a 0'),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

export const ServiciosAdminPage: React.FC = () => {
  const {
    adminServices,
    isAdminLoading,
    fetchAdminServices,
    createService,
    updateService,
    toggleStatus,
  } = useServicios();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Servicio | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Filtros de estado
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Activos' | 'Inactivos'>('Todos');

  // Confirmar cambio de estado
  const [confirmingService, setConfirmingService] = useState<Servicio | null>(null);
  const [statusMotive, setStatusMotive] = useState('');

  // Toast notifications
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
  });

  useEffect(() => {
    fetchAdminServices();
  }, []);

  useEffect(() => {
    if (isToastOpen) {
      const timer = setTimeout(() => setIsToastOpen(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isToastOpen]);

  const handleOpenCreate = () => {
    setEditingService(null);
    setSubmitError(null);
    reset({
      nombre: '',
      descripcion: '',
      precio: 10,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service: Servicio) => {
    setEditingService(service);
    setSubmitError(null);
    reset({
      nombre: service.nombre,
      descripcion: service.descripcion,
      precio: service.precio,
    });
    setIsModalOpen(true);
  };

  const handleOpenConfirmStatus = (service: Servicio) => {
    setConfirmingService(service);
    setStatusMotive('');
  };

  const handleToggleStatus = async () => {
    if (!confirmingService) return;
    try {
      const res = await toggleStatus({
        id: confirmingService.id,
        activo: !confirmingService.activo,
        motivo: statusMotive.trim() || undefined
      });
      setToastType('success');
      setToastMessage(res?.message || `Servicio ${!confirmingService.activo ? 'activado' : 'desactivado'} correctamente.`);
      setIsToastOpen(true);
      setConfirmingService(null);
      fetchAdminServices();
    } catch (e: any) {
      setToastType('error');
      setToastMessage(e.message || 'No se pudo cambiar el estado del servicio.');
      setIsToastOpen(true);
    }
  };

  const onSubmit = async (data: ServiceFormData) => {
    setSubmitError(null);
    try {
      if (editingService) {
        await updateService({ id: editingService.id, data });
      } else {
        await createService(data);
      }
      setIsModalOpen(false);
      fetchAdminServices();
    } catch (e: any) {
      setSubmitError(e.message || 'Ocurrió un error al guardar el servicio.');
    }
  };


  const filteredServices = adminServices.filter(service => {
    if (statusFilter === 'Activos') return service.activo;
    if (statusFilter === 'Inactivos') return !service.activo;
    return true;
  });

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between border-b border-white/5 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-accent-emerald" />
          <h2 className="text-2xl font-bold font-heading text-white">Gestionar Servicios Adicionales</h2>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 bg-accent-emerald hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-500/10 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Servicio</span>
        </button>
      </div>

      {/* Filtros de Estado */}
      <div className="flex gap-2 bg-slate-950/20 p-1 rounded-xl border border-white/5 w-fit">
        {(['Todos', 'Activos', 'Inactivos'] as const).map((filterOpt) => (
          <button
            key={filterOpt}
            onClick={() => setStatusFilter(filterOpt)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              statusFilter === filterOpt
                ? 'bg-accent-emerald text-white shadow-md shadow-emerald-500/10'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {filterOpt}
          </button>
        ))}
      </div>

      {/* Table list */}
      {isAdminLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-emerald"></div>
          <p className="text-gray-400 text-sm">Cargando servicios...</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/30 border border-white/5 rounded-2xl p-8 max-w-md mx-auto text-gray-500">
          No hay servicios que coincidan con el filtro seleccionado.
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden shadow-xl border border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm text-gray-300">
              <thead>
                <tr className="bg-slate-950/40 text-gray-400 border-b border-white/5 font-semibold">
                  <th className="p-4 pl-6 uppercase text-xs tracking-wider">Servicio</th>
                  <th className="p-4 uppercase text-xs tracking-wider">Precio</th>
                  <th className="p-4 uppercase text-xs tracking-wider">Estado</th>
                  <th className="p-4 pr-6 uppercase text-xs tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-slate-900/10">
                {filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-white/2 transition-colors duration-150">
                    <td className="p-4 pl-6">
                      <p className="font-semibold text-white">{service.nombre}</p>
                      <p className="text-gray-500 text-xs line-clamp-1 mt-0.5">{service.descripcion}</p>
                    </td>
                    <td className="p-4 font-semibold text-white">
                      {service.precio === 0 ? 'Incluido' : formatCurrency(service.precio)}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        service.activo
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                      }`}>
                        {service.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(service)}
                        className="p-2 bg-white/5 border border-white/10 hover:border-accent-emerald hover:bg-emerald-950/20 text-gray-300 hover:text-accent-emerald rounded-lg transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenConfirmStatus(service)}
                        className={`px-3 py-2 border rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          service.activo
                            ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                        }`}
                      >
                        {service.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel p-8 rounded-2xl max-w-lg w-full shadow-2xl border border-white/10 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-xl font-bold font-heading text-white">
                {editingService ? 'Editar Servicio' : 'Registrar Nuevo Servicio'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white p-1.5 rounded-lg bg-white/5 border border-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitError && (
              <div className="p-4 bg-red-950/30 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-200 text-sm">
                <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                  Nombre del Servicio
                </label>
                <input
                  type="text"
                  {...register('nombre')}
                  className={`w-full px-4 py-2.5 bg-slate-900/60 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:border-transparent transition-all ${
                    errors.nombre ? 'border-red-500/50' : 'border-gray-800'
                  }`}
                  placeholder="Ej. Paseo a Caballo"
                />
                {errors.nombre && <p className="mt-1 text-xs text-red-400">{errors.nombre.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                  Descripción
                </label>
                <textarea
                  rows={3}
                  {...register('descripcion')}
                  className={`w-full px-4 py-2.5 bg-slate-900/60 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:border-transparent transition-all ${
                    errors.descripcion ? 'border-red-500/50' : 'border-gray-800'
                  }`}
                  placeholder="Detalles de la experiencia o actividad..."
                />
                {errors.descripcion && <p className="mt-1 text-xs text-red-400">{errors.descripcion.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                  Precio del Servicio
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('precio', { valueAsNumber: true })}
                  className={`w-full px-4 py-2.5 bg-slate-900/60 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:border-transparent transition-all ${
                    errors.precio ? 'border-red-500/50' : 'border-gray-800'
                  }`}
                />
                {errors.precio && <p className="mt-1 text-xs text-red-400">{errors.precio.message}</p>}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-semibold rounded-lg bg-accent-emerald hover:bg-emerald-500 text-white transition-all cursor-pointer shadow-md shadow-emerald-500/10 active:scale-[0.98]"
                >
                  {editingService ? 'Guardar Cambios' : 'Registrar Servicio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación de Estado */}
      {confirmingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel p-6 rounded-2xl max-w-md w-full shadow-2xl border border-white/10 flex flex-col gap-4">
            <h3 className="text-lg font-bold font-heading text-white">
              ¿Estás seguro de que deseas {confirmingService.activo ? 'desactivar' : 'activar'} el servicio "{confirmingService.nombre}"?
            </h3>
            <p className="text-gray-400 text-xs">
              {confirmingService.activo 
                ? 'Al desactivarlo, no se podrá añadir a nuevas reservas. Las reservas que ya lo posean contratado mantendrán el servicio de forma histórica.'
                : 'Al activarlo, volverá a estar disponible para contratación pública.'}
            </p>
            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Motivo del cambio de estado
              </label>
              <textarea
                value={statusMotive}
                onChange={(e) => setStatusMotive(e.target.value)}
                placeholder="Indique el motivo..."
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-900/60 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:border-transparent transition-all"
              />
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-white/5 mt-2">
              <button
                type="button"
                onClick={() => setConfirmingService(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleToggleStatus}
                className={`px-4 py-2 text-xs font-semibold rounded-lg text-white transition-all cursor-pointer shadow-md ${
                  confirmingService.activo 
                    ? 'bg-red-500 hover:bg-red-600 shadow-red-500/10' 
                    : 'bg-accent-emerald hover:bg-emerald-500 shadow-emerald-500/10'
                }`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {isToastOpen && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-fade-in ${
          toastType === 'success' 
            ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200' 
            : 'bg-red-950/90 border-red-500/30 text-red-200'
        }`}>
          <ShieldAlert className={`w-5 h-5 ${toastType === 'success' ? 'text-emerald-400' : 'text-red-400'}`} />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
export default ServiciosAdminPage;

