export type Role = "organizer" | "accountant" | "member";

export interface Member {
  id: string;
  nickname: string;
  role: Role;
}

export type ExpenseCategory = "split" | "per-item" | "general";

export interface ExpenseOption {
  id: string;
  label: string;
  price: number;
}

export interface ExpenseType {
  id: string;
  name: string;
  category: ExpenseCategory;
  defaultAll: boolean;
  builtIn: boolean;
  options?: ExpenseOption[];
}

export interface Trip {
  id: string;
  title: string;
  description: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  currency: string;
  archived: boolean;
  createdAt: number;
  updatedAt: number;
  members: Member[];
  expenseTypes: ExpenseType[];
}

export interface Split {
  memberId: string;
  optionId?: string;
  amount: number;
}

export interface Expense {
  id: string;
  tripId: string;
  category: 'split' | 'per-item';
  title: string;
  date: string; // YYYY-MM-DD
  totalAmount: number;
  paidBy: string | null; // memberId
  options?: ExpenseOption[]; // per-item 模式的內嵌選項定義
  splits: Split[];
}

export type CollectionType = "pre-collect" | "collect" | "payout";

export interface Collection {
  id: string;
  tripId: string; // Foreign key
  memberId: string;
  amount: number;
  type: CollectionType;
  note: string;
  collectedAt: number;
}

export interface AppSettings {
  id: 'global';
  defaultExpenseTypes: ExpenseType[];
}
