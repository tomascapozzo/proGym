import ClubRoutinePreviewSheet from "@/components/club/ClubRoutinePreviewSheet";
import InviteCodeCard from "@/components/club/InviteCodeCard";
import JoinClubModal from "@/components/club/JoinClubModal";
import ShareRoutineModal from "@/components/club/ShareRoutineModal";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { useClub } from "@/hooks/useClub";
import { useSharedRoutines } from "@/hooks/useSharedRoutines";
import { supabase } from "@/lib/supabase";
import { getNextDay, type Routine } from "@/types/routine";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Role badge ────────────────────────────────────────────────────────────────
function RoleBadge({ role, colors }: { role: string; colors: any }) {
  const config =
    role === "admin"
      ? { label: "Admin", color: colors.error }
      : role === "coach"
        ? { label: "Coach", color: colors.blue }
        : { label: "Jugador", color: colors.accent };
  return (
    <View
      style={{
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        backgroundColor: config.color + "20",
      }}
    >
      <Text style={{ color: config.color, fontSize: 11, fontWeight: "700" }}>
        {config.label}
      </Text>
    </View>
  );
}

// ─── Section header ────────────────────────────────────────────────────────────
function SectionHeader({
  title,
  count,
  onAdd,
  colors,
}: {
  title: string;
  count?: number;
  onAdd?: () => void;
  colors: any;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: "700" }}>
          {title}
        </Text>
        {count != null && (
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 10,
              paddingHorizontal: 7,
              paddingVertical: 2,
            }}
          >
            <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: "600" }}>
              {count}
            </Text>
          </View>
        )}
      </View>
      {onAdd && (
        <TouchableOpacity onPress={onAdd} activeOpacity={0.7}>
          <Ionicons name="add-circle-outline" size={22} color={colors.accent} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function ClubScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const {
    loading,
    membership,
    club,
    groups,
    members,
    invitations,
    myGroups,
    isStaff,
    refresh,
    previewInvitation,
    redeemInvitation,
    revokeInvitation,
  } = useClub(user?.id);

  const [joinVisible, setJoinVisible] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [previewEnrollmentId, setPreviewEnrollmentId] = useState<string | null>(null);
  type FixtureMatch = {
    id: string;
    title: string;
    starts_at: string;
    opponent: string | null;
    location: string | null;
  };
  const [fixtures, setFixtures] = useState<FixtureMatch[]>([]);
  const [loadingFixtures, setLoadingFixtures] = useState(false);
  const [fixtureMonth, setFixtureMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  type SharedEnrollment = {
    id: string;
    status: string;
    progress: { completed_days: number[]; skipped_days?: number[] };
    enrolled_at: string;
    routine: { id: string; data: { nombre: string; dias: any[]; rpe_prompt?: string }; type: string } | null;
  };
  const [sharedRoutines, setSharedRoutines] = useState<SharedEnrollment[]>([]);
  const [loadingShared, setLoadingShared] = useState(false);
  const { syncSharedRoutines } = useSharedRoutines();

  const fetchFixtures = async () => {
    if (!club) return;
    setLoadingFixtures(true);
    const { data } = await supabase
      .from("club_events")
      .select("id, title, starts_at, opponent, location")
      .eq("club_id", club.id)
      .eq("type", "partido")
      .order("starts_at", { ascending: true });
    setFixtures((data ?? []) as FixtureMatch[]);
    setLoadingFixtures(false);
  };

  const fetchSharedRoutines = async () => {
    if (!user) return;
    setLoadingShared(true);
    await syncSharedRoutines();
    const { data } = await supabase
      .from("routine_enrollments")
      .select("id, status, progress, enrolled_at, routine:routines!routine_id(id, data, type)")
      .eq("user_id", user.id)
      .not("source_share_id", "is", null)
      .neq("status", "past")
      .order("enrolled_at", { ascending: false });
    setSharedRoutines((data ?? []) as unknown as SharedEnrollment[]);
    setLoadingShared(false);
  };

  useFocusEffect(
    useCallback(() => {
      if (!user || !membership || !club || isStaff) return;
      fetchFixtures();
      fetchSharedRoutines();
    }, [user, membership, club, isStaff]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refresh(), ...(!isStaff ? [fetchFixtures(), fetchSharedRoutines()] : [])]);
    setRefreshing(false);
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  // ── No club ──────────────────────────────────────────────────────────────
  if (!membership || !club) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <View
          style={{
            flex: 1,
            paddingHorizontal: 32,
            justifyContent: "center",
            alignItems: "center",
            gap: 16,
            paddingBottom: insets.bottom,
          }}
        >
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              backgroundColor: colors.accent + "18",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 8,
            }}
          >
            <Ionicons name="people-outline" size={36} color={colors.accent} />
          </View>

          <Text style={{ color: colors.text, fontSize: 22, fontWeight: "800", textAlign: "center" }}>
            Sin club todavia
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 14, textAlign: "center", lineHeight: 22 }}>
            Ingresa el codigo que te dio tu coach para unirte al club.
          </Text>

          <TouchableOpacity
            onPress={() => setJoinVisible(true)}
            activeOpacity={0.85}
            style={{
              backgroundColor: colors.accent,
              borderRadius: 14,
              paddingVertical: 15,
              width: "100%",
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <Text style={{ color: colors.accentText, fontSize: 15, fontWeight: "700" }}>
              Ingresar codigo
            </Text>
          </TouchableOpacity>
        </View>

        <JoinClubModal
          visible={joinVisible}
          onClose={() => setJoinVisible(false)}
          onPreview={previewInvitation}
          onConfirm={redeemInvitation}
        />
      </View>
    );
  }

  // ── Has club ─────────────────────────────────────────────────────────────
  const previewEnrollment = sharedRoutines.find((e) => e.id === previewEnrollmentId) ?? null;
  const previewRoutine: Routine | null = previewEnrollment?.routine
    ? {
        id: previewEnrollment.routine.id,
        enrollment_id: previewEnrollment.id,
        type: previewEnrollment.routine.type as Routine["type"],
        status: previewEnrollment.status as Routine["status"],
        progress: previewEnrollment.progress,
        data: previewEnrollment.routine.data as Routine["data"],
        created_at: previewEnrollment.enrolled_at,
      }
    : null;
  const previewSheet = (
    <ClubRoutinePreviewSheet
      routine={previewRoutine}
      enrollmentId={previewEnrollmentId}
      onClose={() => setPreviewEnrollmentId(null)}
      onStart={() => {
        if (!previewRoutine || !previewEnrollment) return;
        const nextDay = getNextDay(previewRoutine);
        if (!nextDay) return;
        router.push({
          pathname: "/session",
          params: {
            type: "routine",
            dayData: JSON.stringify(nextDay.day),
            dayIndex: String(nextDay.index),
            routineId: previewRoutine.id,
            enrollmentId: previewEnrollment.id,
            routineType: previewRoutine.type,
            completedDays: JSON.stringify(previewEnrollment.progress?.completed_days ?? []),
            totalDays: String(previewRoutine.data.dias?.length ?? 1),
            rpePrompt: previewRoutine.data.rpe_prompt ?? "sesion",
          },
        });
      }}
    />
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
          />
        }
      >
        {/* Club header */}
        <View
          style={{
            paddingTop: insets.top + 16,
            paddingHorizontal: 20,
            paddingBottom: 24,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 14 }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                backgroundColor: colors.accent + "20",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="people" size={28} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontSize: 22, fontWeight: "800", letterSpacing: -0.5 }}>
                {club.name}
              </Text>
              {club.description && (
                <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 2, lineHeight: 18 }}>
                  {club.description}
                </Text>
              )}
              <View style={{ marginTop: 8 }}>
                <RoleBadge role={membership.role} colors={colors} />
              </View>
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, gap: 28 }}>

          {/* ── STAFF VIEW ── */}
          {isStaff && (
            <>
              {/* Members */}
              <View>
                <SectionHeader title="Miembros" count={members.length} colors={colors} />
                <View style={{ gap: 8 }}>
                  {members.map((m) => (
                    <View
                      key={m.id}
                      style={{
                        backgroundColor: colors.card,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: colors.border,
                        padding: 14,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <View
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 19,
                          backgroundColor: colors.accent + "20",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text style={{ color: colors.accent, fontWeight: "700", fontSize: 15 }}>
                          {m.profile?.name?.[0]?.toUpperCase() ?? "?"}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14 }}>
                          {m.profile?.name ?? "—"}
                        </Text>
                        <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                          @{m.profile?.username ?? "—"}
                        </Text>
                      </View>
                      <RoleBadge role={m.role} colors={colors} />
                    </View>
                  ))}
                </View>
              </View>

              {/* Groups */}
              <View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={{ color: colors.text, fontSize: 16, fontWeight: "700" }}>
                      Grupos
                    </Text>
                    <View
                      style={{
                        backgroundColor: colors.surface,
                        borderRadius: 10,
                        paddingHorizontal: 7,
                        paddingVertical: 2,
                      }}
                    >
                      <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: "600" }}>
                        {groups.length}
                      </Text>
                    </View>
                  </View>
                  {groups.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setShareVisible(true)}
                      activeOpacity={0.7}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 5,
                        backgroundColor: colors.accent + "18",
                        borderRadius: 8,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                      }}
                    >
                      <Ionicons name="share-outline" size={14} color={colors.accent} />
                      <Text style={{ color: colors.accent, fontSize: 12, fontWeight: "700" }}>
                        Compartir rutina
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                {groups.length === 0 ? (
                  <Text style={{ color: colors.textMuted, fontSize: 13 }}>
                    Todavia no hay grupos. Crea uno desde el wizard o la configuracion del club.
                  </Text>
                ) : (
                  <View style={{ gap: 8 }}>
                    {groups.map((g) => (
                      <View
                        key={g.id}
                        style={{
                          backgroundColor: colors.card,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: colors.border,
                          padding: 14,
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <View
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            backgroundColor: colors.surface,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Ionicons name="people-outline" size={18} color={colors.textMuted} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14 }}>
                            {g.name}
                          </Text>
                          {g.description && (
                            <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                              {g.description}
                            </Text>
                          )}
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Invite codes */}
              <View>
                <SectionHeader title="Codigos de invitacion" count={invitations.length} colors={colors} />
                {invitations.length === 0 ? (
                  <Text style={{ color: colors.textMuted, fontSize: 13 }}>
                    No hay codigos activos. Genera uno desde la configuracion del club.
                  </Text>
                ) : (
                  <View style={{ gap: 10 }}>
                    {invitations.map((inv) => (
                      <InviteCodeCard
                        key={inv.id}
                        invitation={inv}
                        groups={groups}
                        onRevoke={membership.role === "admin" ? revokeInvitation : undefined}
                      />
                    ))}
                  </View>
                )}
              </View>
            </>
          )}

          {/* ── PLAYER VIEW ── */}
          {!isStaff && (
            <>
              {/* My groups */}
              <View>
                <SectionHeader title="Mis grupos" count={myGroups.length} colors={colors} />
                {myGroups.length === 0 ? (
                  <View
                    style={{
                      backgroundColor: colors.card,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: colors.border,
                      padding: 16,
                    }}
                  >
                    <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: "center" }}>
                      Todavia no estas en ningun grupo.{"\n"}Tu coach te agregara pronto.
                    </Text>
                  </View>
                ) : (
                  <View style={{ gap: 8 }}>
                    {myGroups.map((g) => (
                      <View
                        key={g.id}
                        style={{
                          backgroundColor: colors.card,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: colors.border,
                          padding: 14,
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <View
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            backgroundColor: colors.accent + "18",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Ionicons name="people-outline" size={18} color={colors.accent} />
                        </View>
                        <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14 }}>
                          {g.name}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Fixture */}
              <View>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: "700", marginBottom: 12 }}>
                  Fixture
                </Text>

                {/* Month navigator */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      const prev = new Date(fixtureMonth);
                      prev.setMonth(prev.getMonth() - 1);
                      setFixtureMonth(prev);
                    }}
                    activeOpacity={0.7}
                    style={{
                      width: 36, height: 36, borderRadius: 10,
                      backgroundColor: colors.surface,
                      alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Ionicons name="chevron-back" size={18} color={colors.text} />
                  </TouchableOpacity>

                  <Text style={{ color: colors.text, fontSize: 15, fontWeight: "700", textTransform: "capitalize" }}>
                    {fixtureMonth.toLocaleDateString("es-AR", { month: "long", year: "numeric" })}
                  </Text>

                  <TouchableOpacity
                    onPress={() => {
                      const next = new Date(fixtureMonth);
                      next.setMonth(next.getMonth() + 1);
                      setFixtureMonth(next);
                    }}
                    activeOpacity={0.7}
                    style={{
                      width: 36, height: 36, borderRadius: 10,
                      backgroundColor: colors.surface,
                      alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Ionicons name="chevron-forward" size={18} color={colors.text} />
                  </TouchableOpacity>
                </View>

                {/* Matches for selected month */}
                {loadingFixtures ? (
                  <ActivityIndicator color={colors.accent} style={{ alignSelf: "flex-start" }} />
                ) : (() => {
                  const monthMatches = fixtures.filter((m) => {
                    const d = new Date(m.starts_at);
                    return d.getFullYear() === fixtureMonth.getFullYear() &&
                      d.getMonth() === fixtureMonth.getMonth();
                  });
                  if (monthMatches.length === 0) {
                    return (
                      <View
                        style={{
                          backgroundColor: colors.card,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: colors.border,
                          padding: 16,
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ color: colors.textMuted, fontSize: 13 }}>
                          Sin partidos este mes.
                        </Text>
                      </View>
                    );
                  }
                  return (
                    <View
                      style={{
                        backgroundColor: colors.card,
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: colors.border,
                        overflow: "hidden",
                      }}
                    >
                      {monthMatches.map((match, i) => {
                        const d = new Date(match.starts_at);
                        const isLast = i === monthMatches.length - 1;
                        return (
                          <View
                            key={match.id}
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              paddingHorizontal: 14,
                              paddingVertical: 12,
                              borderBottomWidth: isLast ? 0 : 1,
                              borderBottomColor: colors.border,
                              gap: 12,
                            }}
                          >
                            <View style={{ width: 44, alignItems: "center" }}>
                              <Text
                                style={{
                                  color: colors.textMuted,
                                  fontSize: 10,
                                  fontWeight: "600",
                                  textTransform: "capitalize",
                                }}
                              >
                                {d.toLocaleDateString("es-AR", { weekday: "short" })}
                              </Text>
                              <Text
                                style={{
                                  color: colors.text,
                                  fontSize: 22,
                                  fontWeight: "800",
                                  lineHeight: 26,
                                }}
                              >
                                {d.getDate()}
                              </Text>
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text
                                style={{ color: colors.text, fontWeight: "700", fontSize: 14 }}
                                numberOfLines={1}
                              >
                                {match.opponent ? `vs. ${match.opponent}` : match.title}
                              </Text>
                            </View>
                            {match.location && (
                              <View
                                style={{
                                  backgroundColor: colors.accent + "18",
                                  borderRadius: 6,
                                  paddingHorizontal: 8,
                                  paddingVertical: 3,
                                }}
                              >
                                <Text style={{ color: colors.accent, fontSize: 11, fontWeight: "700" }}>
                                  {match.location === "local" ? "Local" : "Visita"}
                                </Text>
                              </View>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  );
                })()}
              </View>

              {/* Club routines */}
              <View>
                <SectionHeader title="Rutinas del club" count={sharedRoutines.length || undefined} colors={colors} />
                {loadingShared ? (
                  <ActivityIndicator color={colors.accent} style={{ alignSelf: "flex-start" }} />
                ) : sharedRoutines.length === 0 ? (
                  <View
                    style={{
                      backgroundColor: colors.card,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: colors.border,
                      padding: 16,
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Ionicons name="barbell-outline" size={24} color={colors.textDisabled} />
                    <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: "center" }}>
                      Tu coach no ha compartido rutinas todavia.
                    </Text>
                  </View>
                ) : (
                  <View style={{ gap: 10 }}>
                    {sharedRoutines.map((enrollment) => {
                      if (!enrollment.routine) return null;
                      const routine: Routine = {
                        id: enrollment.routine.id,
                        enrollment_id: enrollment.id,
                        type: enrollment.routine.type as Routine["type"],
                        status: enrollment.status as Routine["status"],
                        progress: enrollment.progress,
                        data: enrollment.routine.data as Routine["data"],
                        created_at: enrollment.enrolled_at,
                      };
                      const nextDay = getNextDay(routine);
                      const typeColor = colors.routineColors[routine.type];
                      const totalDays = routine.data.dias?.length ?? 1;
                      const completedCount = enrollment.progress?.completed_days?.length ?? 0;

                      const handlePreview = () => setPreviewEnrollmentId(enrollment.id);

                      return (
                        <View
                          key={enrollment.id}
                          style={{
                            backgroundColor: colors.card,
                            borderRadius: 14,
                            borderWidth: 1,
                            borderColor: colors.border,
                            padding: 16,
                            gap: 10,
                          }}
                        >
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                            <View style={{ flex: 1 }}>
                              <Text style={{ color: colors.text, fontWeight: "700", fontSize: 15 }} numberOfLines={1}>
                                {routine.data.nombre}
                              </Text>
                              {totalDays > 1 && (
                                <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
                                  {completedCount} de {totalDays} dias completados
                                </Text>
                              )}
                            </View>
                            <View
                              style={{
                                paddingHorizontal: 8,
                                paddingVertical: 3,
                                borderRadius: 6,
                                backgroundColor: typeColor + "20",
                              }}
                            >
                              <Text style={{ color: typeColor, fontSize: 11, fontWeight: "700" }}>
                                {routine.type === "daily" ? "Diaria" : routine.type === "weekly" ? "Semanal" : "Mensual"}
                              </Text>
                            </View>
                          </View>

                          {enrollment.status === "active" && nextDay ? (
                            <TouchableOpacity
                              onPress={handlePreview}
                              activeOpacity={0.85}
                              style={{
                                backgroundColor: colors.surface,
                                borderRadius: 10,
                                paddingVertical: 10,
                                alignItems: "center",
                                borderWidth: 1,
                                borderColor: colors.border,
                              }}
                            >
                              <Text style={{ color: colors.text, fontWeight: "700", fontSize: 14 }}>
                                Visualizar
                              </Text>
                            </TouchableOpacity>
                          ) : enrollment.status === "pending_restart" ? (
                            <Text style={{ color: colors.textMuted, fontSize: 13 }}>
                              Semana completada — esperando reinicio
                            </Text>
                          ) : (
                            <Text style={{ color: colors.textMuted, fontSize: 13 }}>
                              Completada
                            </Text>
                          )}
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {isStaff && club && user && (
        <ShareRoutineModal
          visible={shareVisible}
          onClose={() => setShareVisible(false)}
          userId={user.id}
          clubId={club.id}
          groups={groups}
        />
      )}

      {!isStaff && previewSheet}
    </View>
  );
}
