import { buildRenderGroups, type RenderGroup } from "@/lib/session-utils";
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
  enrollmentId?: string;
  routineType?: string;
  completedDays?: string;
  totalDays?: string;
  rpePrompt?: string;
};

export type PendingRpe = {
  exIdx: number;
  setIdx: number;
  affectedExIndices: number[];
} | null;

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
  pendingRpe: PendingRpe;

  // Session lifecycle
  startSession: (title: string, params: SessionParams, exercises: SessionExercise[]) => void;
  clearSession: () => void;

  // Exercise management
  setSessionExercises: React.Dispatch<React.SetStateAction<SessionExercise[]>>;
  addSet: (exIdx: number) => void;
  removeSet: (exIdx: number, setIdx: number) => void;
  removeExercise: (exIdx: number) => void;
  replaceExercise: (exIdx: number, newId: string | undefined, newName: string) => void;
  updateSet: (exIdx: number, setIdx: number, field: keyof Omit<SetEntry, "done">, value: string) => void;
  fillDown: (exIdx: number, setIdx: number, field: "reps" | "weight") => void;
  toggleDone: (exIdx: number, setIdx: number) => void;
  toggleExerciseMode: (exIdx: number) => void;
  setTrackingMode: React.Dispatch<React.SetStateAction<"simple" | "detailed">>;
  reorderGroup: (groupIdx: number, direction: "up" | "down") => void;
  reorderCircuitExercise: (circuitId: string, liveExIdx: number, direction: "up" | "down") => void;
  skipSet: (exIdx: number, setIdx: number) => void;
  clearPendingRpe: () => void;

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

  const [pendingRpe, setPendingRpe] = useState<PendingRpe>(null);

  // Refs for timestamp-based timer math (survive renders without causing re-renders)
  const startTsRef = useRef<number | null>(null);
  const restExpiresAtRef = useRef<number | null>(null);
  const elapsedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Holds rest seconds while an RPE prompt is blocking the rest timer
  const pendingRestRef = useRef<number | null>(null);
  // Mirror of sessionParams for use inside stable callbacks
  const sessionParamsRef = useRef<SessionParams>(EMPTY_PARAMS);

  useEffect(() => { sessionParamsRef.current = sessionParams; }, [sessionParams]);

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
  const persistTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (isActive) {
      if (persistTimeoutRef.current) clearTimeout(persistTimeoutRef.current);
      persistTimeoutRef.current = setTimeout(() => {
        void AsyncStorage.setItem(KEYS.EXERCISES, JSON.stringify(sessionExercises));
      }, 400);
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
      const newSet: SetEntry = {
        reps: lastSet ? (lastSet.reps || lastSet.plannedReps || "") : "",
        weight: lastSet ? (lastSet.weight || lastSet.plannedWeight || "") : "",
        rpe: "",
        done: false,
      };
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

  const replaceExercise = useCallback((exIdx: number, newId: string | undefined, newName: string) => {
    setSessionExercises((prev) => {
      const updated = [...prev];
      const old = updated[exIdx];
      const doneSets = old.sets.filter((s) => s.done);
      const undoneSets = old.sets.filter((s) => !s.done);
      const freshSets = (old.circuitId && undoneSets.length > 0 ? undoneSets : [null]).map(
        () => ({ reps: "", weight: "", rpe: "", done: false } as SetEntry),
      );
      const newEx: SessionExercise = {
        exercise_id: newId,
        exercise_name: newName,
        sets: freshSets,
        ...(old.circuitId ? { circuitId: old.circuitId, circuitName: old.circuitName, restSeconds: old.restSeconds } : {}),
      };
      if (doneSets.length > 0) {
        updated[exIdx] = { ...old, sets: doneSets, archived: true };
        updated.splice(exIdx + 1, 0, newEx);
      } else {
        updated[exIdx] = newEx;
      }
      return updated;
    });
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
          if (sets[i][field] === "" && (field !== "reps" || !sets[i].plannedReps)) {
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

        let { reps, weight, plannedReps, plannedWeight } = sets[setIdx];
        if (!wasAlreadyDone) {
          const lastDone = [...sets.slice(0, setIdx)].reverse().find((s) => s.done);
          if (!reps) reps = plannedReps || lastDone?.reps || "";
          if (!weight) weight = lastDone?.weight || plannedWeight || "";
        }

        const newDone = !sets[setIdx].done;
        sets[setIdx] = {
          ...sets[setIdx],
          reps,
          weight,
          done: newDone,
          ...(wasAlreadyDone ? { skipped: false } : {}),
        };
        updated[exIdx] = { ...updated[exIdx], sets };

        if (!wasAlreadyDone) {
          const circuitId = prev[exIdx].circuitId;
          let shouldStartRest = true;
          if (circuitId) {
            const circuitExercises = updated.filter((e) => e.circuitId === circuitId);
            shouldStartRest = circuitExercises.every((e) => e.sets[setIdx]?.done === true);
          }

          const rpeMode = sessionParamsRef.current.rpePrompt ?? "sesion";
          let showRpe = false;
          let affectedExIndices: number[] = [exIdx];

          if (rpeMode === "serie") {
            // Prompt after every rest-triggering set (per individual exercise)
            showRpe = shouldStartRest;
          } else if (rpeMode === "bloque") {
            // Prompt only when a full block/round completes; store on all circuit exercises
            showRpe = shouldStartRest;
            if (circuitId && shouldStartRest) {
              affectedExIndices = updated
                .map((e, i) => (!e.archived && e.circuitId === circuitId ? i : -1))
                .filter((i) => i >= 0);
            }
          }

          if (showRpe) {
            const restSecs = prev[exIdx].restSeconds ?? 60;
            setTimeout(() => {
              setPendingRpe({ exIdx, setIdx, affectedExIndices });
              pendingRestRef.current = restSecs;
            }, 0);
          } else if (shouldStartRest) {
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

  const reorderGroup = useCallback((groupIdx: number, direction: "up" | "down") => {
    setSessionExercises((prev) => {
      const groups = buildRenderGroups(prev);
      const targetIdx = direction === "up" ? groupIdx - 1 : groupIdx + 1;
      if (targetIdx < 0 || targetIdx >= groups.length) return prev;

      const sourceGroup = groups[groupIdx];
      const targetGroup = groups[targetIdx];

      const getBlockIndices = (group: RenderGroup): number[] => {
        if (group.kind === "exercise") {
          const result: number[] = [];
          for (let i = group.exIdx - 1; i >= 0; i--) {
            if (prev[i].archived && !prev[i].circuitId) result.unshift(i);
            else break;
          }
          result.push(group.exIdx);
          return result;
        }
        return prev.map((ex, i) => (ex.circuitId === group.circuitId ? i : -1)).filter((i) => i >= 0);
      };

      const sourceIndices = getBlockIndices(sourceGroup);
      const targetIndices = getBlockIndices(targetGroup);
      const sourceExercises = sourceIndices.map((i) => prev[i]);
      const targetExercises = targetIndices.map((i) => prev[i]);

      const allMovingSet = new Set([...sourceIndices, ...targetIndices]);
      const rest = prev.map((ex, i) => ({ ex, i })).filter(({ i }) => !allMovingSet.has(i));

      const firstIdx = Math.min(sourceIndices[0], targetIndices[0]);
      const insertPoint = rest.findIndex(({ i }) => i > firstIdx);
      const insertAt = insertPoint === -1 ? rest.length : insertPoint;

      const [first, second] =
        direction === "up" ? [sourceExercises, targetExercises] : [targetExercises, sourceExercises];

      return [
        ...rest.slice(0, insertAt).map(({ ex }) => ex),
        ...first,
        ...second,
        ...rest.slice(insertAt).map(({ ex }) => ex),
      ];
    });
  }, []);

  const reorderCircuitExercise = useCallback(
    (circuitId: string, liveExIdx: number, direction: "up" | "down") => {
      setSessionExercises((prev) => {
        const circuitLiveIndices = prev
          .map((ex, i) => (!ex.archived && ex.circuitId === circuitId ? i : -1))
          .filter((i) => i >= 0);

        const posInCircuit = circuitLiveIndices.indexOf(liveExIdx);
        if (posInCircuit < 0) return prev;

        const targetPos = direction === "up" ? posInCircuit - 1 : posInCircuit + 1;
        if (targetPos < 0 || targetPos >= circuitLiveIndices.length) return prev;

        const updated = [...prev];
        const idxA = circuitLiveIndices[posInCircuit];
        const idxB = circuitLiveIndices[targetPos];
        [updated[idxA], updated[idxB]] = [updated[idxB], updated[idxA]];
        return updated;
      });
    },
    [],
  );

  const skipSet = useCallback((exIdx: number, setIdx: number) => {
    setSessionExercises((prev) => {
      const updated = [...prev];
      const sets = [...updated[exIdx].sets];
      sets[setIdx] = { ...sets[setIdx], done: true, skipped: true };
      updated[exIdx] = { ...updated[exIdx], sets };
      return updated;
    });
  }, []);

  // ── RPE prompt ────────────────────────────────────────────────────────────
  const clearPendingRpe = useCallback(() => {
    setPendingRpe(null);
    if (pendingRestRef.current !== null) {
      const secs = pendingRestRef.current;
      pendingRestRef.current = null;
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
      const expiresAt = Date.now() + secs * 1000;
      restExpiresAtRef.current = expiresAt;
      void AsyncStorage.setItem(KEYS.REST_EXPIRES_AT, String(expiresAt));
      setRestRemaining(secs);
      setRestRunning(true);
      setRestVisible(true);
    }
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
        pendingRpe,
        startSession,
        clearSession,
        setSessionExercises,
        addSet,
        removeSet,
        removeExercise,
        replaceExercise,
        updateSet,
        fillDown,
        toggleDone,
        toggleExerciseMode,
        setTrackingMode,
        reorderGroup,
        reorderCircuitExercise,
        skipSet,
        clearPendingRpe,
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
