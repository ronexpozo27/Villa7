import { axiosClient } from './axiosClient';
import type { Usuario } from '../types';

export const clientesApi = {
  getAll: async (): Promise<Usuario[]> => {
    const response = await axiosClient.get<Usuario[]>('/clientes');
    return response.data;
  },

  getById: async (id: string): Promise<Usuario> => {
    const response = await axiosClient.get<Usuario>(`/clientes/${id}`);
    return response.data;
  },
};
