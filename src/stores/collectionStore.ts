import { create } from 'zustand';
import { db } from '../db';
import type { Collection, Expense } from '../types';
import { v4 as uuidv4 } from 'uuid';

export interface MemberBalance {
  memberId: string;
  splitTotal: number;    // 分攤總額（應繳）
  paidTotal: number;     // 代墊總額
  collectedTotal: number; // 已收款總額
  balance: number;       // 待收 = splitTotal - paidTotal - collectedTotal（正=應繳，負=待退）
}

interface CollectionState {
  collections: Collection[];
  isLoading: boolean;
  loadCollections: (tripId: string) => Promise<void>;
  addCollection: (data: Omit<Collection, 'id' | 'collectedAt'>) => Promise<void>;
  deleteCollection: (id: string, tripId: string) => Promise<void>;
  calcBalances: (tripId: string, memberIds: string[]) => Promise<MemberBalance[]>;
}

export const useCollectionStore = create<CollectionState>((set, get) => ({
  collections: [],
  isLoading: false,

  loadCollections: async (tripId) => {
    set({ isLoading: true });
    try {
      const collections = await db.collections.where({ tripId }).sortBy('collectedAt');
      set({ collections: collections.reverse(), isLoading: false });
    } catch (error) {
      console.error('Failed to load collections', error);
      set({ isLoading: false });
    }
  },

  addCollection: async (data) => {
    const newCollection: Collection = {
      ...data,
      id: uuidv4(),
      collectedAt: Date.now(),
    };
    await db.collections.add(newCollection);
    await get().loadCollections(data.tripId);
  },

  deleteCollection: async (id, tripId) => {
    await db.collections.delete(id);
    await get().loadCollections(tripId);
  },

  calcBalances: async (tripId, memberIds) => {
    const expenses: Expense[] = await db.expenses.where({ tripId }).toArray();
    const collections: Collection[] = await db.collections.where({ tripId }).toArray();

    return memberIds.map(memberId => {
      const splitTotal = expenses.reduce((sum, exp) => {
        const split = exp.splits.find(s => s.memberId === memberId);
        return sum + (split?.amount ?? 0);
      }, 0);

      const paidTotal = expenses.reduce((sum, exp) => {
        return exp.paidBy === memberId ? sum + exp.totalAmount : sum;
      }, 0);

      const collectedTotal = collections
        .filter(c => c.memberId === memberId)
        .reduce((sum, c) => sum + c.amount, 0);

      const balance = splitTotal - paidTotal - collectedTotal;

      return { memberId, splitTotal, paidTotal, collectedTotal, balance };
    });
  },
}));
