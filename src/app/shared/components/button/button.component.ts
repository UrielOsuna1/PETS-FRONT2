import { Component, Input, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css'],
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link' =
    'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() type: 'button' | 'submit' = 'button';
  @Input() icon: string = '';
  @Input() fullWidth: boolean = false;
  @Output() onClick = new EventEmitter<void>();

  get buttonClasses(): string {
    const classes = ['btn'];

    // Variant
    classes.push(`btn-${this.variant}`);

    // Size
    classes.push(`btn-${this.size}`);

    // Icon only (solo si hay icono y no hay contenido)
    if (this.icon && !this.hasContent) {
      classes.push('btn-icon');
    }

    // Full width
    if (this.fullWidth) {
      classes.push('w-100');
    }

    // Loading
    if (this.loading) {
      classes.push('btn-loading');
    }

    return classes.join(' ');
  }

  get hasContent(): boolean {
    // Por ahora asumimos que siempre hay contenido
    // En una implementación real, se podría usar ContentChild o detección de DOM
    return true;
  }

  getFontSet(): string {
    return 'Material Icons';
  }

  handleClick(): void {
    if (!this.disabled && !this.loading) {
      this.onClick.emit();
    }
  }
}