import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditLogService } from '../../../core/services/audit-log.service';
import { AuditLogResponseDTO } from '../../../core/dtos/audit-log/audit-log-response-dto';
import { AuditLogRequestDTO } from '../../../core/dtos/audit-log/audit-log-request-dto';

@Component({
  selector: 'app-admin-audit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-audits.component.html',
  styleUrls: ['./admin-audits.component.css'],
})
export class AdminAuditsComponent implements OnInit {

  filters: {
    action: string;
    userId: number | null;
    ipAddress: string;
    dateFrom: string;
    dateTo: string;
  } = {
      action: '',
      userId: null,
      ipAddress: '',
      dateFrom: '',
      dateTo: '',
    };

  logs = signal<AuditLogResponseDTO[]>([]);
  isLoading = signal<boolean>(false);
  hasError = signal<boolean>(false);
  currentPage = signal<number>(0);
  readonly pageSize = 10;
  hasMore = signal<boolean>(true);

  private auditLogService = inject(AuditLogService);

  readonly actionOptions = [
    { value: '', label: 'Todas las acciones' },
    { value: 'LOGIN_SUCCESS', label: 'Login Exitoso' },
    { value: 'LOGIN_FAILED', label: 'Login Fallido' },
    { value: 'LOGOUT_SUCCESS', label: 'Logout Exitoso' },
    { value: 'REGISTER_SUCCESS', label: 'Registro Exitoso' },
    { value: 'SESSION_INFO_ACCESSED', label: 'Info Sesión' },
    { value: 'INSERT_DB', label: 'Insert DB' },
    { value: 'UPDATE_DB', label: 'Update DB' },
  ];

  readonly actionLabels: Record<string, string> = {
    LOGIN_SUCCESS: 'Login Exitoso',
    LOGIN_FAILED: 'Login Fallido',
    LOGOUT_SUCCESS: 'Logout Exitoso',
    REGISTER_SUCCESS: 'Registro Exitoso',
    SESSION_INFO_ACCESSED: 'Info Sesión',
    INSERT_DB: 'Insert DB',
    UPDATE_DB: 'Update DB',
    TEST: 'Test',
    REFRESH_TOKEN_FAILED: 'Token Fallido',
    GLOBAL_LOGOUT: 'Cierre Global',
    CREATE: 'Crear',
    UPDATE: 'Actualizar',
    DELETE: 'Eliminar',
  };

  ngOnInit(): void {
    this.loadLogs();
  }

  async loadLogs(resetPage: boolean = false): Promise<void> {
    this.isLoading.set(true);
    this.hasError.set(false);

    try {
      // Reset page if applying new filters
      if (resetPage) {
        this.currentPage.set(0);
        this.logs.set([]);
      }

      const filters: AuditLogRequestDTO = {
        limit: this.pageSize,
        offset: this.currentPage() * this.pageSize,
        ...(this.filters.action && { action: this.filters.action }),
        ...(this.filters.userId !== null && { userId: this.filters.userId }),
        ...(this.filters.ipAddress && { ipAddress: this.filters.ipAddress }),
        ...(this.filters.dateFrom && { dateFrom: this.filters.dateFrom }),
        ...(this.filters.dateTo && { dateTo: this.filters.dateTo }),
      };

      console.log('Sending filters to API:', filters);
      const response = await this.auditLogService.getAuditLogs(filters);
      console.log('API response:', response);

      if (response?.success && response.data) {
        if (resetPage) {
          this.logs.set(response.data);
        } else {
          // Append new logs to existing ones
          this.logs.set([...this.logs(), ...response.data]);
        }

        // Check if there are more logs to load
        this.hasMore.set(response.data.length >= this.pageSize);
      } else {
        this.logs.set([]);
        this.hasMore.set(false);
      }
    } catch (error) {
      console.error('Error loading logs:', error);
      this.hasError.set(true);
      this.logs.set([]);
      this.hasMore.set(false);
    } finally {
      this.isLoading.set(false);
    }
  }

  get filteredLogs(): AuditLogResponseDTO[] {
    return this.logs();
  }

  get totalCreations(): number {
    return this.logs().filter(l => l.action?.includes('CREATE')).length;
  }

  get totalUpdates(): number {
    return this.logs().filter(l => l.action?.includes('UPDATE')).length;
  }

  get totalApprovals(): number {
    return this.logs().filter(l => l.action?.includes('APPROVE')).length;
  }

  get totalActions(): number {
    return this.logs().length;
  }

  getActionLabel(action: string): string {
    return this.actionLabels[action] ?? action;
  }

  getActionClass(action: string): string {
    if (action?.includes('LOGIN_SUCCESS')) return 'badge badge--create';
    if (action?.includes('LOGIN_FAILED')) return 'badge badge--delete';
    if (action?.includes('CREATE')) return 'badge badge--create';
    if (action?.includes('UPDATE')) return 'badge badge--update';
    if (action?.includes('DELETE')) return 'badge badge--delete';
    return 'badge badge--default';
  }

  applyFilters(): void {
    console.log('Applying filters:', this.filters);
    this.loadLogs(true); // Reset page when applying new filters
  }

  loadMore(): void {
    if (!this.isLoading() && this.hasMore()) {
      this.currentPage.set(this.currentPage() + 1);
      this.loadLogs(false); // Don't reset page when loading more
    }
  }

  clearFilters(): void {
    this.filters = {
      action: '',
      userId: null,
      ipAddress: '',
      dateFrom: '',
      dateTo: '',
    };
    this.loadLogs(true); // Reset page when clearing filters
  }
}