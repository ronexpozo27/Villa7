import { useQuery } from '@tanstack/react-query';
import { clientesApi } from '../api/clientesApi';

export const useClientes = () => {
  const query = useQuery({
    queryKey: ['admin-clientes'],
    queryFn: () => clientesApi.getAll(),
  });

  return {
    clientes: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useClienteDetails = (id: string) => {
  return useQuery({
    queryKey: ['admin-cliente', id],
    queryFn: () => clientesApi.getById(id),
    enabled: !!id,
  });
};
