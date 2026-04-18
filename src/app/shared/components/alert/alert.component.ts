import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css'],
})
export class AlertComponent implements OnChanges {
  @Input() message: string = '';
  @Input() type: 'success' | 'error' | 'warning' | 'info' = 'info';
  @Input() dismissible: boolean = false;
  @Output() dismissed = new EventEmitter<void>();

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    // Componente actualizado cuando cambian los inputs
  }

  // Iconos para cada tipo (usando texto/emoji en lugar de Material Icons)
  get iconText(): string {
    switch (this.type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'info';
    }
  }

  // Clases CSS dinámicas
  get alertClasses(): string {
    const baseClasses = 'alert alert-dismissible';
    const typeClass = `alert-${this.type}`;
    return `${baseClasses} ${typeClass}`;
  }

  onDismiss() {
    this.dismissed.emit();
  }
}
