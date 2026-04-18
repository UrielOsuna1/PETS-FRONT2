import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { sideBarData } from '../../../../core/data/sidebar.data';
import { SideBarGroup } from '../../../../core/models/sidebar.model';
import { AppStorageServiceService } from '../../../../core/services/app-storage-service.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  sidebarData = sideBarData;
  visibleGroups: SideBarGroup[] = [];
  readonly routerLinkOptions = { exact: true };

  ngOnInit() {
    this.updateVisibleGroups();
  }

  private updateVisibleGroups(): void {
    const userRoles = AppStorageServiceService.getRoles();
    this.visibleGroups = this.sidebarData.groups
      .filter(group => {
        // Si el grupo no tiene roles, mostrarlo
        if (!group.roles || group.roles.length === 0) return true;
        // Verificar si el usuario tiene alguno de los roles del grupo
        return group.roles.some(role => userRoles.includes(role));
      })
      .map(group => ({
        ...group,
        items: group.items.filter(item => {
          // Si el item no tiene roles, mostrarlo
          if (!item.roles || item.roles.length === 0) return true;
          // Verificar si el usuario tiene alguno de los roles del item
          return item.roles.some(role => userRoles.includes(role));
        })
      }))
      .filter(group => group.items.length > 0); // Solo grupos con items visibles
  }

  handleItemClick(item: any): void {
    if (item.onClick === 'logout') {
      AppStorageServiceService.clear();
      window.location.href = '/login';
    }
  }
}
