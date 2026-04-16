import { useTheme } from "@/context/theme-context";
import type { Friend, UserSearchResult } from "@/hooks/useSocial";
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
  friends: Friend[];
  onClose: () => void;
  onSearch: (username: string) => Promise<UserSearchResult | null>;
  onSendRequest: (userId: string) => Promise<boolean>;
  onAccept: (friendshipId: string) => Promise<boolean>;
  onRemove: (friendshipId: string) => Promise<boolean>;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AddFriendModal({
  visible,
  friends,
  onClose,
  onSearch,
  onSendRequest,
  onAccept,
  onRemove,
}: Props) {
  const { colors } = useTheme();

  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<UserSearchResult | null | "not_found">(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const accepted = friends.filter((f) => f.status === "accepted");
  const pendingReceived = friends.filter((f) => f.status === "pending" && f.direction === "received");
  const pendingSent = friends.filter((f) => f.status === "pending" && f.direction === "sent");

  // Check if already connected to a search result
  const alreadyConnected = (userId: string) =>
    friends.some((f) => f.user_id === userId);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setResult(null);
    const found = await onSearch(query);
    setResult(found ?? "not_found");
    setSearching(false);
  };

  const handleSend = async (userId: string) => {
    setActionLoading(userId);
    const ok = await onSendRequest(userId);
    if (!ok) Alert.alert("Error", "No se pudo enviar la solicitud.");
    else {
      setResult(null);
      setQuery("");
    }
    setActionLoading(null);
  };

  const handleAccept = async (friendshipId: string) => {
    setActionLoading(friendshipId);
    await onAccept(friendshipId);
    setActionLoading(null);
  };

  const handleRemove = async (friendshipId: string, name: string) => {
    Alert.alert(
      "Eliminar amigo",
      `¿Querés eliminar a ${name} de tus amigos?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            setActionLoading(friendshipId);
            await onRemove(friendshipId);
            setActionLoading(null);
          },
        },
      ],
    );
  };

  const handleClose = () => {
    setQuery("");
    setResult(null);
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
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: "700" }}>Amigos</Text>
          <TouchableOpacity onPress={handleClose}>
            <Text style={{ color: colors.accent, fontSize: 16 }}>Listo</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Search ── */}
          <Text
            style={{
              color: colors.textMuted,
              fontSize: 11,
              letterSpacing: 1,
              marginBottom: 10,
            }}
          >
            BUSCAR POR USUARIO
          </Text>
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 6 }}>
            <TextInput
              value={query}
              onChangeText={(t) => {
                setQuery(t);
                setResult(null);
              }}
              placeholder="nombre de usuario"
              placeholderTextColor={colors.textDisabled}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
              style={{
                flex: 1,
                backgroundColor: colors.inputBg,
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 11,
                color: colors.text,
                fontSize: 14,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            />
            <TouchableOpacity
              onPress={handleSearch}
              disabled={searching || !query.trim()}
              activeOpacity={0.7}
              style={{
                backgroundColor: colors.accent,
                borderRadius: 10,
                paddingHorizontal: 16,
                justifyContent: "center",
                opacity: !query.trim() ? 0.4 : 1,
              }}
            >
              {searching ? (
                <ActivityIndicator color={colors.accentText} size="small" />
              ) : (
                <Text style={{ color: colors.accentText, fontWeight: "700" }}>Buscar</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Search result */}
          {result === "not_found" && (
            <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 20 }}>
              No se encontro ningun usuario con ese nombre.
            </Text>
          )}
          {result && result !== "not_found" && (
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 12,
                padding: 14,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: colors.border,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14 }}>
                  {result.name || result.username}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 1 }}>
                  @{result.username}
                </Text>
              </View>
              {alreadyConnected(result.id) ? (
                <Text style={{ color: colors.textDisabled, fontSize: 12 }}>Ya conectado</Text>
              ) : (
                <TouchableOpacity
                  onPress={() => handleSend(result.id)}
                  disabled={actionLoading === result.id}
                  activeOpacity={0.7}
                  style={{
                    backgroundColor: colors.accent,
                    borderRadius: 8,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                  }}
                >
                  {actionLoading === result.id ? (
                    <ActivityIndicator color={colors.accentText} size="small" />
                  ) : (
                    <Text style={{ color: colors.accentText, fontWeight: "700", fontSize: 13 }}>
                      Agregar
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* ── Pending received ── */}
          {pendingReceived.length > 0 && (
            <>
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 11,
                  letterSpacing: 1,
                  marginBottom: 10,
                }}
              >
                SOLICITUDES RECIBIDAS
              </Text>
              {pendingReceived.map((f) => (
                <View
                  key={f.friendship_id}
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: colors.border,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14 }}>
                      {f.name || f.username}
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 1 }}>
                      @{f.username}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleAccept(f.friendship_id)}
                    disabled={actionLoading === f.friendship_id}
                    activeOpacity={0.7}
                    style={{
                      backgroundColor: colors.accent,
                      borderRadius: 8,
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                    }}
                  >
                    {actionLoading === f.friendship_id ? (
                      <ActivityIndicator color={colors.accentText} size="small" />
                    ) : (
                      <Text style={{ color: colors.accentText, fontWeight: "700", fontSize: 13 }}>
                        Aceptar
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              ))}
              <View style={{ height: 12 }} />
            </>
          )}

          {/* ── Pending sent ── */}
          {pendingSent.length > 0 && (
            <>
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 11,
                  letterSpacing: 1,
                  marginBottom: 10,
                }}
              >
                SOLICITUDES ENVIADAS
              </Text>
              {pendingSent.map((f) => (
                <View
                  key={f.friendship_id}
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: colors.border,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14 }}>
                      {f.name || f.username}
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 1 }}>
                      @{f.username}
                    </Text>
                  </View>
                  <Text style={{ color: colors.textDisabled, fontSize: 12 }}>Pendiente</Text>
                </View>
              ))}
              <View style={{ height: 12 }} />
            </>
          )}

          {/* ── Accepted friends ── */}
          {accepted.length > 0 && (
            <>
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 11,
                  letterSpacing: 1,
                  marginBottom: 10,
                }}
              >
                AMIGOS ({accepted.length})
              </Text>
              {accepted.map((f) => (
                <View
                  key={f.friendship_id}
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: colors.border,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14 }}>
                      {f.name || f.username}
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 1 }}>
                      @{f.username}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemove(f.friendship_id, f.name || f.username)}
                    disabled={actionLoading === f.friendship_id}
                    activeOpacity={0.7}
                  >
                    <Text style={{ color: colors.error, fontSize: 13 }}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}

          {accepted.length === 0 && pendingReceived.length === 0 && pendingSent.length === 0 && (
            <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 8 }}>
              Todavia no tenes amigos agregados.
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
