import { useTheme } from "@/context/theme-context";
import type { ClubGroup, ClubInvitation } from "@/types/club";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface Props {
  invitation: ClubInvitation;
  groups: ClubGroup[];
  onRevoke?: (id: string) => void;
}

export default function InviteCodeCard({ invitation, groups, onRevoke }: Props) {
  const { colors } = useTheme();
  const [copied, setCopied] = useState(false);

  const targetGroup = groups.find((g) => g.id === invitation.target_group_id);
  const isCoach = invitation.role === "coach";
  const roleColor = isCoach ? colors.blue : colors.accent;
  const roleLabel = isCoach ? "Coach" : "Jugador";

  const handleCopy = async () => {
    await Clipboard.setStringAsync(invitation.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 14,
        gap: 10,
      }}
    >
      {/* Role + target group */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 6,
            backgroundColor: roleColor + "20",
          }}
        >
          <Text style={{ color: roleColor, fontSize: 11, fontWeight: "700" }}>
            {roleLabel}
          </Text>
        </View>
        {targetGroup && (
          <Text style={{ color: colors.textMuted, fontSize: 11 }}>
            {targetGroup.name}
          </Text>
        )}
        {!targetGroup && invitation.role === "player" && (
          <Text style={{ color: colors.textMuted, fontSize: 11 }}>
            Sin grupo asignado
          </Text>
        )}
      </View>

      {/* Code + copy button */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Text
          style={{
            flex: 1,
            color: colors.text,
            fontSize: 20,
            fontWeight: "800",
            letterSpacing: 2,
          }}
        >
          {invitation.code}
        </Text>
        <TouchableOpacity
          onPress={handleCopy}
          activeOpacity={0.7}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            backgroundColor: copied ? colors.accent + "20" : colors.surface,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 7,
          }}
        >
          <Ionicons
            name={copied ? "checkmark" : "copy-outline"}
            size={14}
            color={copied ? colors.accent : colors.textMuted}
          />
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: copied ? colors.accent : colors.textMuted,
            }}
          >
            {copied ? "Copiado" : "Copiar"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Usage stats + revoke */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ color: colors.textMuted, fontSize: 11 }}>
          {invitation.uses_count} uso{invitation.uses_count !== 1 ? "s" : ""}
          {invitation.max_uses != null ? ` / ${invitation.max_uses}` : ""}
        </Text>
        {onRevoke && (
          <TouchableOpacity onPress={() => onRevoke(invitation.id)} activeOpacity={0.7}>
            <Text style={{ color: colors.error, fontSize: 11, fontWeight: "600" }}>
              Revocar
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
