export interface Record {
  id: string;
  operation_id: string;
  user_id: string;
  amount: number;
  user_balance: number;
  operation_response: string | null;
  created_at: Date;
  deleted: boolean;
}


export type SortableField = keyof Pick<Record, 'created_at' | 'amount' | 'operation_id' | 'user_balance' | 'operation_response'>;