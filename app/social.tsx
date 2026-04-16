import AddFriendModal from "@/components/social/AddFriendModal";
import GroupSheet from "@/components/social/GroupSheet";
import LeaderboardList from "@/components/social/LeaderboardList";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { useSocial } from "@/hooks/useSocial";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SocialScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const social = useSocial();

  const [friendsVisible, setFriendsVisible] = useState(false);
  const [groupsVisible, setGroupsVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (user) social.refresh();
    }, [user]),
  );

  const acceptedFriends = social.friends.filter((f) => f.status === "accepted");
  const pendingReceived = social.friends.filter(
    (f) => f.status === "pending" && f.direction === "received",
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingTop: Platform.OS === "ios" ? 60 : 40,
          paddingBottom: 40,
        }}
      >
        {/* ── Header ── */}
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          style={{ marginBottom: 16 }}
        >
          <Text style={{ color: colors.accent, fontSize: 15 }}>← Volver</Text>
        </TouchableOpacity>
        <Text style={{ color: colors.text, fontSize: 26, fontWeight: "bold", marginBottom: 4 }}>
          Social
        </Text>
        <Text style={{ color: colors.textMuted, marginBottom: 28 }}>
          Ranking de sesiones con amigos y grupos
        </Text>

        {social.loading ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* ── Leaderboard ── */}
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 11,
                letterSpacing: 1,
                marginBottom: 12,
              }}
            >
              RANKING
            </Text>
            <LeaderboardList
              entries={social.leaderboard}
              period={social.period}
              loading={social.leaderboardLoading}
              currentUserId={user!.id}
              onChangePeriod={social.changePeriod}
            />

            {/* ── Friends ── */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 32,
                marginBottom: 12,
              }}
            >
              <Text style={{ color: colors.textMuted, fontSize: 11, letterSpacing: 1 }}>
                AMIGOS
                {pendingReceived.length > 0
                  ? `  ·  ${pendingReceived.length} solicitud${pendingReceived.length > 1 ? "es" : ""} pendiente${pendingReceived.length > 1 ? "s" : ""}`
                  : ""}
              </Text>
              <TouchableOpacity onPress={() => setFriendsVisible(true)} activeOpacity={0.7}>
                <Text style={{ color: colors.accent, fontSize: 13, fontWeight: "600" }}>
                  Gestionar
                </Text>
              </TouchableOpacity>
            </View>

            {acceptedFriends.length === 0 ? (
              <TouchableOpacity
                onPress={() => setFriendsVisible(true)}
                activeOpacity={0.8}
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 12,
                  padding: 18,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: "center" }}>
                  Agrega amigos para competir en el ranking.
                </Text>
                <Text style={{ color: colors.accent, fontSize: 13, fontWeight: "600", marginTop: 8 }}>
                  Agregar amigo
                </Text>
              </TouchableOpacity>
            ) : (
              <View
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  overflow: "hidden",
                }}
              >
                {acceptedFriends.map((f, i) => (
                  <View
                    key={f.friendship_id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      padding: 14,
                      borderTopWidth: i === 0 ? 0 : 1,
                      borderTopColor: colors.border,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14 }}>
                        {f.name || f.username}
                      </Text>
                      {f.username ? (
                        <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 1 }}>
                          @{f.username}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* ── Groups ── */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 32,
                marginBottom: 12,
              }}
            >
              <Text style={{ color: colors.textMuted, fontSize: 11, letterSpacing: 1 }}>
                GRUPOS
              </Text>
              <TouchableOpacity onPress={() => setGroupsVisible(true)} activeOpacity={0.7}>
                <Text style={{ color: colors.accent, fontSize: 13, fontWeight: "600" }}>
                  Gestionar
                </Text>
              </TouchableOpacity>
            </View>

            {social.groups.length === 0 ? (
              <TouchableOpacity
                onPress={() => setGroupsVisible(true)}
                activeOpacity={0.8}
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 12,
                  padding: 18,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: "center" }}>
                  Crea un grupo o unite con un codigo para entrenar con otros.
                </Text>
                <Text style={{ color: colors.accent, fontSize: 13, fontWeight: "600", marginTop: 8 }}>
                  Crear o unirse a un grupo
                </Text>
              </TouchableOpacity>
            ) : (
              <View
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  overflow: "hidden",
                }}
              >
                {social.groups.map((g, i) => (
                  <View
                    key={g.id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      padding: 14,
                      borderTopWidth: i === 0 ? 0 : 1,
                      borderTopColor: colors.border,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14 }}>
                        {g.name}
                      </Text>
                      <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 1 }}>
                        {g.member_count} {g.member_count === 1 ? "miembro" : "miembros"}
                      </Text>
                    </View>
                    <Text
                      style={{
                        color: colors.textDisabled,
                        fontSize: 12,
                        fontWeight: "700",
                        letterSpacing: 1,
                      }}
                    >
                      {g.invite_code}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* ── Modals ── */}
      <AddFriendModal
        visible={friendsVisible}
        friends={social.friends}
        onClose={() => setFriendsVisible(false)}
        onSearch={social.searchUser}
        onSendRequest={social.sendFriendRequest}
        onAccept={social.acceptFriendRequest}
        onRemove={social.removeFriend}
      />
      <GroupSheet
        visible={groupsVisible}
        groups={social.groups}
        currentUserId={user!.id}
        onClose={() => setGroupsVisible(false)}
        onCreate={social.createGroup}
        onJoin={social.joinGroup}
        onLeave={social.leaveGroup}
      />
    </View>
  );
}
