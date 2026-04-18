import { Injectable } from '@angular/core';
import { GatewayService } from './gateway.service';
import { AuditLogRequestDTO } from '../dtos/audit-log/audit-log-request-dto';
import { AuditLogResponseDTO } from '../dtos/audit-log/audit-log-response-dto';
import { CommonResponseDTO } from '../dtos/common/common-response-dto';

/**
 * Servicio para consultar logs de auditoría
 * Consume el endpoint audit_logs_get a través del Gateway
 */
@Injectable({
    providedIn: 'root'
})
export class AuditLogService {
    private readonly ENDPOINT = 'audit_logs_get';

    constructor(private gatewayService: GatewayService) { }

    /**
     * Consulta logs de auditoría con filtros dinámicos
     * @param filters Filtros de búsqueda (todos opcionales)
     * @returns Promise con la lista de logs
     */
    async getAuditLogs(filters?: Partial<AuditLogRequestDTO>): Promise<CommonResponseDTO<AuditLogResponseDTO[]>> {
        try {
            console.log('AuditLogService: Sending filters:', filters);
            console.log('AuditLogService: Filters JSON:', JSON.stringify(filters));
            const defaultFilters: AuditLogRequestDTO = {
                limit: 50,
                offset: 0
            };

            const requestData = { ...defaultFilters, ...filters };

            const response = await this.gatewayService.post<CommonResponseDTO<AuditLogResponseDTO[]>>(this.ENDPOINT, requestData);
            console.log('AuditLogService: Received response:', response);
            console.log('AuditLogService: Response data:', response?.data);
            return response;
        } catch (error) {
            console.error('AuditLogService: Error:', error);
            throw error;
        }
    }
}
