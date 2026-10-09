"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, UserRole } from "@/types";
import type { WizardPreferences } from "@/lib/utils/match-score";

interface AuthState {
  role: UserRole;
  userId: string;
  userName: string;
  userEmail: string;
  avatarUrl?: string;
  setSession: (user: User | null) => void;
  logout: () => void;
}

const guestState = {
  role: "guest" as UserRole,
  userId: "",
  userName: "",
  userEmail: "",
  avatarUrl: undefined,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...guestState,
      setSession: (user) =>
        set(
          user
            ? {
                role: user.role,
                userId: user.id,
                userName: user.name,
                userEmail: user.email,
                avatarUrl: user.avatar_url,
              }
            : guestState
        ),
      logout: () => set(guestState),
    }),
    { name: "travel-israel-auth" }
  )
);

interface WizardState extends WizardPreferences {
  step: number;
  setStep: (step: number) => void;
  setPrefs: (prefs: Partial<WizardPreferences>) => void;
  reset: () => void;
}

const initialWizard: WizardPreferences & { step: number } = {
  step: 0,
  region: undefined,
  regionGroup: undefined,
  difficulty: undefined,
  difficultyLabel: undefined,
  accessibility: undefined,
  tripType: undefined,
  tags: [],
  specialPreferences: [],
  wetTrip: false,
  maxBudget: 0,
  durationHours: 0,
};

export const useWizardStore = create<WizardState>()(
  persist(
    (set) => ({
      ...initialWizard,
      setStep: (step) => set({ step }),
      setPrefs: (prefs) => set(prefs),
      reset: () => set(initialWizard),
    }),
    { name: "travel-israel-wizard" }
  )
);
