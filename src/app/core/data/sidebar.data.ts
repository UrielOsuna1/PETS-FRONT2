import { SideBarModel } from '../models/sidebar.model';

export const sideBarData: SideBarModel = {
  groups: [
    {
      text: 'ADMINISTRADOR',
      items: [
        {
          text: 'DASHBOARD',
          icon: 'mdi mdi-view-dashboard',
          route: '/admin/admin-dashboard',
          roles: ['ADMIN', 'SYSADMIN'],
        },
        {
          text: 'MASCOTAS',
          icon: 'mdi mdi-paw',
          route: '/admin/admin-pets',
          roles: ['ADMIN', 'SYSADMIN'],
        },
        {
          text: 'SOLICITUDES',
          icon: 'mdi mdi-clipboard-list',
          route: '/admin/admin-requests',
          roles: ['ADMIN', 'SYSADMIN'],
        },
        {
          text: 'USUARIOS',
          icon: 'mdi mdi-account-group',
          route: '/admin/admin-users',
          roles: ['ADMIN', 'SYSADMIN'],
        },
        {
          text: 'MI PERFIL',
          icon: 'mdi mdi-account',
          route: '/admin/admin-profile',
          roles: ['ADMIN', 'SYSADMIN'],
        },
      ],
    },
    {
      text: 'SISTEMA',
      items: [
        {
          text: 'AUDITORÍA',
          icon: 'mdi mdi-file-document-multiple',
          route: '/admin/admin-audits',
          roles: ['SYSADMIN'],
        }
      ],
    },
    {
      text: 'NAVEGACIÓN',
      items: [
        {
          text: 'Ver sitio público',
          icon: 'mdi mdi-heart',
          route: '/main/home',
        },
      ],
    },
    {
      text: 'CERRAR SESIÓN',
      items: [
        {
          text: 'Salir',
          icon: 'fa fa-sign-out-alt',
          onClick: 'logout',
        },
      ],
    },
  ],
};
