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

  toggleStatus: async (id: string, payload: boolean | { activo: boolean; motivo?: string }): Promise<any> => {
    const response = await axiosClient.patch<any>(`/servicios/${id}/estado`, payload);
    return response.data;
  },

  delete: async (id: string, motivo?: string): Promise<{ message: string }> => {
    const response = await axiosClient.delete<{ message: string }>(`/servicios/${id}`, {
      params: motivo ? { motivo } : undefined,
    });
    return response.data;
  },
};
