import { create } from 'zustand';
import { db } from '../db';
import type { Collection } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { calcBalances as calcBalancesUtil } from '../utils/balanceCalc';

export interface MemberBalance {
  memberId: string;
  splitTotal: number;     // 分攤總額（應繳，排除公費）
  paidTotal: number;      // 代墊總額（含自身份額，排除公費）
  selfPaidTotal: number;  // 代墊中屬於自己的份額（自動列為已收）
  collectedTotal: number; // 手動收款總額
  displayCollected: number; // 顯示用已收 = selfPaidTotal + collectedTotal
  balance: number;        // (splitTotal + fundNet) - paidTotal - collectedTotal（正=應繳，負=待退）
  fundPrepaid: number;    // 預收公費總額（應收）
  fundExpenseShare: number; // 公費支出分攤總額
  fundNet: number;        // fundPrepaid - fundExpenseShare（正=公費剩餘，負=公費不足）
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
    const expenses = await db.expenses.where({ tripId }).toArray();
    const collections: Collection[] = await db.collections.where({ tripId }).toArray();
    return calcBalancesUtil(memberIds, expenses, collections);
  },
}));
