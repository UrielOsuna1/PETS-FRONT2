import { inject } from '@angular/core';
import { Router } from '@angular/router';
// service
import { AuthService } from '../services/auth.service';

export const isAuthenticatedGuard = () => {
    const _router = inject(Router);
    const _auth = inject(AuthService);

    // verificar solo si hay un token en el almacenamiento local
    const token = _auth.token();
    if (token) {
        _router.navigate(['/app']);
        return false;
    }

    return true;
};
