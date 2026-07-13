import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { habitacionesApi } from '../api/habitacionesApi';
import type { Habitacion } from '../types';

export const useHabitaciones = (fechaEntrada?: string, fechaSalida?: string) => {
  const queryClient = useQueryClient();

  // Query to get rooms (optionally filtered by dates)
  const roomsQuery = useQuery({
    queryKey: ['habitaciones', { fechaEntrada, fechaSalida }],
    queryFn: () => habitacionesApi.getAll(fechaEntrada, fechaSalida),
  });

  // Query to get admin room list
  const adminRoomsQuery = useQuery({
    queryKey: ['admin-habitaciones'],
    queryFn: () => habitacionesApi.getAdminList(),
    enabled: false, // only manually triggered or triggered on admin pages
  });

  // Mutation to create a room
  const createMutation = useMutation({
    mutationFn: (data: Omit<Habitacion, 'id' | 'activa'>) => habitacionesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habitaciones'] });
      queryClient.invalidateQueries({ queryKey: ['admin-habitaciones'] });
    },
  });

  // Mutation to update a room
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<Habitacion, 'id' | 'activa'> }) =>
      habitacionesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habitaciones'] });
      queryClient.invalidateQueries({ queryKey: ['admin-habitaciones'] });
    },
  });

  // Mutation to toggle room status
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, activa }: { id: string; activa: boolean }) =>
      habitacionesApi.toggleStatus(id, activa),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habitaciones'] });
      queryClient.invalidateQueries({ queryKey: ['admin-habitaciones'] });
    },
  });

  // Mutation to upload image
  const uploadImageMutation = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      habitacionesApi.uploadImage(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habitaciones'] });
      queryClient.invalidateQueries({ queryKey: ['admin-habitaciones'] });
    },
  });

  // Mutation to delete image
  const deleteImageMutation = useMutation({
    mutationFn: (id: string) => habitacionesApi.deleteImage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habitaciones'] });
      queryClient.invalidateQueries({ queryKey: ['admin-habitaciones'] });
    },
  });

  return {
    rooms: roomsQuery.data || [],
    isLoading: roomsQuery.isLoading,
    isError: roomsQuery.isError,
    error: roomsQuery.error,
    refetch: roomsQuery.refetch,

    adminRooms: adminRoomsQuery.data || [],
    isAdminLoading: adminRoomsQuery.isLoading,
    fetchAdminRooms: adminRoomsQuery.refetch,

    createRoom: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    updateRoom: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    toggleStatus: toggleStatusMutation.mutateAsync,
    isToggling: toggleStatusMutation.isPending,

    uploadImage: uploadImageMutation.mutateAsync,
    isUploadingImage: uploadImageMutation.isPending,

    deleteImage: deleteImageMutation.mutateAsync,
    isDeletingImage: deleteImageMutation.isPending,
  };
};

export const useHabitacionDetails = (id: string) => {
  return useQuery({
    queryKey: ['habitacion', id],
    queryFn: () => habitacionesApi.getById(id),
    enabled: !!id,
  });
};
