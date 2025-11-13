import { create } from "zustand";
import type { GetStreaksResponse } from "@/shared/contracts";

type Streak = GetStreaksResponse["streaks"][0];

interface StreaksState {
  streaks: Streak[];
  isLoading: boolean;
  error: string | null;
  setStreaks: (streaks: Streak[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  addStreak: (streak: Streak) => void;
  updateStreak: (id: string, updates: Partial<Streak>) => void;
}

export const useStreaksStore = create<StreaksState>((set) => ({
  streaks: [],
  isLoading: false,
  error: null,
  setStreaks: (streaks) => set({ streaks, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  addStreak: (streak) => set((state) => ({ streaks: [streak, ...state.streaks] })),
  updateStreak: (id, updates) =>
    set((state) => ({
      streaks: state.streaks.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    })),
}));
