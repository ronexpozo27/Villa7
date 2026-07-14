import React, { useEffect, useState } from 'react';
import { useHabitaciones } from '../../hooks/useHabitaciones';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Habitacion } from '../../types';
import {
  Plus,
  Edit2,
  X,
  Check,
  Trash2,
  UploadCloud,
  Sliders,
  ShieldAlert,
  Image as ImageIcon
} from "lucide-react";
import { formatCurrency } from '../../utils/format';


const roomSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  descripcion: z
    .string()
    .min(1, 'La descripción es obligatoria'),
  capacidadMax: z.number().int().positive('La capacidad debe ser un número entero mayor a 0'),
  precioPorNoche: z.number().positive('El precio debe ser un número positivo mayor a 0'),
  ubicacion: z.string().max(500, 'La ubicación no puede exceder 500 caracteres').optional().nullable().or(z.literal('')),
});

type RoomFormData = z.infer<typeof roomSchema>;

export const HabitacionesAdminPage: React.FC = () => {
  const {
    adminRooms,
    isAdminLoading,
    fetchAdminRooms,
    createRoom,
    updateRoom,
    toggleStatus,
    uploadImage,
    isUploadingImage,
    deleteImage,
    isDeletingImage,
    deleteRoom,
    isDeleting,
  } = useHabitaciones();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Habitacion | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [roomToDelete, setRoomToDelete] = useState<Habitacion | null>(null);

  // Filtros de estado
  const [statusFilter, setStatusFilter] = useState<'Todas' | 'Activas' | 'Inactivas'>('Todas');

  // Confirmar cambio de estado
  const [confirmingRoom, setConfirmingRoom] = useState<Habitacion | null>(null);
  const [statusMotive, setStatusMotive] = useState('');

  // Toast notifications
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Estados para la gestión de imágenes integrada
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [showConfirmOverwrite, setShowConfirmOverwrite] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
  });

  useEffect(() => {
    fetchAdminRooms();
  }, []);

  useEffect(() => {
    if (isToastOpen) {
      const timer = setTimeout(() => setIsToastOpen(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isToastOpen]);

  const handleOpenCreate = () => {
    setEditingRoom(null);
    setSubmitError(null);
    setImageFile(null);
    setImagePreview(null);
    setUploadError(null);
    setUploadSuccess(null);
    setShowConfirmOverwrite(false);
    reset({
      nombre: '',
      descripcion: '',
      capacidadMax: 2,
      precioPorNoche: 50,
      ubicacion: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (room: Habitacion) => {
    setEditingRoom(room);
    setSubmitError(null);
    setImageFile(null);
    setImagePreview(null);
    setUploadError(null);
    setUploadSuccess(null);
    setShowConfirmOverwrite(false);
    reset({
      nombre: room.nombre,
      descripcion: room.descripcion,
      capacidadMax: room.capacidadMax,
      precioPorNoche: room.precioPorNoche,
      ubicacion: room.ubicacion || '',
    });
    setIsModalOpen(true);
  };

  const handleOpenConfirmStatus = (room: Habitacion) => {
    setConfirmingRoom(room);
    setStatusMotive('');
  };

  const handleToggleStatus = async () => {
    if (!confirmingRoom) return;
    try {
      const res = await toggleStatus({
        id: confirmingRoom.id,
        activa: !confirmingRoom.activa,
        motivo: statusMotive.trim() || undefined
      });
      setToastType('success');
      setToastMessage(res?.message || `Cabaña ${!confirmingRoom.activa ? 'activada' : 'desactivada'} correctamente.`);
      setIsToastOpen(true);
      setConfirmingRoom(null);
      fetchAdminRooms();
    } catch (e: any) {
      setToastType('error');
      setToastMessage(e.message || 'No se pudo cambiar el estado de la cabaña.');
      setIsToastOpen(true);
    }
  };

  const handleDeleteRoom = async () => {
    if (!roomToDelete) return;
    try {
      await deleteRoom({ id: roomToDelete.id });
      setToastType('success');
      setToastMessage('Registro eliminado correctamente.');
      setIsToastOpen(true);
      setRoomToDelete(null);
      fetchAdminRooms();
    } catch (e: any) {
      setToastType('error');
      const apiMsg = e.response?.data?.message || e.message || 'No fue posible eliminar el registro.';
      setToastMessage(apiMsg);
      setIsToastOpen(true);
    }
  };

  const onSubmit = async (data: RoomFormData) => {
    setSubmitError(null);

    try {
      if (editingRoom) {
        await updateRoom({ id: editingRoom.id, data });
      } else {
        await createRoom(data);
      }
      setIsModalOpen(false);
      fetchAdminRooms();
    } catch (e: any) {
      setSubmitError(e.message || 'Ocurrió un error al guardar la habitación.');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file: File) => {
    setUploadError(null);
    setUploadSuccess(null);
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Formato no válido. Solo se admiten imágenes JPG, JPEG, PNG y WEBP.");
      return;
    }
    
    // 5 MB limit
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("El tamaño de la imagen excede el límite de 5 MB.");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));

    if (editingRoom?.imagenUrl) {
      setShowConfirmOverwrite(true);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleUploadImageIntegrated = async () => {
    if (!editingRoom || !imageFile) return;
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const updatedRoom = await uploadImage({ id: editingRoom.id, file: imageFile });
      setUploadSuccess("¡Imagen cargada correctamente!");
      setImageFile(null);
      setImagePreview(null);
      setShowConfirmOverwrite(false);
      
      // Actualizar el estado local para reflejar los campos del modal
      setEditingRoom(updatedRoom);
      fetchAdminRooms();
    } catch (err: any) {
      setUploadError(err.response?.data?.message || err.message || "Error al subir la imagen.");
    }
  };

  const handleDeleteImageIntegrated = async () => {
    if (!editingRoom) return;
    if (!window.confirm("¿Estás seguro de que deseas eliminar la imagen de esta cabaña?")) return;

    setUploadError(null);
    setUploadSuccess(null);

    try {
      const updatedRoom = await deleteImage(editingRoom.id);
      setUploadSuccess("¡Imagen eliminada correctamente!");
      
      // Actualizar el estado local
      setEditingRoom(updatedRoom);
      fetchAdminRooms();
    } catch (err: any) {
      setUploadError(err.response?.data?.message || err.message || "Error al eliminar la imagen.");
    }
  };

  const filteredRooms = adminRooms.filter(room => {
    if (statusFilter === 'Activas') return room.activa;
    if (statusFilter === 'Inactivas') return !room.activa;
    return true;
  });

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between border-b border-white/5 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <Sliders className="w-6 h-6 text-accent-emerald" />
          <h2 className="text-2xl font-bold font-heading text-white">Gestionar Habitaciones</h2>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 bg-accent-emerald hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-500/10 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Cabaña</span>
        </button>
      </div>

      {/* Filtros de Estado */}
      <div className="flex gap-2 bg-slate-950/20 p-1 rounded-xl border border-white/5 w-fit">
        {(['Todas', 'Activas', 'Inactivas'] as const).map((filterOpt) => (
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

      {/* Grid of rooms */}
      {isAdminLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-emerald"></div>
          <p className="text-gray-400 text-sm">Cargando habitaciones...</p>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/30 border border-white/5 rounded-2xl p-8 max-w-md mx-auto text-gray-500">
          No hay habitaciones que coincidan con el filtro seleccionado.
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden shadow-xl border border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm text-gray-300">
              <thead>
                <tr className="bg-slate-950/40 text-gray-400 border-b border-white/5 font-semibold">
                  <th className="p-4 pl-6 uppercase text-xs tracking-wider">Cabaña</th>
                  <th className="p-4 uppercase text-xs tracking-wider">Capacidad</th>
                  <th className="p-4 uppercase text-xs tracking-wider">Precio</th>
                  <th className="p-4 uppercase text-xs tracking-wider">Estado</th>
                  <th className="p-4 pr-6 uppercase text-xs tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-slate-900/10">
                {filteredRooms.map((room) => (
                  <tr key={room.id} className="hover:bg-white/2 transition-colors duration-150">
                    <td className="p-4 pl-6">
                      <p className="font-semibold text-white">{room.nombre}</p>
                      <p className="text-gray-500 text-xs line-clamp-1 mt-0.5">{room.descripcion}</p>
                      {room.ubicacion && (
                        <p className="text-accent-emerald text-[10px] mt-0.5 font-medium">{room.ubicacion}</p>
                      )}
                    </td>
                    <td className="p-4">{room.capacidadMax} personas</td>
                    <td className="p-4 font-semibold text-white">{formatCurrency(room.precioPorNoche)} / noche</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        room.activa
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {room.activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(room)}
                        className="p-2 bg-white/5 border border-white/10 hover:border-accent-emerald hover:bg-emerald-950/20 text-gray-300 hover:text-accent-emerald rounded-lg transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setRoomToDelete(room)}
                        disabled={room.activa}
                        className={`p-2 border rounded-lg transition-colors cursor-pointer ${
                          room.activa
                            ? 'opacity-40 cursor-not-allowed bg-white/5 border-white/5 text-gray-500'
                            : 'bg-white/5 border-white/10 hover:border-red-500 hover:bg-red-950/20 text-gray-300 hover:text-red-500'
                        }`}
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenConfirmStatus(room)}
                        className={`px-3 py-2 border rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          room.activa
                            ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                        }`}
                      >
                        {room.activa ? 'Desactivar' : 'Activar'}
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
          <div className={`glass-panel p-8 rounded-2xl ${editingRoom ? 'max-w-3xl' : 'max-w-lg'} w-full shadow-2xl border border-white/10 flex flex-col gap-6`}>
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-xl font-bold font-heading text-white">
                {editingRoom ? 'Editar Cabaña' : 'Registrar Nueva Cabaña'}
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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className={editingRoom ? "grid grid-cols-1 md:grid-cols-2 gap-8" : "space-y-4"}>
                
                {/* Columna Izquierda: Datos del Formulario */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                      Nombre de la Cabaña
                    </label>
                    <input
                      type="text"
                      {...register('nombre')}
                      className={`w-full px-4 py-2.5 bg-slate-900/60 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:border-transparent transition-all ${
                        errors.nombre ? 'border-red-500/50' : 'border-gray-800'
                      }`}
                      placeholder="Ej. Cabaña Los Pinos"
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
                      placeholder="Detalles sobre amenidades, ubicación..."
                    />
                    {errors.descripcion && <p className="mt-1 text-xs text-red-400">{errors.descripcion.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                      Ubicación (Texto descriptivo)
                    </label>
                    <input
                      type="text"
                      {...register('ubicacion')}
                      className={`w-full px-4 py-2.5 bg-slate-900/60 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:border-transparent transition-all ${
                        errors.ubicacion ? 'border-red-500/50' : 'border-gray-800'
                      }`}
                      placeholder="Ej. Sector Bosque de Pinos, Zona Alta"
                    />
                    {errors.ubicacion && <p className="mt-1 text-xs text-red-400">{errors.ubicacion.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                        Capacidad Máxima
                      </label>
                      <input
                        type="number"
                        {...register('capacidadMax', { valueAsNumber: true })}
                        className={`w-full px-4 py-2.5 bg-slate-900/60 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:border-transparent transition-all ${
                          errors.capacidadMax ? 'border-red-500/50' : 'border-gray-800'
                        }`}
                      />
                      {errors.capacidadMax && <p className="mt-1 text-xs text-red-400">{errors.capacidadMax.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                        Precio por Noche
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        {...register('precioPorNoche', { valueAsNumber: true })}
                        className={`w-full px-4 py-2.5 bg-slate-900/60 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:border-transparent transition-all ${
                          errors.precioPorNoche ? 'border-red-500/50' : 'border-gray-800'
                        }`}
                      />
                      {errors.precioPorNoche && <p className="mt-1 text-xs text-red-400">{errors.precioPorNoche.message}</p>}
                    </div>
                  </div>
                </div>

                {/* Columna Derecha: Gestión de Imagen (Solo Edición) */}
                {editingRoom && (
                  <div className="space-y-4 border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 md:pl-8 flex flex-col gap-4">
                    {/* Alertas de Imagen */}
                    {uploadError && (
                      <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-red-200 text-xs">
                        <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <span>{uploadError}</span>
                      </div>
                    )}

                    {uploadSuccess && (
                      <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl flex items-start gap-2.5 text-emerald-200 text-xs">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{uploadSuccess}</span>
                      </div>
                    )}

                    {/* Imagen Actual */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Imagen de la Cabaña</span>
                      <div className="h-32 w-full rounded-xl border border-white/5 bg-slate-950/40 relative flex items-center justify-center overflow-hidden">
                        {editingRoom.imagenUrl ? (
                          <>
                            <img
                              src={editingRoom.imagenUrl}
                              alt={editingRoom.nombre}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={handleDeleteImageIntegrated}
                              disabled={isDeletingImage || isUploadingImage}
                              className="absolute top-2.5 right-2.5 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors cursor-pointer shadow-lg disabled:opacity-50"
                              title="Eliminar Imagen"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <div className="text-gray-500 flex flex-col items-center gap-1 text-xs">
                            <ImageIcon className="w-6 h-6 opacity-40" />
                            <span>Sin imagen asignada</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Cargar Nueva Imagen */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Cambiar Imagen</span>
                      
                      <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        className={`relative border border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all min-h-[90px] ${
                          dragActive 
                            ? 'border-accent-emerald bg-emerald-950/10' 
                            : 'border-white/10 bg-slate-900/20 hover:bg-white/2'
                        }`}
                      >
                        <input
                          type="file"
                          id="integrated-image-input"
                          onChange={handleFileChange}
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                        />
                        
                        {imagePreview ? (
                          <div className="w-full flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-16 rounded overflow-hidden border border-white/10 shrink-0">
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                              </div>
                              <span className="text-xs text-gray-300 font-medium truncate max-w-[120px]">{imageFile?.name}</span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={handleUploadImageIntegrated}
                                disabled={isUploadingImage}
                                className="px-2.5 py-1.5 bg-accent-emerald hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow cursor-pointer active:scale-95 disabled:opacity-50"
                              >
                                {isUploadingImage ? 'Subiendo...' : 'Subir'}
                              </button>
                              <button
                                type="button"
                                onClick={() => { setImageFile(null); setImagePreview(null); setShowConfirmOverwrite(false); }}
                                className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label htmlFor="integrated-image-input" className="cursor-pointer flex flex-col items-center gap-1 group w-full py-1">
                            <UploadCloud className="w-6 h-6 text-gray-400 group-hover:text-accent-emerald transition-colors" />
                            <span className="text-xs text-gray-200">
                              Arrastra imagen o <span className="text-accent-emerald hover:underline">haz clic aquí</span>
                            </span>
                            <span className="text-[10px] text-gray-500">JPG, PNG, WEBP (Máx. 5 MB)</span>
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Alerta de confirmación */}
                    {showConfirmOverwrite && (
                      <div className="p-2.5 bg-amber-950/20 border border-amber-500/30 rounded-xl flex items-start gap-2 text-amber-200 text-[10px] leading-relaxed">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>Reemplazará la imagen existente en Supabase.</span>
                      </div>
                    )}

                    {/* Progreso */}
                    {isUploadingImage && (
                      <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden border border-white/5">
                        <div className="bg-accent-emerald h-full rounded-full animate-pulse" style={{ width: '80%' }}></div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isUploadingImage}
                  className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUploadingImage}
                  className="px-6 py-2.5 text-xs font-semibold rounded-lg bg-accent-emerald hover:bg-emerald-500 text-white transition-all cursor-pointer shadow-md shadow-emerald-500/10 active:scale-[0.98] disabled:opacity-50"
                >
                  {editingRoom ? 'Guardar Cambios' : 'Registrar Cabaña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación de Estado */}
      {confirmingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel p-6 rounded-2xl max-w-md w-full shadow-2xl border border-white/10 flex flex-col gap-4">
            <h3 className="text-lg font-bold font-heading text-white">
              ¿Estás seguro de que deseas {confirmingRoom.activa ? 'desactivar' : 'activar'} la cabaña "{confirmingRoom.nombre}"?
            </h3>
            <p className="text-gray-400 text-xs">
              {confirmingRoom.activa 
                ? 'Al desactivarla, no se podrán realizar nuevas reservas sobre esta cabaña.'
                : 'Al activarla, volverá a estar disponible para reservas públicas.'}
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
                onClick={() => setConfirmingRoom(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleToggleStatus}
                className={`px-4 py-2 text-xs font-semibold rounded-lg text-white transition-all cursor-pointer shadow-md ${
                  confirmingRoom.activa 
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

      {/* Modal de confirmación de Eliminación */}
      {roomToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel p-6 rounded-2xl max-w-md w-full shadow-2xl border border-white/10 flex flex-col gap-4">
            <h3 className="text-lg font-bold font-heading text-white">
              Eliminar registro
            </h3>
            <p className="text-gray-400 text-xs">
              Esta acción eliminará permanentemente el registro.
              <br />
              Solo podrá eliminarse si no posee relaciones con otras entidades del sistema.
              <br />
              Esta acción no puede deshacerse.
            </p>
            <div className="flex justify-end gap-3 pt-3 border-t border-white/5 mt-2">
              <button
                type="button"
                onClick={() => setRoomToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteRoom}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all cursor-pointer shadow-md shadow-red-500/10 disabled:opacity-50 flex items-center gap-1.5"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar definitivamente'}
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
export default HabitacionesAdminPage;

