export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          username: string;
          onboarding_completed: boolean;
          edad: string | null;
          profesion: string | null;
          disponibilidad: string | null;
          equipamiento: string | null;
          nivel: string | null;
          actualidad: string | null;
          objetivo: string[] | null;
          peso: string | null;
          altura: string | null;
          lesiones: string | null;
          pr_exercises: string[];
          one_rm: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string;
          username?: string;
          onboarding_completed?: boolean;
          edad?: string | null;
          profesion?: string | null;
          disponibilidad?: string | null;
          equipamiento?: string | null;
          nivel?: string | null;
          actualidad?: string | null;
          objetivo?: string[] | null;
          peso?: string | null;
          altura?: string | null;
          lesiones?: string | null;
          pr_exercises?: string[];
          one_rm?: Json;
        };
        Update: {
          name?: string;
          username?: string;
          onboarding_completed?: boolean;
          edad?: string | null;
          profesion?: string | null;
          disponibilidad?: string | null;
          equipamiento?: string | null;
          nivel?: string | null;
          actualidad?: string | null;
          objetivo?: string[] | null;
          peso?: string | null;
          altura?: string | null;
          lesiones?: string | null;
          pr_exercises?: string[];
          one_rm?: Json;
        };
        Relationships: [];
      };
      exercises: {
        Row: {
          id: string;
          name: string;
          type: string | null;
          muscle_group: string;
          movement_pattern: string | null;
          equipment: string;
          difficulty: string | null;
          secondary_groups: string | null;
          modalities: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          name: string;
          type?: string | null;
          muscle_group: string;
          movement_pattern?: string | null;
          equipment: string;
          difficulty?: string | null;
          secondary_groups?: string | null;
          modalities?: string | null;
          notes?: string | null;
        };
        Update: {
          name?: string;
          type?: string | null;
          muscle_group?: string;
          movement_pattern?: string | null;
          equipment?: string;
          difficulty?: string | null;
          secondary_groups?: string | null;
          modalities?: string | null;
          notes?: string | null;
        };
        Relationships: [];
      };
      routines: {
        Row: {
          id: string;
          user_id: string;
          data: Json;
          type: string;
          status: string;
          progress: Json;
          created_at: string;
        };
        Insert: {
          user_id: string;
          data?: Json;
          type?: string;
          status?: string;
          progress?: Json;
        };
        Update: {
          user_id?: string;
          data?: Json;
          type?: string;
          status?: string;
          progress?: Json;
        };
        Relationships: [];
      };
      workout_logs: {
        Row: {
          id: string;
          user_id: string;
          notes: string | null;
          exercises: Json;
          duration_seconds: number | null;
          routine_id: string | null;
          routine_day_index: number | null;
          routine_day_name: string | null;
          routine_share_id: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          notes?: string | null;
          exercises?: Json;
          duration_seconds?: number | null;
          routine_id?: string | null;
          routine_day_index?: number | null;
          routine_day_name?: string | null;
          routine_share_id?: string | null;
        };
        Update: {
          user_id?: string;
          notes?: string | null;
          exercises?: Json;
          duration_seconds?: number | null;
          routine_id?: string | null;
          routine_day_index?: number | null;
          routine_day_name?: string | null;
          routine_share_id?: string | null;
        };
        Relationships: [];
      };
      clubs: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          logo_url: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          name: string;
          description?: string | null;
          logo_url?: string | null;
          created_by: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          logo_url?: string | null;
        };
        Relationships: [];
      };
      club_members: {
        Row: {
          id: string;
          club_id: string;
          user_id: string;
          role: "admin" | "coach" | "player";
          status: "active" | "suspended";
          joined_at: string;
        };
        Insert: {
          club_id: string;
          user_id: string;
          role: "admin" | "coach" | "player";
          status?: "active" | "suspended";
        };
        Update: {
          role?: "admin" | "coach" | "player";
          status?: "active" | "suspended";
        };
        Relationships: [];
      };
      club_groups: {
        Row: {
          id: string;
          club_id: string;
          name: string;
          description: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          club_id: string;
          name: string;
          description?: string | null;
          created_by: string;
        };
        Update: {
          name?: string;
          description?: string | null;
        };
        Relationships: [];
      };
      club_group_members: {
        Row: {
          id: string;
          group_id: string;
          user_id: string;
          added_by: string;
          added_at: string;
        };
        Insert: {
          group_id: string;
          user_id: string;
          added_by: string;
        };
        Update: {
          group_id?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      club_invitations: {
        Row: {
          id: string;
          club_id: string;
          created_by: string;
          code: string;
          role: "coach" | "player";
          max_uses: number | null;
          uses_count: number;
          expires_at: string | null;
          target_group_id: string | null;
          status: "active" | "expired" | "revoked";
          created_at: string;
        };
        Insert: {
          club_id: string;
          created_by: string;
          code: string;
          role: "coach" | "player";
          max_uses?: number | null;
          uses_count?: number;
          expires_at?: string | null;
          target_group_id?: string | null;
          status?: "active" | "expired" | "revoked";
        };
        Update: {
          max_uses?: number | null;
          uses_count?: number;
          expires_at?: string | null;
          target_group_id?: string | null;
          status?: "active" | "expired" | "revoked";
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_club_staff: {
        Args: { p_club_id: string };
        Returns: boolean;
      };
      is_club_member: {
        Args: { p_club_id: string };
        Returns: boolean;
      };
      redeem_club_invitation: {
        Args: { p_code: string };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
