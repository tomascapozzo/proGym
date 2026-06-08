import { supabase } from "@/lib/supabase";
import type { ClubMember } from "@/types/club";
import { Session, User } from "@supabase/supabase-js";
import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

type Profile = {
  id: string;
  name: string;
  lastname: string;
  onboarding_completed: boolean;
  edad?: string;
  peso?: string;
  altura?: string;
  position?: string;
  lesiones_previas?: { lesion: string; anio: string }[];
  gimnasio?: string;
  pr_exercises?: string[];
  one_rm?: Record<string, number>;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  clubMembership: ClubMember | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    name: string,
    lastname: string,
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshClubMembership: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  clubMembership: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  refreshProfile: async () => {},
  refreshClubMembership: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [clubMembership, setClubMembership] = useState<ClubMember | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const [{ data: profileData }, { data: memberData }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("club_members").select("*").eq("user_id", userId).maybeSingle(),
    ]);
    setProfile(profileData ?? null);
    setClubMembership(memberData ?? null);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        supabase.auth.signOut();
        setLoading(false);
        return;
      }
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          // INITIAL_SESSION is handled by getSession() above — skip to avoid double fetch
          if (event !== "INITIAL_SESSION") {
            setLoading(true);
            fetchProfile(session.user.id).finally(() => setLoading(false));
          }
        } else {
          setProfile(null);
          setClubMembership(null);
        }
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string, name: string, lastname: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };

    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        name,
        lastname,
        onboarding_completed: false,
      });
      if (profileError) return { error: profileError.message };
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  const refreshClubMembership = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("club_members")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    setClubMembership(data ?? null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        clubMembership,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        refreshClubMembership,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
