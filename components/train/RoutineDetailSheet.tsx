import { useTheme } from "@/context/theme-context";
import { ROUTINE_TYPE_LABELS, type Routine, type RoutineCircuit, type RoutineDay } from "@/types/routine";
import React from "react";
import {
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  routine: Routine | null;
  onClose: () => void;
  onStartDay: (day: RoutineDay, index: number) => void;
  onSkipDay: (index: number) => void;
  onUnskipDay: (index: number) => void;
  onDelete: () => void;
};

export default function RoutineDetailSheet({
  routine,
  onClose,
  onStartDay,
  onSkipDay,
  onUnskipDay,
  onDelete,
}: Props) {
  const { colors } = useTheme();

  const completed = routine?.progress?.completed_days ?? [];
  const skipped = routine?.progress?.skipped_days ?? [];
  const typeColor = routine ? colors.routineColors[routine.type] : colors.accent;

  // First non-completed non-skipped; fallback to first skipped if all remaining are skipped
  const nextIndex =
    routine?.data.dias.findIndex((_, i) => !completed.includes(i) && !skipped.includes(i)) ?? -1;
  const effectiveNextIndex =
    nextIndex !== -1
      ? nextIndex
      : (routine?.data.dias.findIndex((_, i) => !completed.includes(i)) ?? -1);

  return (
    <Modal visible={!!routine} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        {routine && (
          <>
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                justifyContent: "space-between",
                paddingTop: Platform.OS === "ios" ? 56 : 36,
                paddingHorizontal: 20,
                paddingBottom: 16,
                borderBottomWidth: 1,
                borderBottomColor: colors.tabBorder,
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
                    {completed.length}/{routine.data.dias.length} días
                  </Text>
                </View>
                <Text style={{ color: colors.text, fontSize: 20, fontWeight: "700" }}>
                  {routine.data.nombre}
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 16, paddingTop: 4 }}>
                <TouchableOpacity onPress={onDelete}>
                  <Text style={{ color: colors.error, fontSize: 14 }}>Eliminar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onClose}>
                  <Text style={{ color: colors.textMuted, fontSize: 16 }}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Days list */}
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 11,
                  letterSpacing: 1,
                  marginBottom: 12,
                }}
              >
                DÍAS ({routine.data.dias.length})
              </Text>

              {routine.data.dias.map((day, idx) => {
                const isDone = completed.includes(idx);
                const isSkipped = !isDone && skipped.includes(idx);
                const isNext = idx === effectiveNextIndex && !isDone;
                const isSkippedFallback = isNext && isSkipped;

                let borderColor = colors.border;
                if (isNext && !isSkipped) borderColor = typeColor + "66";
                if (isSkippedFallback) borderColor = colors.routineColors.skipped + "66";
                if (isSkipped && !isNext) borderColor = colors.routineColors.skipped + "33";

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
                    {/* Day header row */}
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                      {/* Status badge */}
                      <View
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 14,
                          backgroundColor: isDone
                            ? colors.routineColors.done + "33"
                            : isSkipped
                            ? colors.routineColors.skipped + "22"
                            : isNext
                            ? typeColor + "22"
                            : colors.accentBgAlt,
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                        }}
                      >
                        {isDone ? (
                          <Text style={{ color: colors.routineColors.done, fontSize: 13, fontWeight: "700" }}>✓</Text>
                        ) : isSkipped ? (
                          <Text style={{ color: colors.routineColors.skipped, fontSize: 11 }}>↷</Text>
                        ) : (
                          <Text style={{ color: isNext ? typeColor : colors.textMuted, fontSize: 12, fontWeight: "700" }}>
                            {idx + 1}
                          </Text>
                        )}
                      </View>

                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                          <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14 }}>
                            {day.dia}
                          </Text>
                          {isSkipped && (
                            <View
                              style={{
                                backgroundColor: colors.routineColors.skipped + "22",
                                borderRadius: 4,
                                paddingHorizontal: 6,
                                paddingVertical: 2,
                              }}
                            >
                              <Text style={{ color: colors.routineColors.skipped, fontSize: 9, fontWeight: "700", letterSpacing: 0.5 }}>
                                PENDIENTE
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 1 }}>
                          {[
                            day.enfoque,
                            day.ejercicios.length > 0 ? `${day.ejercicios.length} ejercicios` : null,
                            (day.circuitos ?? []).length > 0 ? `${(day.circuitos ?? []).length} circuito${(day.circuitos ?? []).length !== 1 ? "s" : ""}` : null,
                          ].filter(Boolean).join(" · ")}
                        </Text>
                      </View>

                      {/* Action buttons */}
                      <View style={{ flexDirection: "row", gap: 6 }}>
                        {isSkipped && (
                          <TouchableOpacity
                            onPress={() => onUnskipDay(idx)}
                            style={{
                              borderRadius: 8,
                              paddingHorizontal: 10,
                              paddingVertical: 7,
                              borderWidth: 1,
                              borderColor: colors.routineColors.skipped,
                              justifyContent: "center",
                            }}
                          >
                            <Text style={{ color: colors.routineColors.skipped, fontSize: 11, fontWeight: "700" }}>
                              Retomar
                            </Text>
                          </TouchableOpacity>
                        )}
                        {isNext && (
                          <TouchableOpacity
                            onPress={() => { onClose(); onStartDay(day, idx); }}
                            style={{
                              backgroundColor: isSkippedFallback ? colors.routineColors.skipped : typeColor,
                              borderRadius: 20,
                              width: 34,
                              height: 34,
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Text style={{ color: "#000", fontSize: 13, fontWeight: "700" }}>▶</Text>
                          </TouchableOpacity>
                        )}
                        {!isDone && !isSkipped && !isNext && (
                          <TouchableOpacity
                            onPress={() => onSkipDay(idx)}
                            style={{ padding: 6, justifyContent: "center" }}
                          >
                            <Text style={{ color: colors.textMuted, fontSize: 12 }}>Saltar</Text>
                          </TouchableOpacity>
                        )}
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
                        <Text style={{ color: colors.text, fontSize: 13, flex: 1 }}>{ej.nombre}</Text>
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
                            <Text style={{ color: colors.text, fontSize: 13, flex: 1 }}>{cEx.nombre}</Text>
                            <Text style={{ color: colors.textMuted, fontSize: 11 }}>{Array.isArray(cEx.reps) ? cEx.reps.join("/") : cEx.reps} reps</Text>
                          </View>
                        ))}
                      </View>
                    ))}
                  </View>
                );
              })}
            </ScrollView>
          </>
        )}
      </View>
    </Modal>
  );
}
