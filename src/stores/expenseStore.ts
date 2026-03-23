import { create } from 'zustand';
import { db } from '../db';
import type { Expense, Split } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface ExpenseState {
  expenses: Expense[];
  isLoading: boolean;
  loadExpenses: (tripId: string) => Promise<void>;
  addExpense: (data: Omit<Expense, 'id'>) => Promise<string>;
  updateExpense: (id: string, updates: Partial<Omit<Expense, 'id'>>) => Promise<void>;
  deleteExpense: (id: string, tripId: string) => Promise<void>;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  isLoading: false,

  loadExpenses: async (tripId) => {
    set({ isLoading: true });
    try {
      const expenses = await db.expenses.where({ tripId }).sortBy('date');
      set({ expenses: expenses.reverse(), isLoading: false });
    } catch (error) {
      console.error('Failed to load expenses', error);
      set({ isLoading: false });
    }
  },

  addExpense: async (data) => {
    const newExpense: Expense = { ...data, id: uuidv4() };
    await db.expenses.add(newExpense);
    await get().loadExpenses(data.tripId);
    return newExpense.id;
  },

  updateExpense: async (id, updates) => {
    await db.expenses.update(id, updates);
    const expense = await db.expenses.get(id);
    if (expense) {
      await get().loadExpenses(expense.tripId);
    }
  },

  deleteExpense: async (id, tripId) => {
    await db.expenses.delete(id);
    await get().loadExpenses(tripId);
  },
}));

// Pure calculation utilities
export function calcSplitAmounts(totalAmount: number, memberIds: string[]): Split[] {
  if (memberIds.length === 0) return [];
  // 無條件進位，每人金額相同，寧可多收不少收
  const each = Math.ceil(totalAmount / memberIds.length);
  return memberIds.map(memberId => ({ memberId, amount: each }));
}

export function calcPerItemAmounts(
  memberOptionMap: Record<string, { optionId: string; price: number }>
): { splits: Split[]; totalAmount: number } {
  const splits: Split[] = Object.entries(memberOptionMap).map(([memberId, { optionId, price }]) => ({
    memberId,
    optionId,
    amount: price,
  }));
  const totalAmount = splits.reduce((sum, s) => sum + s.amount, 0);
  return { splits, totalAmount };
}
