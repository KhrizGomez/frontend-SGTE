// View-model de notificaciones adaptado para visualizacion en tarjeta/modal.
export interface Notificacion {
  id: number;
  icono: string;
  titulo: string;
  mensaje: string;
  tiempo: string;
  leida: boolean;
  tipo: string;
}
