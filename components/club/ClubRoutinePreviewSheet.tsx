import { useTheme } from "@/context/theme-context";
import { ROUTINE_TYPE_LABELS, type Routine, type RoutineCircuit } from "@/types/routine";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  routine: Routine | null;
  enrollmentId: string | null;
  onClose: () => void;
  onStart: () => void;
};

export default function ClubRoutinePreviewSheet({ routine, onClose, onStart }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const completed = routine?.progress?.completed_days ?? [];
  const typeColor = routine ? colors.routineColors[routine.type] : colors.accent;
  const totalDays = routine?.data.dias.length ?? 0;

  const nextIndex =
    routine?.data.dias.findIndex((_, i) => !completed.includes(i)) ?? -1;

  const canStart = !!routine && routine.status === "active" && nextIndex !== -1;

  return (
    <Modal
      visible={!!routine}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        {routine && (
          <>
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                justifyContent: "space-between",
                paddingTop: insets.top,
                paddingHorizontal: 20,
                paddingBottom: 16,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <View
                    style={{
                      backgroundColor: typeColor + "22",
                      borderRadius: 6,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                    }}
                  >
                    <Text style={{ color: typeColor, fontSize: 10, fontWeight: "700", letterSpacing: 1 }}>
                      {ROUTINE_TYPE_LABELS[routine.type]}
                    </Text>
                  </View>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                    {completed.length}/{totalDays} dias
                  </Text>
                </View>
                <Text style={{ color: colors.text, fontSize: 20, fontWeight: "700" }}>
                  {routine.data.nombre}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={{ paddingTop: 4 }}>
                <Ionicons name="close" size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Days list */}
            <ScrollView
              contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 100 }}
            >
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 11,
                  letterSpacing: 1,
                  marginBottom: 12,
                }}
              >
                DIAS ({totalDays})
              </Text>

              {routine.data.dias.map((day, idx) => {
                const isDone = completed.includes(idx);
                const isNext = idx === nextIndex;

                const borderColor = isDone
                  ? colors.border
                  : isNext
                  ? typeColor + "66"
                  : colors.border;

                return (
                  <View
                    key={idx}
                    style={{
                      backgroundColor: colors.card,
                      borderRadius: 14,
                      padding: 16,
                      marginBottom: 10,
                      borderWidth: 1,
                      borderColor,
                      opacity: isDone ? 0.45 : 1,
                    }}
                  >
                    {/* Day header */}
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                      <View
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 14,
                          backgroundColor: isDone
                            ? colors.routineColors.done + "33"
                            : isNext
                            ? typeColor + "22"
                            : colors.accentBgAlt,
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                        }}
                      >
                        {isDone ? (
                          <Text style={{ color: colors.routineColors.done, fontSize: 13, fontWeight: "700" }}>
                            ✓
                          </Text>
                        ) : (
                          <Text
                            style={{
                              color: isNext ? typeColor : colors.textMuted,
                              fontSize: 12,
                              fontWeight: "700",
                            }}
                          >
                            {idx + 1}
                          </Text>
                        )}
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14 }}>
                          {day.dia}
                        </Text>
                        <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 1 }}>
                          {[
                            day.enfoque,
                            day.ejercicios.length > 0
                              ? `${day.ejercicios.length} ejercicios`
                              : null,
                            (day.circuitos ?? []).length > 0
                              ? `${(day.circuitos ?? []).length} circuito${(day.circuitos ?? []).length !== 1 ? "s" : ""}`
                              : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </Text>
                      </View>
                    </View>

                    {/* Standalone exercises */}
                    {day.ejercicios.map((ej, ei) => (
                      <View
                        key={ei}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          paddingVertical: 6,
                          borderTopWidth: ei === 0 ? 1 : 0,
                          borderTopColor: colors.border,
                          borderBottomWidth: 1,
                          borderBottomColor: colors.border,
                        }}
                      >
                        <Text style={{ color: colors.textMuted, fontSize: 12, width: 20 }}>
                          {ei + 1}.
                        </Text>
                        <Text style={{ color: colors.text, fontSize: 13, flex: 1 }}>
                          {ej.nombre}
                        </Text>
                        <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                          {ej.series}×{Array.isArray(ej.reps) ? ej.reps.join("/") : ej.reps}
                        </Text>
                      </View>
                    ))}

                    {/* Circuits */}
                    {(day.circuitos ?? []).map((circ: RoutineCircuit, ci) => (
                      <View
                        key={`circ-${ci}`}
                        style={{
                          marginTop: ci === 0 && day.ejercicios.length === 0 ? 0 : 8,
                          borderTopWidth: ci === 0 && day.ejercicios.length === 0 ? 1 : 0,
                          borderTopColor: colors.border,
                          borderWidth: 1,
                          borderColor: "#7C3AED44",
                          borderRadius: 10,
                          overflow: "hidden",
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                            paddingHorizontal: 10,
                            paddingVertical: 7,
                            backgroundColor: "#2E106522",
                          }}
                        >
                          <Text style={{ color: "#C4B5FD", fontSize: 10, fontWeight: "800", letterSpacing: 1 }}>
                            CIRCUITO
                          </Text>
                          {circ.nombre ? (
                            <Text style={{ color: "#C4B5FD", fontSize: 12, fontWeight: "600", flex: 1 }}>
                              {circ.nombre}
                            </Text>
                          ) : null}
                          <Text style={{ color: "#C4B5FD", fontSize: 11 }}>
                            {circ.rondas} rondas · {circ.descanso}
                          </Text>
                        </View>
                        {circ.ejercicios.map((cEx, ei) => (
                          <View
                            key={ei}
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              paddingVertical: 6,
                              paddingHorizontal: 10,
                              borderTopWidth: 1,
                              borderTopColor: colors.border,
                            }}
                          >
                            <Text style={{ color: "#C4B5FD", fontSize: 12, width: 20 }}>
                              {ei + 1}.
                            </Text>
                            <Text style={{ color: colors.text, fontSize: 13, flex: 1 }}>
                              {cEx.nombre}
                            </Text>
                            <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                              {Array.isArray(cEx.reps) ? cEx.reps.join("/") : cEx.reps} reps
                            </Text>
                          </View>
                        ))}
                      </View>
                    ))}
                  </View>
                );
              })}
            </ScrollView>

            {/* Bottom action */}
            {canStart && (
              <View
                style={{
                  paddingHorizontal: 20,
                  paddingTop: 12,
                  paddingBottom: insets.bottom + 12,
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                }}
              >
                <TouchableOpacity
                  onPress={() => { onClose(); onStart(); }}
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: colors.accent,
                    borderRadius: 14,
                    paddingVertical: 15,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: colors.accentText, fontSize: 15, fontWeight: "700" }}>
                    {completed.length > 0 ? "Continuar" : "Comenzar"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>
    </Modal>
  );
}
