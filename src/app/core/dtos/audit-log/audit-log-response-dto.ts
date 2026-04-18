export interface AuditLogResponseDTO {
  /** ID único del log */
  id: number;

  /** ID del usuario que realizó la acción */
  userId: number;

  /** Tipo de acción realizada */
  action: string;

  /** Tipo de entidad afectada */
  entityType?: string;

  /** ID de la entidad afectada */
  entityId?: number;

  /** Descripción de los cambios (JSON string) */
  changes?: string;

  /** Dirección IP del cliente */
  ipAddress?: string;

  /** Información del user agent */
  userAgent?: string;

  /** Fecha y hora de la acción */
  createdAt: string;
}
