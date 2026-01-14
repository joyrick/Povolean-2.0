"use client";

import type { ReactElement, ReactNode } from "react";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
} from "react";
import type { StepKey, StepsState, StepStatus } from "@/types/ui/step-types";
import { createDefaultStepsState } from "@/types/ui/step-types";

type StepsContextValue = {
  state: StepsState;
  setStepStatus: (key: StepKey, status: StepStatus) => void;
};

const StepsContext = createContext<StepsContextValue | undefined>(undefined);

type StepsProviderProps = {
  children: ReactNode;
};

export function StepsProvider({ children }: StepsProviderProps): ReactElement {
  const [state, setState] = useState<StepsState>(() =>
    createDefaultStepsState()
  );

  const setStepStatus = useCallback(
    (key: StepKey, status: StepStatus): void => {
      setState((prev) => ({
        ...prev,
        [key]: {
          ...(prev[key] ?? { status }),
          status,
          updatedAt: new Date().toISOString(),
        },
      }));
    },
    []
  );

  const value = useMemo(
    () => ({
      state,
      setStepStatus,
    }),
    [state, setStepStatus]
  );

  return (
    <StepsContext.Provider value={value}>{children}</StepsContext.Provider>
  );
}

export function useSteps(): StepsContextValue {
  const ctx = useContext(StepsContext);
  if (!ctx) {
    throw new Error("useSteps must be used within StepsProvider");
  }
  return ctx;
}
