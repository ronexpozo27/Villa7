import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservasApi, type CrearReservaParams } from '../api/reservasApi';

export const useReservas = (adminEstadoFilter?: string) => {
  const queryClient = useQueryClient();

  // Query to get authenticated customer's own bookings
  const misReservasQuery = useQuery({
    queryKey: ['mis-reservas'],
    queryFn: () => reservasApi.getMisReservas(),
  });

  // Query to get all bookings for administrator management
  const adminReservasQuery = useQuery({
    queryKey: ['admin-reservas', { estado: adminEstadoFilter }],
    queryFn: () => reservasApi.getAllAdmin(adminEstadoFilter),
    enabled: false, // only manually triggered on admin pages
  });

  // Mutation to create a booking
  const createMutation = useMutation({
    mutationFn: (params: CrearReservaParams) => reservasApi.create(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mis-reservas'] });
      queryClient.invalidateQueries({ queryKey: ['admin-reservas'] });
      queryClient.invalidateQueries({ queryKey: ['habitaciones'] });
    },
  });

  // Mutation to cancel a booking (customer)
  const cancelMutation = useMutation({
    mutationFn: (id: string) => reservasApi.cancelar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mis-reservas'] });
      queryClient.invalidateQueries({ queryKey: ['admin-reservas'] });
      queryClient.invalidateQueries({ queryKey: ['habitaciones'] });
    },
  });

  // Mutation to transition booking status (admin)
  const changeStatusMutation = useMutation({
    mutationFn: ({ id, nuevoEstado }: { id: string; nuevoEstado: string }) =>
      reservasApi.changeStatus(id, nuevoEstado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mis-reservas'] });
      queryClient.invalidateQueries({ queryKey: ['admin-reservas'] });
      queryClient.invalidateQueries({ queryKey: ['habitaciones'] });
    },
  });

  return {
    misReservas: misReservasQuery.data || [],
    isMisLoading: misReservasQuery.isLoading,
    isMisError: misReservasQuery.isError,
    refetchMis: misReservasQuery.refetch,

    adminReservas: adminReservasQuery.data || [],
    isAdminLoading: adminReservasQuery.isLoading,
    fetchAdminReservas: adminReservasQuery.refetch,

    crearReserva: createMutation.mutateAsync,
    isCreando: createMutation.isPending,

    cancelarReserva: cancelMutation.mutateAsync,
    isCancelando: cancelMutation.isPending,

    cambiarEstadoReserva: changeStatusMutation.mutateAsync,
    isCambiandoEstado: changeStatusMutation.isPending,
  };
};

export const useReservaDetails = (id: string) => {
  return useQuery({
    queryKey: ['reserva', id],
    queryFn: () => reservasApi.getById(id),
    enabled: !!id,
  });
};
