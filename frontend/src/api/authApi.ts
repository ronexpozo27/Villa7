import { axiosClient } from './axiosClient';
import type { AuthResponse } from '../types';

export const authApi = {
  register: async (nombre: string, correo: string, password: string): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/auth/register', {
      nombre,
      correo,
      password,
    });
    return response.data;
  },

  login: async (correo: string, password: string): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/auth/login', {
      correo,
      password,
    });
    return response.data;
  },
};
