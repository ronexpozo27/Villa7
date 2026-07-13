// DTOs & Domain Types for Villa7

export type RolUsuario = 'Administrador' | 'Cliente';

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: RolUsuario;
  fechaCreacion: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  usuario: {
    nombre: string;
    correo: string;
    rol: RolUsuario;
  };
}

export interface Habitacion {
  id: string;
  nombre: string;
  descripcion: string;
  capacidadMax: number;
  precioPorNoche: number;
  activa: boolean;
  imagenUrl?: string | null;
  imagenStoragePath?: string | null;
  ubicacion?: string | null;
}

export interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  activo: boolean;
}

export interface ReservaServicioInfo {
  servicioId: string;
  servicioNombre: string;
  precioContratado: number;
}

export interface Reserva {
  id: string;
  usuarioId: string;
  usuarioNombre: string;
  habitacionId: string;
  habitacionNombre: string;
  fechaEntrada: string;
  fechaSalida: string;
  estado: 'Pendiente' | 'Confirmada' | 'Cancelada' | 'Completada';
  totalCalculado: number;
  fechaCreacion: string;
  fechaCancelacion: string | null;
  serviciosContratados: ReservaServicioInfo[];
}
