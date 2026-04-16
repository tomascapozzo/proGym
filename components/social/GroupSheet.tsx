import { useTheme } from "@/context/theme-context";
import type { SocialGroup } from "@/hooks/useSocial";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  visible: boolean;
  groups: SocialGroup[];
  currentUserId: string;
  onClose: () => void;
  onCreate: (name: string) => Promise<boolean>;
  onJoin: (code: string) => Promise<string | null>;
  onLeave: (groupId: string) => Promise<boolean>;
};

type Tab = "create" | "join";

// ─── Component ────────────────────────────────────────────────────────────────

export default function GroupSheet({
  visible,
  groups,
  currentUserId,
  onClose,
  onCreate,
  onJoin,
  onLeave,
}: Props) {
  const { colors } = useTheme();

  const [tab, setTab] = useState<Tab>("create");
  const [groupName, setGroupName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!groupName.trim()) return;
    setLoading(true);
    const ok = await onCreate(groupName);
    if (!ok) Alert.alert("Error", "No se pudo crear el grupo.");
    else setGroupName("");
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) return;
    setLoading(true);
    const name = await onJoin(inviteCode);
    if (!name) Alert.alert("Codigo invalido", "No se encontro ningun grupo con ese codigo.");
    else {
      Alert.alert("Te uniste", `Ahora sos parte de "${name}".`);
      setInviteCode("");
    }
    setLoading(false);
  };

  const handleLeave = (group: SocialGroup) => {
    const isOwner = group.created_by === currentUserId;
    Alert.alert(
      isOwner ? "Eliminar grupo" : "Salir del grupo",
      isOwner
        ? `Sos el creador de "${group.name}". Si salis, el grupo se eliminara para todos.`
        : `¿Seguro que queres salir de "${group.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: isOwner ? "Eliminar" : "Salir",
          style: "destructive",
          onPress: async () => {
            await onLeave(group.id);
          },
        },
      ],
    );
  };

  // Simulate copy (native clipboard not required for this version)
  const handleCopyCode = (code: string) => {
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleClose = () => {
    setGroupName("");
    setInviteCode("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.bg }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: Platform.OS === "ios" ? 56 : 36,
            paddingHorizontal: 20,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: "700" }}>Grupos</Text>
          <TouchableOpacity onPress={handleClose}>
            <Text style={{ color: colors.accent, fontSize: 16 }}>Listo</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Tab toggle ── */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: colors.surface,
              borderRadius: 10,
              padding: 3,
              marginBottom: 20,
            }}
          >
            {(["create", "join"] as Tab[]).map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setTab(t)}
                activeOpacity={0.7}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 8,
                  alignItems: "center",
                  backgroundColor: tab === t ? colors.card : "transparent",
                }}
              >
                <Text
                  style={{
                    color: tab === t ? colors.text : colors.textMuted,
                    fontSize: 13,
                    fontWeight: tab === t ? "700" : "400",
                  }}
                >
                  {t === "create" ? "Crear grupo" : "Unirse con codigo"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Create ── */}
          {tab === "create" && (
            <View style={{ marginBottom: 28 }}>
              <TextInput
                value={groupName}
                onChangeText={setGroupName}
                placeholder="Nombre del grupo"
                placeholderTextColor={colors.textDisabled}
                style={{
                  backgroundColor: colors.inputBg,
                  borderRadius: 10,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  color: colors.text,
                  fontSize: 14,
                  borderWidth: 1,
                  borderColor: colors.border,
                  marginBottom: 12,
                }}
              />
              <TouchableOpacity
                onPress={handleCreate}
                disabled={loading || !groupName.trim()}
                activeOpacity={0.7}
                style={{
                  backgroundColor: colors.accent,
                  borderRadius: 10,
                  padding: 13,
                  alignItems: "center",
                  opacity: !groupName.trim() ? 0.4 : 1,
                }}
              >
                {loading ? (
                  <ActivityIndicator color={colors.accentText} />
                ) : (
                  <Text style={{ color: colors.accentText, fontWeight: "700", fontSize: 14 }}>
                    Crear grupo
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* ── Join ── */}
          {tab === "join" && (
            <View style={{ marginBottom: 28 }}>
              <TextInput
                value={inviteCode}
                onChangeText={setInviteCode}
                placeholder="Codigo de invitacion"
                placeholderTextColor={colors.textDisabled}
                autoCapitalize="characters"
                autoCorrect={false}
                style={{
                  backgroundColor: colors.inputBg,
                  borderRadius: 10,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  color: colors.text,
                  fontSize: 15,
                  fontWeight: "700",
                  letterSpacing: 2,
                  borderWidth: 1,
                  borderColor: colors.border,
                  marginBottom: 12,
                }}
              />
              <TouchableOpacity
                onPress={handleJoin}
                disabled={loading || !inviteCode.trim()}
                activeOpacity={0.7}
                style={{
                  backgroundColor: colors.accent,
                  borderRadius: 10,
                  padding: 13,
                  alignItems: "center",
                  opacity: !inviteCode.trim() ? 0.4 : 1,
                }}
              >
                {loading ? (
                  <ActivityIndicator color={colors.accentText} />
                ) : (
                  <Text style={{ color: colors.accentText, fontWeight: "700", fontSize: 14 }}>
                    Unirse
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* ── My groups ── */}
          {groups.length > 0 && (
            <>
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 11,
                  letterSpacing: 1,
                  marginBottom: 10,
                }}
              >
                MIS GRUPOS
              </Text>
              {groups.map((g) => (
                <View
                  key={g.id}
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 10,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.text, fontWeight: "700", fontSize: 15 }}>
                        {g.name}
                      </Text>
                      <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
                        {g.member_count} {g.member_count === 1 ? "miembro" : "miembros"}
                        {g.created_by === currentUserId ? "  ·  Creado por vos" : ""}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => handleLeave(g)} activeOpacity={0.7}>
                      <Text style={{ color: colors.error, fontSize: 13 }}>
                        {g.created_by === currentUserId ? "Eliminar" : "Salir"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Invite code row */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: colors.surface,
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      gap: 10,
                    }}
                  >
                    <Text style={{ color: colors.textMuted, fontSize: 11 }}>Codigo:</Text>
                    <Text
                      style={{
                        color: colors.text,
                        fontWeight: "700",
                        fontSize: 14,
                        letterSpacing: 2,
                        flex: 1,
                      }}
                    >
                      {g.invite_code}
                    </Text>
                    <TouchableOpacity onPress={() => handleCopyCode(g.invite_code)} activeOpacity={0.7}>
                      <Text
                        style={{
                          color: copiedCode === g.invite_code ? colors.accent : colors.textMuted,
                          fontSize: 12,
                          fontWeight: "600",
                        }}
                      >
                        {copiedCode === g.invite_code ? "Copiado" : "Copiar"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </>
          )}

          {groups.length === 0 && (
            <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 8 }}>
              Todavia no perteneces a ningun grupo.
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
