import { create } from 'zustand';

interface QuickStartState {
  memberNicknames: string[];
  addMemberNickname: (nickname: string) => void;
  // TODO: Add expense type caching later
}

const getMemberCache = (): string[] => {
  try {
    const data = localStorage.getItem('budgee_member_cache');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const useQuickStartStore = create<QuickStartState>((set, get) => ({
  memberNicknames: getMemberCache(),
  addMemberNickname: (nickname: string) => {
    const current = get().memberNicknames;
    if (!current.includes(nickname)) {
      const updated = [...current, nickname];
      localStorage.setItem('budgee_member_cache', JSON.stringify(updated));
      set({ memberNicknames: updated });
    }
  },
}));
