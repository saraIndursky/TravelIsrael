"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserRole } from "@/types";
import type { WizardPreferences } from "@/lib/utils/match-score";
import { DEMO_USER_ID } from "@/data/seed";

interface AuthState {
  role: UserRole;
  userId: string;
  setRole: (role: UserRole) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      role: "user",
      userId: DEMO_USER_ID,
      setRole: (role) =>
        set({
          role,
          userId: role === "admin" ? "admin-1" : role === "user" ? DEMO_USER_ID : "",
        }),
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
