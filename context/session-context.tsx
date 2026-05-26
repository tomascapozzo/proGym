import type { SessionExercise, SetEntry } from "@/types/session";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState, type AppStateStatus } from "react-native";

// ─── Storage keys ─────────────────────────────────────────────────────────────

const KEYS = {
  START_TS: "session_start_ts",
  TITLE: "session_title",
  PARAMS: "session_params",
  EXERCISES: "session_exercises",
  REST_EXPIRES_AT: "session_rest_expires_at",
} as const;

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
  isRestoring: boolean;
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
  fillDown: (exIdx: number, setIdx: number, field: "reps" | "weight") => void;
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
  const [isRestoring, setIsRestoring] = useState(true);
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionParams, setSessionParams] = useState<SessionParams>(EMPTY_PARAMS);
  const [sessionExercises, setSessionExercises] = useState<SessionExercise[]>([]);
  const [trackingMode, setTrackingMode] = useState<"simple" | "detailed">("detailed");

  // Timers
  const [elapsed, setElapsed] = useState(0);
  const [restRemaining, setRestRemaining] = useState(60);
  const [restRunning, setRestRunning] = useState(false);
  const [restVisible, setRestVisible] = useState(false);

  // Refs for timestamp-based timer math (survive renders without causing re-renders)
  const startTsRef = useRef<number | null>(null);
  const restExpiresAtRef = useRef<number | null>(null);
  const elapsedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Timer recalc helpers ──────────────────────────────────────────────────

  const recalcElapsed = useCallback(() => {
    if (startTsRef.current !== null) {
      setElapsed(Math.floor((Date.now() - startTsRef.current) / 1000));
    }
  }, []);

  const recalcRest = useCallback(() => {
    if (restExpiresAtRef.current === null) return;
    const remaining = Math.max(0, Math.ceil((restExpiresAtRef.current - Date.now()) / 1000));
    setRestRemaining(remaining);
    if (remaining <= 0) {
      restExpiresAtRef.current = null;
      setRestRunning(false);
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      void AsyncStorage.removeItem(KEYS.REST_EXPIRES_AT);
    }
  }, []);

  // ── Elapsed timer — derives value from start timestamp each tick ──────────
  useEffect(() => {
    if (isActive) {
      elapsedIntervalRef.current = setInterval(recalcElapsed, 1000);
    } else {
      if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
    }
    return () => {
      if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
    };
  }, [isActive, recalcElapsed]);

  // ── Rest timer — derives remaining from absolute expiry each tick ─────────
  useEffect(() => {
    if (restRunning) {
      restIntervalRef.current = setInterval(recalcRest, 1000);
    } else {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    }
    return () => {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    };
  }, [restRunning, recalcRest]);

  // ── Persist exercises whenever they change during an active session ────────
  useEffect(() => {
    if (isActive) {
      void AsyncStorage.setItem(KEYS.EXERCISES, JSON.stringify(sessionExercises));
    }
  }, [sessionExercises, isActive]);

  // ── AppState listener: recalculate both timers on foreground resume ────────
  useEffect(() => {
    const handler = (nextState: AppStateStatus) => {
      if (nextState === "active" && startTsRef.current !== null) {
        recalcElapsed();
        recalcRest();
      }
    };
    const sub = AppState.addEventListener("change", handler);
    return () => sub.remove();
  }, [recalcElapsed, recalcRest]);

  // ── Session recovery on cold start ────────────────────────────────────────
  useEffect(() => {
    void (async () => {
      const startTsRaw = await AsyncStorage.getItem(KEYS.START_TS);
      if (!startTsRaw) {
        setIsRestoring(false);
        return;
      }

      const [title, paramsRaw, exercisesRaw, restExpiresRaw] = await Promise.all([
        AsyncStorage.getItem(KEYS.TITLE),
        AsyncStorage.getItem(KEYS.PARAMS),
        AsyncStorage.getItem(KEYS.EXERCISES),
        AsyncStorage.getItem(KEYS.REST_EXPIRES_AT),
      ]);

      const ts = parseInt(startTsRaw);
      startTsRef.current = ts;

      setSessionTitle(title ?? "");
      setSessionParams(paramsRaw ? JSON.parse(paramsRaw) : EMPTY_PARAMS);
      setSessionExercises(exercisesRaw ? JSON.parse(exercisesRaw) : []);
      setElapsed(Math.floor((Date.now() - ts) / 1000));

      if (restExpiresRaw) {
        const expiresAt = parseInt(restExpiresRaw);
        const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
        if (remaining > 0) {
          restExpiresAtRef.current = expiresAt;
          setRestRemaining(remaining);
          setRestRunning(true);
          setRestVisible(true);
        } else {
          void AsyncStorage.removeItem(KEYS.REST_EXPIRES_AT);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }

      setIsActive(true);
      setIsRestoring(false);
    })();
  }, []);

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
      const ts = Date.now();
      startTsRef.current = ts;
      void Promise.all([
        AsyncStorage.setItem(KEYS.START_TS, String(ts)),
        AsyncStorage.setItem(KEYS.TITLE, title),
        AsyncStorage.setItem(KEYS.PARAMS, JSON.stringify(params)),
        AsyncStorage.setItem(KEYS.EXERCISES, JSON.stringify(exercises)),
        AsyncStorage.removeItem(KEYS.REST_EXPIRES_AT),
      ]);

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
    startTsRef.current = null;
    restExpiresAtRef.current = null;
    void Promise.all([
      AsyncStorage.removeItem(KEYS.START_TS),
      AsyncStorage.removeItem(KEYS.TITLE),
      AsyncStorage.removeItem(KEYS.PARAMS),
      AsyncStorage.removeItem(KEYS.EXERCISES),
      AsyncStorage.removeItem(KEYS.REST_EXPIRES_AT),
    ]);

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
      const currentSets = updated[exIdx].sets;
      const lastSet = currentSets[currentSets.length - 1];
      const newSet: SetEntry = lastSet
        ? { reps: lastSet.reps, weight: lastSet.weight, rpe: "", done: false }
        : { reps: "", weight: "", rpe: "", done: false };
      updated[exIdx] = { ...updated[exIdx], sets: [...currentSets, newSet] };
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

  const fillDown = useCallback(
    (exIdx: number, setIdx: number, field: "reps" | "weight") => {
      setSessionExercises((prev) => {
        const value = prev[exIdx].sets[setIdx][field];
        if (!value) return prev;
        const updated = [...prev];
        const sets = [...updated[exIdx].sets];
        let changed = false;
        for (let i = setIdx + 1; i < sets.length; i++) {
          if (sets[i][field] === "") {
            sets[i] = { ...sets[i], [field]: value };
            changed = true;
          }
        }
        if (!changed) return prev;
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
          const circuitId = prev[exIdx].circuitId;
          let shouldStartRest = true;
          if (circuitId) {
            const circuitExercises = updated.filter((e) => e.circuitId === circuitId);
            shouldStartRest = circuitExercises.every((e) => e.sets[setIdx]?.done === true);
          }
          if (shouldStartRest) {
            const restSecs = prev[exIdx].restSeconds ?? 60;
            setTimeout(() => {
              if (restIntervalRef.current) clearInterval(restIntervalRef.current);
              const expiresAt = Date.now() + restSecs * 1000;
              restExpiresAtRef.current = expiresAt;
              void AsyncStorage.setItem(KEYS.REST_EXPIRES_AT, String(expiresAt));
              setRestRemaining(restSecs);
              setRestRunning(true);
              setRestVisible(true);
            }, 0);
          }
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
    const expiresAt = Date.now() + seconds * 1000;
    restExpiresAtRef.current = expiresAt;
    void AsyncStorage.setItem(KEYS.REST_EXPIRES_AT, String(expiresAt));
    setRestRemaining(seconds);
    setRestRunning(true);
  }, []);

  const autoStartRest = useCallback((seconds: number) => {
    if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    const expiresAt = Date.now() + seconds * 1000;
    restExpiresAtRef.current = expiresAt;
    void AsyncStorage.setItem(KEYS.REST_EXPIRES_AT, String(expiresAt));
    setRestRemaining(seconds);
    setRestRunning(true);
    setRestVisible(true);
  }, []);

  const skipRest = useCallback(() => {
    if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    restExpiresAtRef.current = null;
    void AsyncStorage.removeItem(KEYS.REST_EXPIRES_AT);
    setRestRunning(false);
    setRestRemaining(0);
    setRestVisible(false);
  }, []);

  const adjustRest = useCallback((delta: number) => {
    setRestRemaining((r) => {
      const newRemaining = Math.max(5, r + delta);
      const expiresAt = Date.now() + newRemaining * 1000;
      restExpiresAtRef.current = expiresAt;
      void AsyncStorage.setItem(KEYS.REST_EXPIRES_AT, String(expiresAt));
      return newRemaining;
    });
  }, []);

  return (
    <SessionContext.Provider
      value={{
        isActive,
        isRestoring,
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
        fillDown,
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
