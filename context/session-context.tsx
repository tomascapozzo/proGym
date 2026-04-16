import type { SessionExercise, SetEntry } from "@/types/session";
import * as Haptics from "expo-haptics";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SessionParams = {
  type: string;
  dayData?: string;
  exercises?: string;
  dayIndex?: string;
  routineId?: string;
  routineType?: string;
  completedDays?: string;
  totalDays?: string;
};

type SessionContextType = {
  // State
  isActive: boolean;
  sessionTitle: string;
  sessionExercises: SessionExercise[];
  sessionParams: SessionParams;
  elapsed: number;
  restRemaining: number;
  restRunning: boolean;
  restVisible: boolean;
  trackingMode: "simple" | "detailed";
  completedSets: number;
  totalSets: number;
  currentExerciseName: string;

  // Session lifecycle
  startSession: (title: string, params: SessionParams, exercises: SessionExercise[]) => void;
  clearSession: () => void;

  // Exercise management
  setSessionExercises: React.Dispatch<React.SetStateAction<SessionExercise[]>>;
  addSet: (exIdx: number) => void;
  removeSet: (exIdx: number, setIdx: number) => void;
  removeExercise: (exIdx: number) => void;
  updateSet: (exIdx: number, setIdx: number, field: keyof Omit<SetEntry, "done">, value: string) => void;
  toggleDone: (exIdx: number, setIdx: number) => void;
  toggleExerciseMode: (exIdx: number) => void;
  setTrackingMode: React.Dispatch<React.SetStateAction<"simple" | "detailed">>;

  // Rest timer
  startRest: (seconds: number) => void;
  autoStartRest: (seconds: number) => void;
  skipRest: () => void;
  adjustRest: (delta: number) => void;
  setRestRunning: React.Dispatch<React.SetStateAction<boolean>>;
  setRestVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

// ─── Context ──────────────────────────────────────────────────────────────────

const SessionContext = createContext<SessionContextType | null>(null);

const EMPTY_PARAMS: SessionParams = { type: "free" };

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionParams, setSessionParams] = useState<SessionParams>(EMPTY_PARAMS);
  const [sessionExercises, setSessionExercises] = useState<SessionExercise[]>([]);
  const [trackingMode, setTrackingMode] = useState<"simple" | "detailed">("detailed");

  // Timers
  const [elapsed, setElapsed] = useState(0);
  const [restRemaining, setRestRemaining] = useState(60);
  const [restRunning, setRestRunning] = useState(false);
  const [restVisible, setRestVisible] = useState(false);

  const elapsedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Elapsed timer — runs as long as session is active ─────────────────────
  useEffect(() => {
    if (isActive) {
      elapsedIntervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
    }
    return () => {
      if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
    };
  }, [isActive]);

  // ── Rest timer ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (restRunning) {
      restIntervalRef.current = setInterval(() => {
        setRestRemaining((r) => {
          if (r <= 1) {
            setRestRunning(false);
            clearInterval(restIntervalRef.current!);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    } else {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    }
    return () => {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    };
  }, [restRunning]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const completedSets = sessionExercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.done).length,
    0,
  );
  const totalSets = sessionExercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const currentExerciseName =
    sessionExercises.find((ex) => ex.sets.some((s) => !s.done))?.exercise_name ??
    sessionExercises[sessionExercises.length - 1]?.exercise_name ??
    "";

  // ── Session lifecycle ─────────────────────────────────────────────────────
  const startSession = useCallback(
    (title: string, params: SessionParams, exercises: SessionExercise[]) => {
      setSessionTitle(title);
      setSessionParams(params);
      setSessionExercises(exercises);
      setElapsed(0);
      setRestRemaining(60);
      setRestRunning(false);
      setRestVisible(false);
      setTrackingMode("detailed");
      setIsActive(true);
    },
    [],
  );

  const clearSession = useCallback(() => {
    setIsActive(false);
    setSessionTitle("");
    setSessionParams(EMPTY_PARAMS);
    setSessionExercises([]);
    setElapsed(0);
    setRestRemaining(60);
    setRestRunning(false);
    setRestVisible(false);
  }, []);

  // ── Exercise management ───────────────────────────────────────────────────
  const addSet = useCallback((exIdx: number) => {
    setSessionExercises((prev) => {
      const updated = [...prev];
      updated[exIdx] = {
        ...updated[exIdx],
        sets: [...updated[exIdx].sets, { reps: "", weight: "", rpe: "", done: false }],
      };
      return updated;
    });
  }, []);

  const removeSet = useCallback((exIdx: number, setIdx: number) => {
    setSessionExercises((prev) => {
      const updated = [...prev];
      updated[exIdx] = {
        ...updated[exIdx],
        sets: updated[exIdx].sets.filter((_, i) => i !== setIdx),
      };
      return updated;
    });
  }, []);

  const removeExercise = useCallback((exIdx: number) => {
    setSessionExercises((prev) => prev.filter((_, i) => i !== exIdx));
  }, []);

  const updateSet = useCallback(
    (exIdx: number, setIdx: number, field: keyof Omit<SetEntry, "done">, value: string) => {
      setSessionExercises((prev) => {
        const updated = [...prev];
        const sets = [...updated[exIdx].sets];
        sets[setIdx] = { ...sets[setIdx], [field]: value };
        updated[exIdx] = { ...updated[exIdx], sets };
        return updated;
      });
    },
    [],
  );

  const toggleDone = useCallback(
    (exIdx: number, setIdx: number) => {
      setSessionExercises((prev) => {
        const wasAlreadyDone = prev[exIdx].sets[setIdx].done;
        const updated = [...prev];
        const sets = [...updated[exIdx].sets];
        sets[setIdx] = { ...sets[setIdx], done: !sets[setIdx].done };
        updated[exIdx] = { ...updated[exIdx], sets };

        if (!wasAlreadyDone) {
          const restSecs = prev[exIdx].restSeconds ?? 60;
          // Start rest after state update
          setTimeout(() => {
            if (restIntervalRef.current) clearInterval(restIntervalRef.current);
            setRestRemaining(restSecs);
            setRestRunning(true);
            setRestVisible(true);
          }, 0);
        }

        return updated;
      });
    },
    [],
  );

  const toggleExerciseMode = useCallback((exIdx: number) => {
    setSessionExercises((prev) => {
      const updated = [...prev];
      const cur = updated[exIdx].trackingMode;
      const cycle: (undefined | "simple" | "detailed")[] = [undefined, "simple", "detailed"];
      const idx = cycle.indexOf(cur);
      updated[exIdx] = { ...updated[exIdx], trackingMode: cycle[(idx + 1) % 3] };
      return updated;
    });
  }, []);

  // ── Rest timer actions ────────────────────────────────────────────────────
  const startRest = useCallback((seconds: number) => {
    if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    setRestRemaining(seconds);
    setRestRunning(true);
  }, []);

  const autoStartRest = useCallback((seconds: number) => {
    if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    setRestRemaining(seconds);
    setRestRunning(true);
    setRestVisible(true);
  }, []);

  const skipRest = useCallback(() => {
    if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    setRestRunning(false);
    setRestRemaining(0);
    setRestVisible(false);
  }, []);

  const adjustRest = useCallback((delta: number) => {
    setRestRemaining((r) => Math.max(5, r + delta));
  }, []);

  return (
    <SessionContext.Provider
      value={{
        isActive,
        sessionTitle,
        sessionExercises,
        sessionParams,
        elapsed,
        restRemaining,
        restRunning,
        restVisible,
        trackingMode,
        completedSets,
        totalSets,
        currentExerciseName,
        startSession,
        clearSession,
        setSessionExercises,
        addSet,
        removeSet,
        removeExercise,
        updateSet,
        toggleDone,
        toggleExerciseMode,
        setTrackingMode,
        startRest,
        autoStartRest,
        skipRest,
        adjustRest,
        setRestRunning,
        setRestVisible,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}
