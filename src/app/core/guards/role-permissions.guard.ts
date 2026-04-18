import { inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChildFn, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
// service
import { AppStorageServiceService } from '../services/app-storage-service.service';

export const rolePermissionsChildGuard: CanActivateChildFn = async (
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) => {
    const platformId = inject(PLATFORM_ID);

    // en el servidor, permitir acceso (la verificación real ocurre en el cliente)
    if (!isPlatformBrowser(platformId)) {
        return true;
    }

    return checkRolesPermissions(childRoute.data['permissions'], childRoute.data['roles']);
}

export const rolePermissionsGuard: CanActivateFn = async (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) => {
    const platformId = inject(PLATFORM_ID);

    // en el servidor, permitir acceso (la verificación real ocurre en el cliente)
    if (!isPlatformBrowser(platformId)) {
        return true;
    }

    return checkRolesPermissions(route.data['permissions'], route.data['roles']);
}

function checkRolesPermissions(permissions: string[], roles: string[]): boolean {
    if (!roles && !permissions) {
        return true;
    }

    const userInfo = AppStorageServiceService.getUserInfo();
    let valid = false;

    // verificar roles
    if (roles) {
        const userRole = userInfo?.role;
        valid = roles.some((allowedRole: string) =>
            userRole?.toString().toLowerCase() === allowedRole?.toString().toLowerCase()
        );
    }

    // verificar permisos (si no se validó por roles)
    if (permissions && !valid) {
        const userPermissions = userInfo?.permissions || [];
        valid = permissions.some((permission: string) =>
            userPermissions.includes(permission)
        );
    }

    // si no es válido, redirigir
    if (!valid) {
        const router = inject(Router);

        // si no hay userInfo, el usuario no está logueado -> redirigir a login
        // si hay userInfo pero rol no coincide -> redirigir a home (no autorizado)
        if (!userInfo) {
            router.navigate(['/login'], {
                queryParams: {
                    message: 'Inicia sesión para acceder',
                },
            });
        } else {
            router.navigate(['/main/home'], {
                queryParams: {
                    message: 'No tiene permitido acceder a la pagina',
                },
            });
        }
    }

    return valid;
}