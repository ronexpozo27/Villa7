import { axiosClient } from './axiosClient';
import type { Servicio } from '../types';

export const serviciosApi = {
  getAll: async (): Promise<Servicio[]> => {
    const response = await axiosClient.get<Servicio[]>('/servicios');
    return response.data;
  },

  getAdminList: async (): Promise<Servicio[]> => {
    const response = await axiosClient.get<Servicio[]>('/servicios/admin-list');
    return response.data;
  },

  create: async (data: Omit<Servicio, 'id' | 'activo'>): Promise<Servicio> => {
    const response = await axiosClient.post<Servicio>('/servicios', data);
    return response.data;
  },

  update: async (id: string, data: Omit<Servicio, 'id' | 'activo'>): Promise<Servicio> => {
    const response = await axiosClient.put<Servicio>(`/servicios/${id}`, data);
    return response.data;
  },

  toggleStatus: async (id: string, activo: boolean): Promise<void> => {
    await axiosClient.patch(`/servicios/${id}/estado`, activo);
  },
};
