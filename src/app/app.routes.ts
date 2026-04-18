import { Routes } from '@angular/router';
// permissions
import { rolePermissionsChildGuard } from './core/guards/role-permissions.guard';
// layouts
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: '/main/home',
        pathMatch: 'full',
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./pages/auth/login/login.component').then((c) => c.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./pages/auth/register/register.component').then((c) => c.RegisterComponent),
      }
    ],
  },
  {
    path: 'main',
    component: MainLayoutComponent,
    canActivateChild: [rolePermissionsChildGuard],
    children: [
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home.component').then((c) => c.HomeComponent),
      },
      {
        path: 'pets',
        loadComponent: () => import('./pages/pets/pets.component').then((c) => c.PetsComponent),
        children: [
          {
            path: 'pets-details/:id',
            loadComponent: () => import('./pages/pets/pets-details/pets-details.component').then((c) => c.PetsDetailsComponent),
          }
        ]
      },
      {
        path: 'profile',
        data: { roles: ['ADOPTANTE', 'ADMIN', 'SYSADMIN'] },
        loadComponent: () => import('./pages/user/my-profile/my-profile.component').then((c) => c.MyProfileComponent),
      }
    ],
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivateChild: [rolePermissionsChildGuard],
    children: [
      {
        path: 'admin-dashboard',
        data: { roles: ['ADMIN', 'SYSADMIN'] },
        loadComponent: () => import('./pages/admin/admin-dashboard/admin-dashboard.component').then((c) => c.AdminDashboardComponent),
      },
      {
        path: 'admin-pets',
        data: { roles: ['ADMIN', 'SYSADMIN'] },
        loadComponent: () => import('./pages/admin/admin-pets/admin-pets.component').then((c) => c.AdminPetsComponent),
      },
      {
        path: 'admin-requests',
        data: { roles: ['ADMIN', 'SYSADMIN'] },
        loadComponent: () => import('./pages/admin/admin-requests/admin-requests.component').then((c) => c.AdminRequestsComponent),
      },
      {
        path: 'admin-users',
        data: { roles: ['ADMIN', 'SYSADMIN'] },
        loadComponent: () => import('./pages/admin/admin-users/admin-users.component').then((c) => c.AdminUsersComponent),
      },
      {
        path: 'admin-audits',
        data: { roles: ['ADMIN', 'SYSADMIN'] },
        loadComponent: () => import('./pages/admin/admin-audits/admin-audits.component').then((c) => c.AdminAuditsComponent),
      },
      {
        path: 'admin-profile',
        data: { roles: ['ADMIN', 'SYSADMIN'] },
        loadComponent: () => import('./pages/user/my-profile/my-profile.component').then((c) => c.MyProfileComponent),
      }
    ],
  },
];
