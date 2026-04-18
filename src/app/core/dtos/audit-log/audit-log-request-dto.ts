/**
 * DTO para consultar logs de auditoría
 * Todos los campos son opcionales para permitir filtros flexibles
 */
export interface AuditLogRequestDTO {
  /** ID del usuario para filtrar */
  userId?: number;

  /** Acción realizada (ej: LOGIN_SUCCESS, LOGIN_FAILED, etc.) */
  action?: string;

  /** Tipo de entidad afectada (ej: USER, SESSION, etc.) */
  entityType?: string;

  /** ID de la entidad afectada */
  entityId?: number;

  /** Dirección IP del cliente */
  ipAddress?: string;

  /** Fecha desde (formato ISO: YYYY-MM-DD) */
  dateFrom?: string;

  /** Fecha hasta (formato ISO: YYYY-MM-DD) */
  dateTo?: string;

  /** Límite de resultados (default 50, max 100) */
  limit?: number;

  /** Offset para paginación (default 0) */
  offset?: number;
}
