import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviciosApi } from '../api/serviciosApi';
import type { Servicio } from '../types';

export const useServicios = () => {
  const queryClient = useQueryClient();

  // Query to get active public services
  const servicesQuery = useQuery({
    queryKey: ['servicios'],
    queryFn: () => serviciosApi.getAll(),
  });

  // Query to get all admin services
  const adminServicesQuery = useQuery({
    queryKey: ['admin-servicios'],
    queryFn: () => serviciosApi.getAdminList(),
    enabled: false,
  });

  // Mutation to create a service
  const createMutation = useMutation({
    mutationFn: (data: Omit<Servicio, 'id' | 'activo'>) => serviciosApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicios'] });
      queryClient.invalidateQueries({ queryKey: ['admin-servicios'] });
    },
  });

  // Mutation to update a service
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<Servicio, 'id' | 'activo'> }) =>
      serviciosApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicios'] });
      queryClient.invalidateQueries({ queryKey: ['admin-servicios'] });
    },
  });

  // Mutation to toggle service status
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, activo, motivo }: { id: string; activo: boolean; motivo?: string }) =>
      serviciosApi.toggleStatus(id, { activo, motivo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicios'] });
      queryClient.invalidateQueries({ queryKey: ['admin-servicios'] });
    },
  });


  return {
    services: servicesQuery.data || [],
    isLoading: servicesQuery.isLoading,
    isError: servicesQuery.isError,
    error: servicesQuery.error,
    refetch: servicesQuery.refetch,

    adminServices: adminServicesQuery.data || [],
    isAdminLoading: adminServicesQuery.isLoading,
    fetchAdminServices: adminServicesQuery.refetch,

    createService: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    updateService: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    toggleStatus: toggleStatusMutation.mutateAsync,
    isToggling: toggleStatusMutation.isPending,
  };
};
