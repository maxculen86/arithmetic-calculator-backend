export type OperationType = 'addition' | 'subtraction' | 'multiplication' | 'division' | 'square_root' | 'random_string' | 'create_user';

export interface Operation {
  id: string;
  type: OperationType;
  cost: number;
}
