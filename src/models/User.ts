export interface User {
  id: string;
  username: string;
  status: 'active' | 'inactive';
  balance: number;
}
