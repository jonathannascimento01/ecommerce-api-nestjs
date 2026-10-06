export class User {}
export class UserEntity {
  user_id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
  created_at: Date;
  
  // Adicione esta linha para permitir que os endereços passem pelo filtro:
  addresses?: any[]; 
}