import { create } from 'zustand';
import { db } from '../db';
import type { AppSettings, ExpenseType } from '../types';
import { createDefaultExpenseTypes } from '../data/defaultExpenseTypes';

interface AppSettingsState {
  settings: AppSettings | null;
  isLoading: boolean;
  loadSettings: () => Promise<void>;
  updateDefaultExpenseTypes: (types: ExpenseType[]) => Promise<void>;
}

export const useAppSettingsStore = create<AppSettingsState>((set) => ({
  settings: null,
  isLoading: false,

  loadSettings: async () => {
    set({ isLoading: true });
    try {
      let settings = await db.appSettings.get('global');
      if (!settings) {
        settings = { id: 'global', defaultExpenseTypes: createDefaultExpenseTypes() };
        await db.appSettings.put(settings);
      }
      set({ settings, isLoading: false });
    } catch (error) {
      console.error('Failed to load app settings', error);
      set({ isLoading: false });
    }
  },

  updateDefaultExpenseTypes: async (types) => {
    const updated: AppSettings = { id: 'global', defaultExpenseTypes: types };
    await db.appSettings.put(updated);
    set({ settings: updated });
  },
}));
