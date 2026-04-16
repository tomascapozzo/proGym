import { useTheme } from "@/context/theme-context";
import type { LeaderboardEntry, Period } from "@/hooks/useSocial";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  entries: LeaderboardEntry[];
  period: Period;
  loading: boolean;
  currentUserId: string;
  onChangePeriod: (p: Period) => void;
};

const PERIOD_LABELS: Record<Period, string> = {
  week: "Esta semana",
  month: "Este mes",
  year: "Este año",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function LeaderboardList({
  entries,
  period,
  loading,
  currentUserId,
  onChangePeriod,
}: Props) {
  const { colors } = useTheme();

  return (
    <View>
      {/* Period selector */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: colors.surface,
          borderRadius: 10,
          padding: 3,
          marginBottom: 16,
        }}
      >
        {(["week", "month", "year"] as Period[]).map((p) => (
          <TouchableOpacity
            key={p}
            onPress={() => onChangePeriod(p)}
            activeOpacity={0.7}
            style={{
              flex: 1,
              paddingVertical: 7,
              borderRadius: 8,
              alignItems: "center",
              backgroundColor: period === p ? colors.card : "transparent",
            }}
          >
            <Text
              style={{
                color: period === p ? colors.text : colors.textMuted,
                fontSize: 12,
                fontWeight: period === p ? "700" : "400",
              }}
            >
              {PERIOD_LABELS[p]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator color={colors.accent} style={{ marginVertical: 24 }} />
      ) : entries.length === 0 ? (
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 24,
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: "center" }}>
            Agregá amigos o unite a un grupo para ver el ranking.
          </Text>
        </View>
      ) : (
        entries.map((entry, index) => {
          const isMe = entry.user_id === currentUserId;
          const rankColors = ["#F59E0B", "#94A3B8", "#B45309"];
          const rankColor = index < 3 ? rankColors[index] : colors.textDisabled;

          return (
            <View
              key={entry.user_id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: isMe ? colors.accentBgAlt : colors.card,
                borderRadius: 12,
                padding: 14,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: isMe ? colors.accent : colors.border,
              }}
            >
              {/* Rank */}
              <Text
                style={{
                  width: 28,
                  color: rankColor,
                  fontWeight: "700",
                  fontSize: 14,
                }}
              >
                {index + 1}
              </Text>

              {/* Name + username */}
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: colors.text,
                    fontWeight: isMe ? "700" : "600",
                    fontSize: 14,
                  }}
                >
                  {entry.name || entry.username}
                  {isMe ? "  (vos)" : ""}
                </Text>
                {entry.username ? (
                  <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 1 }}>
                    @{entry.username}
                  </Text>
                ) : null}
              </View>

              {/* Sessions count */}
              <View style={{ alignItems: "flex-end" }}>
                <Text
                  style={{
                    color: isMe ? colors.accent : colors.text,
                    fontWeight: "700",
                    fontSize: 18,
                  }}
                >
                  {entry.sessions}
                </Text>
                <Text style={{ color: colors.textDisabled, fontSize: 10 }}>
                  {entry.sessions === 1 ? "sesión" : "sesiones"}
                </Text>
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}
