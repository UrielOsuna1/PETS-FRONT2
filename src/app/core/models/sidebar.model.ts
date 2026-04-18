import { Permissions } from '../data/roles-permissions.enum';

export interface SideBarModel {
  groups: SideBarGroup[];
}

export interface SideBarGroup {
  text: string;
  items: SideBarItem[];
  roles?: string[];
}

export interface SideBarItem {
  text: string;
  icon?: string;
  route?: string;
  items?: SideBarItem[];
  onClick?: string;
  permissions?: Permissions[];
  roles?: string[];
}
