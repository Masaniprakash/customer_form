export interface IUser {
  _id?: string; 
  name: string;
  email: string;
  phone: string;
  password:string;
  imageUrl?: string;
  role: string;
  isAdmin:boolean;
}