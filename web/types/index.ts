export type { Database } from "./database";

/** A team member as seen by a coach */
export interface TeamPlayer {
  id: string;
  userId: string;
  fullName: string;
  position: string | null;
  jerseyNumber: number | null;
  avatarUrl: string | null;
  /** ACWR ratio for current week */
  acwr: number | null;
  /** Sessions completed this week */
  weeklyCompliance: number;
  /** Sessions assigned this week */
  weeklyAssigned: number;
  status: "active" | "injured" | "resting";
}

/** Weekly load data point for ACWR chart */
export interface WeeklyLoad {
  week: string; // "Sem 1", etc.
  load: number;
  acwr: number;
}

/** Routine summary for coach routines list */
export interface RoutineSummary {
  id: string;
  name: string;
  type: "daily" | "weekly" | "monthly";
  sport: string | null;
  daysCount: number;
  exercisesCount: number;
  assignedCount: number;
  createdAt: string;
}

/** Notification / alert item */
export interface Alert {
  id: string;
  type: "risk" | "caution" | "info";
  playerName: string;
  message: string;
  time: string;
}
