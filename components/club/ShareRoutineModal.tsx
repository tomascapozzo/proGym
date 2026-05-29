import { useTheme } from "@/context/theme-context";
import { supabase } from "@/lib/supabase";
import type { ClubGroup } from "@/types/club";
import { ROUTINE_TYPE_LABELS, type Routine, type RoutineType } from "@/types/routine";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  visible: boolean;
  onClose: () => void;
  userId: string;
  clubId: string;
  groups: ClubGroup[];
}

type Step = "routine" | "group";

export default function ShareRoutineModal({ visible, onClose, userId, clubId, groups }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<Step>("routine");
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loadingRoutines, setLoadingRoutines] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<ClubGroup | null>(null);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setStep("routine");
      setSelectedRoutine(null);
      setSelectedGroup(null);
      setError(null);
      loadRoutines();
    }
  }, [visible]);

  const loadRoutines = async () => {
    setLoadingRoutines(true);
    const { data } = await supabase
      .from("routines")
      .select("*")
      .eq("user_id", userId)
      .not("status", "eq", "past")
      .order("created_at", { ascending: false });
    setRoutines((data as Routine[]) ?? []);
    setLoadingRoutines(false);
  };

  const handleShare = async () => {
    if (!selectedRoutine || !selectedGroup) return;
    setSharing(true);
    setError(null);

    const { error: insertError } = await supabase.from("routine_shares").insert({
      routine_id: selectedRoutine.id,
      shared_by: userId,
      club_id: clubId,
      target_type: "group",
      target_group_id: selectedGroup.id,
    });

    setSharing(false);

    if (insertError) {
      setError("No se pudo compartir la rutina. Intenta de nuevo.");
      return;
    }

    onClose();
  };

  const handleClose = () => {
    if (!sharing) onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        {/* Header */}
        <View
          style={{
            paddingTop: insets.top + 16,
            paddingHorizontal: 20,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: "800" }}>
              Compartir rutina
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 2 }}>
              {step === "routine" ? "Elegí la rutina a compartir" : `"${selectedRoutine?.data.nombre}" · Elegí el grupo`}
            </Text>
          </View>
          <TouchableOpacity onPress={handleClose} activeOpacity={0.7} disabled={sharing}>
            <Ionicons name="close" size={22} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Step: routine picker */}
        {step === "routine" && (
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 20 }}>
            {loadingRoutines ? (
              <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
            ) : routines.length === 0 ? (
              <View style={{ alignItems: "center", paddingTop: 60, gap: 12 }}>
                <Ionicons name="barbell-outline" size={36} color={colors.textDisabled} />
                <Text style={{ color: colors.textMuted, fontSize: 14, textAlign: "center" }}>
                  No tenés rutinas para compartir.{"\n"}Crea una primero en la pantalla de entrenamiento.
                </Text>
              </View>
            ) : (
              <View style={{ gap: 10 }}>
                {routines.map((routine) => {
                  const typeColor = colors.routineColors[routine.type as RoutineType];
                  return (
                    <TouchableOpacity
                      key={routine.id}
                      onPress={() => { setSelectedRoutine(routine); setStep("group"); }}
                      activeOpacity={0.8}
                      style={{
                        backgroundColor: colors.card,
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: colors.border,
                        padding: 16,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <View
                          style={{
                            backgroundColor: typeColor + "22",
                            borderRadius: 6,
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                            alignSelf: "flex-start",
                            marginBottom: 6,
                          }}
                        >
                          <Text style={{ color: typeColor, fontSize: 10, fontWeight: "700", letterSpacing: 1 }}>
                            {ROUTINE_TYPE_LABELS[routine.type]}
                          </Text>
                        </View>
                        <Text style={{ color: colors.text, fontWeight: "700", fontSize: 15 }}>
                          {routine.data.nombre}
                        </Text>
                        <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
                          {routine.data.dias.length} día{routine.data.dias.length !== 1 ? "s" : ""}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </ScrollView>
        )}

        {/* Step: group picker */}
        {step === "group" && (
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 20 }}>
            {groups.length === 0 ? (
              <View style={{ alignItems: "center", paddingTop: 60, gap: 12 }}>
                <Ionicons name="people-outline" size={36} color={colors.textDisabled} />
                <Text style={{ color: colors.textMuted, fontSize: 14, textAlign: "center" }}>
                  No hay grupos en el club todavia.
                </Text>
              </View>
            ) : (
              <View style={{ gap: 10 }}>
                {groups.map((group) => {
                  const isSelected = selectedGroup?.id === group.id;
                  return (
                    <TouchableOpacity
                      key={group.id}
                      onPress={() => setSelectedGroup(isSelected ? null : group)}
                      activeOpacity={0.8}
                      style={{
                        backgroundColor: isSelected ? colors.accent + "18" : colors.card,
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: isSelected ? colors.accent : colors.border,
                        padding: 16,
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
                          backgroundColor: isSelected ? colors.accent + "30" : colors.surface,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Ionicons
                          name="people-outline"
                          size={18}
                          color={isSelected ? colors.accent : colors.textMuted}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.text, fontWeight: "600", fontSize: 15 }}>
                          {group.name}
                        </Text>
                        {group.description && (
                          <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
                            {group.description}
                          </Text>
                        )}
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {error && (
              <Text style={{ color: colors.error, fontSize: 13, marginTop: 16, textAlign: "center" }}>
                {error}
              </Text>
            )}
          </ScrollView>
        )}

        {/* Bottom bar (group step only) */}
        {step === "group" && (
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: insets.bottom + 12,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              flexDirection: "row",
              gap: 10,
            }}
          >
            <TouchableOpacity
              onPress={() => { setSelectedGroup(null); setStep("routine"); }}
              activeOpacity={0.7}
              disabled={sharing}
              style={{
                flex: 1,
                borderRadius: 14,
                paddingVertical: 15,
                alignItems: "center",
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ color: colors.textMuted, fontSize: 15, fontWeight: "600" }}>
                Volver
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleShare}
              disabled={!selectedGroup || sharing}
              activeOpacity={0.85}
              style={{
                flex: 2,
                backgroundColor: colors.accent,
                borderRadius: 14,
                paddingVertical: 15,
                alignItems: "center",
                opacity: !selectedGroup || sharing ? 0.5 : 1,
              }}
            >
              {sharing ? (
                <ActivityIndicator color={colors.accentText} />
              ) : (
                <Text style={{ color: colors.accentText, fontSize: 15, fontWeight: "700" }}>
                  Compartir con {selectedGroup?.name ?? "grupo"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}
