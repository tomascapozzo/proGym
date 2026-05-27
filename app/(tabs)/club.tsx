import InviteCodeCard from "@/components/club/InviteCodeCard";
import JoinClubModal from "@/components/club/JoinClubModal";
import ShareRoutineModal from "@/components/club/ShareRoutineModal";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { useClub } from "@/hooks/useClub";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
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

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
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

              {/* Routines — coming soon */}
              <View>
                <SectionHeader title="Rutinas del club" colors={colors} />
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
    </View>
  );
}
