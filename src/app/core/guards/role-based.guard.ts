import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
// service
import { AppStorageServiceService } from '../services/app-storage-service.service';

export const roleBasedGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const userInfo = AppStorageServiceService.getUserInfo();

    // si no hay usuario, redirigir al login
    if (!userInfo) {
        router.navigate(['/login']);
        return false;
    }

    // obtener el rol del usuario
    const userRole = userInfo.role;

    // si es la ruta /main, permitir acceso sin verificar rol específico
    if (state.url === '/main' || state.url.startsWith('/main/')) {
        return true;
    }

    // si no hay rol definido para otras rutas, denegar acceso
    if (!userRole) {
        router.navigate(['/main/home']);
        return false;
    }

    // obtener los roles permitidos de la ruta
    const allowedRoles = route.data?.['roles'] as string[] || [];

    // si la ruta no tiene roles definidos, permitir acceso
    if (allowedRoles.length === 0) {
        return true;
    }

    // verificar si el rol del usuario está en los permitidos (comparación insensible a mayúsculas/minúsculas)
    const hasAccess = allowedRoles.some((allowedRole: string) =>
        userRole?.toString().toLowerCase() === allowedRole?.toString().toLowerCase()
    );

    if (!hasAccess) {
        router.navigate(['/main/home']); // redirigir a main
        return false;
    }

    return true;
};