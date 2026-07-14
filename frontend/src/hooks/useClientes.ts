import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientesApi } from '../api/clientesApi';

export const useClientes = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin-clientes'],
    queryFn: () => clientesApi.getAll(),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, activo, motivo }: { id: string; activo: boolean; motivo?: string }) =>
      clientesApi.toggleStatus(id, { activo, motivo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-clientes'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo?: string }) => clientesApi.delete(id, motivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-clientes'] });
    },
  });

  return {
    clientes: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    toggleStatus: toggleStatusMutation.mutateAsync,
    isToggling: toggleStatusMutation.isPending,
    deleteCliente: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};

export const useClienteDetails = (id: string) => {
  return useQuery({
    queryKey: ['admin-cliente', id],
    queryFn: () => clientesApi.getById(id),
    enabled: !!id,
  });
};

