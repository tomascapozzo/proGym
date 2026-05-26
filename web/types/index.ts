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

/** Mapping of keyboard key 0-9 to a tag label and color, with auto-clip duration */
export interface TagConfig {
  key: number;
  label: string;
  color: string;
  clipBefore: number;  // seconds to capture before the tag timestamp
  clipAfter: number;   // seconds to capture after the tag timestamp
}

/** A single tagged moment in a video */
export interface VideoTag {
  id: string;
  tagKey: number;
  timestamp: number;
  label: string;
  color: string;
  clipId?: string;  // ID of the auto-created clip for this tag
}

/** A clip range defined by start and end timestamps */
export interface VideoClip {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  tagId?: string;  // ID of the tag that auto-created this clip
}

// ── Squads (Planteles) ────────────────────────────────────────────────────────

export type SquadColor = "red" | "amber" | "blue" | "green" | "purple" | "pink" | "orange" | "teal";

export interface Squad {
  id: string;
  name: string;
  color: SquadColor;
  description: string | null;
  memberCount: number;
}

export interface TeamPlayerWithSquads extends TeamPlayer {
  squadIds: string[];
}

// ── Calendar (Calendario) ─────────────────────────────────────────────────────

export interface CalendarEvent {
  id: string;
  type: "entrenamiento" | "partido";
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string | null;
  opponent: string | null;
  location: "local" | "visitante" | null;
  squadIds: string[];
}

export type CalendarView = "month" | "week";
