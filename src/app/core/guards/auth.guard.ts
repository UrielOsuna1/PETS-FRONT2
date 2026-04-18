import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
// service
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const _auth = inject(AuthService);

  // verificar solo si hay un token en el almacenamiento local
  const token = _auth.token();
  if (!token) {
    return closeSession(_auth);
  }

  return true;
};

// cerrar sesión
function closeSession(_auth: AuthService) {
  _auth.logout();
  return false;
}