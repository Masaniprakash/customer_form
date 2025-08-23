export interface IRoleMenu {
  _id?: string; 
  roleId: string;
  menuId: string;
  create:boolean;
  read:boolean;
  update:boolean;
  delete:boolean;
  status: string;
}