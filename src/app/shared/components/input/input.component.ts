import {
  Component,
  Input,
  EventEmitter,
  Output,
  forwardRef,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css'],
  encapsulation: ViewEncapsulation.None, // Desactivar encapsulación para que estilos funcionen
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor {
  @Input() type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' = 'text';
  @Input() placeholder: string = '';
  @Input() label: string = '';
  @Input() iconStart: string = '';
  @Input() iconEnd: string = '';
  @Input() disabled: boolean = false;
  @Input() required: boolean = false;
  @Input() readonly: boolean = false;
  @Input() autocomplete: string = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() variant: 'outline' | 'filled' = 'outline';
  @Input() clearable: boolean = false; // Nueva opción para hacer limpiable

  @Output() focus = new EventEmitter<FocusEvent>();
  @Output() blur = new EventEmitter<FocusEvent>();
  @Output() clear = new EventEmitter<void>(); // Nuevo evento de limpiar

  value: string = '';
  showPassword = false;
  id = `input-${Math.random().toString(36).substr(2, 9)}`;

  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  get inputType(): string {
    if (this.type === 'password') {
      return this.showPassword ? 'text' : 'password';
    }
    return this.type;
  }

  get inputClasses(): string {
    const classes = ['input-wrapper'];

    // Size
    classes.push(`input-${this.size}`);

    // Variant
    classes.push(`input-${this.variant}`);

    // States
    if (this.disabled) classes.push('input-disabled');
    if (this.required) classes.push('input-required');
    if (this.iconStart) classes.push('input-with-start-icon');
    if (this.iconEnd) classes.push('input-with-end-icon');

    return classes.join(' ');
  }

  get showClearButton(): boolean {
    return this.clearable && this.value.length > 0 && !this.disabled && !this.readonly;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  clearInput(): void {
    this.value = '';
    this.onChange(this.value);
    this.onTouched();
    this.clear.emit();
  }

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
    this.onTouched();
  }

  onFocus(event: FocusEvent): void {
    this.focus.emit(event);
  }

  onBlur(event: FocusEvent): void {
    this.blur.emit(event);
    this.onTouched();
  }
}
