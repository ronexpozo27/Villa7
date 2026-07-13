import { axiosClient } from './axiosClient';
import type { Habitacion } from '../types';

export const habitacionesApi = {
  getAll: async (fechaEntrada?: string, fechaSalida?: string): Promise<Habitacion[]> => {
    const params: Record<string, string> = {};
    if (fechaEntrada) params.fechaEntrada = fechaEntrada;
    if (fechaSalida) params.fechaSalida = fechaSalida;

    const response = await axiosClient.get<Habitacion[]>('/habitaciones', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Habitacion> => {
    const response = await axiosClient.get<Habitacion>(`/habitaciones/${id}`);
    return response.data;
  },

  create: async (data: Omit<Habitacion, 'id' | 'activa'>): Promise<Habitacion> => {
    const response = await axiosClient.post<Habitacion>('/habitaciones', data);
    return response.data;
  },

  update: async (id: string, data: Omit<Habitacion, 'id' | 'activa'>): Promise<Habitacion> => {
    const response = await axiosClient.put<Habitacion>(`/habitaciones/${id}`, data);
    return response.data;
  },

  toggleStatus: async (id: string, activa: boolean): Promise<void> => {
    await axiosClient.patch(`/habitaciones/${id}/estado`, activa);
  },

  getAdminList: async (): Promise<Habitacion[]> => {
    const response = await axiosClient.get<Habitacion[]>('/habitaciones/admin-list');
    return response.data;
  },

  uploadImage: async (id: string, file: File): Promise<Habitacion> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosClient.post<Habitacion>(`/habitaciones/${id}/imagen`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteImage: async (id: string): Promise<Habitacion> => {
    const response = await axiosClient.delete<Habitacion>(`/habitaciones/${id}/imagen`);
    return response.data;
  },
};
