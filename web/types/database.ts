/**
 * Supabase database types — run `npx supabase gen types typescript`
 * to regenerate from your actual schema once connected.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string | null;
          avatar_url: string | null;
          role: "player" | "coach" | "admin";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      teams: {
        Row: {
          id: string;
          name: string;
          sport: string;
          created_by: string;
          invite_code: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["teams"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["teams"]["Insert"]>;
      };
      team_memberships: {
        Row: {
          id: string;
          team_id: string;
          user_id: string;
          role: "player" | "coach";
          position: string | null;
          jersey_number: number | null;
          joined_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["team_memberships"]["Row"], "id" | "joined_at">;
        Update: Partial<Database["public"]["Tables"]["team_memberships"]["Insert"]>;
      };
      routine_assignments: {
        Row: {
          id: string;
          team_id: string;
          routine_id: string;
          assigned_to: string | null; // null = whole team
          assigned_by: string;
          assigned_at: string;
          due_date: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["routine_assignments"]["Row"], "id" | "assigned_at">;
        Update: Partial<Database["public"]["Tables"]["routine_assignments"]["Insert"]>;
      };
      workout_logs: {
        Row: {
          id: string;
          user_id: string;
          team_id: string | null;
          routine_id: string | null;
          exercises: Json;
          duration_seconds: number;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["workout_logs"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["workout_logs"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: "player" | "coach" | "admin";
    };
  };
}
