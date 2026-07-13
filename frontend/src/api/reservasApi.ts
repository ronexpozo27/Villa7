import { axiosClient } from './axiosClient';
import type { Reserva } from '../types';

export interface CrearReservaParams {
  habitacionId: string;
  fechaEntrada: string;
  fechaSalida: string;
  serviciosIds: string[];
}

export const reservasApi = {
  create: async (params: CrearReservaParams): Promise<Reserva> => {
    const response = await axiosClient.post<Reserva>('/reservas', params);
    return response.data;
  },

  getMisReservas: async (): Promise<Reserva[]> => {
    const response = await axiosClient.get<Reserva[]>('/reservas/mis-reservas');
    return response.data;
  },

  getById: async (id: string): Promise<Reserva> => {
    const response = await axiosClient.get<Reserva>(`/reservas/${id}`);
    return response.data;
  },

  cancelar: async (id: string): Promise<void> => {
    await axiosClient.patch(`/reservas/${id}/cancelar`);
  },

  getAllAdmin: async (estado?: string): Promise<Reserva[]> => {
    const params: Record<string, string> = {};
    if (estado) params.estado = estado;

    const response = await axiosClient.get<Reserva[]>('/reservas', { params });
    return response.data;
  },

  changeStatus: async (id: string, nuevoEstado: string): Promise<void> => {
    await axiosClient.patch(`/reservas/${id}/estado`, { nuevoEstado });
  },
};
