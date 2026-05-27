import DayCard from "@/components/train/DayCard";
import { useTheme } from "@/context/theme-context";
import type { useRoutineCreator } from "@/hooks/useRoutineCreator";
import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ROUTINE_TYPES: { value: "daily" | "weekly" | "monthly"; label: string }[] = [
  { value: "daily", label: "Diaria" },
  { value: "weekly", label: "Semanal" },
  { value: "monthly", label: "Mensual" },
];

type Props = ReturnType<typeof useRoutineCreator>;

export default function RoutineCreatorModal({
  createVisible,
  closeCreateRoutine,
  newRoutineName,
  setNewRoutineName,
  newRoutineType,
  changeRoutineType,
  newDays,
  editingDayIdx,
  setEditingDayIdx,
  savingRoutine,
  addDay,
  updateDay,
  removeDay,
  updateExercise,
  updateExerciseSeries,
  updateExerciseRep,
  updateExercisePeso,
  removeExercise,
  openExPickerForDay,
  addCircuit,
  updateCircuit,
  removeCircuit,
  updateCircuitExRep,
  updateCircuitExPeso,
  removeCircuitEx,
  moveCircuitEx,
  openCircuitExPicker,
  saveRoutine,
}: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const canSave =
    !!newRoutineName.trim() &&
    newDays.length > 0 &&
    newDays.some(
      (d) =>
        d.ejercicios.length > 0 ||
        (d.circuitos ?? []).some((c) => c.ejercicios.length > 0),
    );

  return (
    <Modal visible={createVisible} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: insets.top,
              paddingHorizontal: 20,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.tabBorder,
            }}
          >
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: "700" }}>
              Crear rutina
            </Text>
            <TouchableOpacity onPress={closeCreateRoutine}>
              <Text style={{ color: colors.textMuted, fontSize: 16 }}>Cancelar</Text>
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <ScrollView
              contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
              keyboardShouldPersistTaps="handled"
            >
              {/* Routine name */}
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 11,
                  letterSpacing: 1,
                  marginBottom: 8,
                }}
              >
                NOMBRE DE LA RUTINA
              </Text>
              <TextInput
                value={newRoutineName}
                onChangeText={setNewRoutineName}
                placeholder="Ej: Push Pull Legs"
                placeholderTextColor={colors.textDisabled}
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 10,
                  padding: 14,
                  color: colors.text,
                  fontSize: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                  marginBottom: 24,
                }}
              />

              {/* Routine type */}
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 11,
                  letterSpacing: 1,
                  marginBottom: 8,
                }}
              >
                TIPO DE RUTINA
              </Text>
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 24 }}>
                {ROUTINE_TYPES.map(({ value, label }) => {
                  const active = newRoutineType === value;
                  return (
                    <TouchableOpacity
                      key={value}
                      onPress={() => changeRoutineType(value)}
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        borderRadius: 10,
                        borderWidth: 1.5,
                        borderColor: active ? colors.accent : colors.border,
                        backgroundColor: active ? colors.accentBg : colors.card,
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: active ? colors.accent : colors.textMuted,
                          fontWeight: active ? "700" : "400",
                          fontSize: 13,
                        }}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Days */}
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 11,
                  letterSpacing: 1,
                  marginBottom: 12,
                }}
              >
                DÍAS ({newDays.length})
              </Text>

              {newDays.map((day, dayIdx) => (
                <DayCard
                  key={dayIdx}
                  day={day}
                  dayIdx={dayIdx}
                  isEditing={editingDayIdx === dayIdx}
                  onToggleEdit={() =>
                    setEditingDayIdx(editingDayIdx === dayIdx ? null : dayIdx)
                  }
                  canRemove={newRoutineType !== "daily"}
                  onRemove={() => removeDay(dayIdx)}
                  onUpdateField={(f, v) => updateDay(dayIdx, f, v)}
                  onRemoveExercise={(exIdx) => removeExercise(dayIdx, exIdx)}
                  onUpdateDescanso={(exIdx, v) => updateExercise(dayIdx, exIdx, "descanso", v)}
                  onUpdateSeries={(exIdx, v) => updateExerciseSeries(dayIdx, exIdx, v)}
                  onUpdateRep={(exIdx, si, v) => updateExerciseRep(dayIdx, exIdx, si, v)}
                  onUpdatePeso={(exIdx, si, v) => updateExercisePeso(dayIdx, exIdx, si, v)}
                  onOpenExPicker={() => openExPickerForDay(dayIdx)}
                  onAddCircuit={() => addCircuit(dayIdx)}
                  onUpdateCircuit={(circIdx, f, v) => updateCircuit(dayIdx, circIdx, f, v)}
                  onRemoveCircuit={(circIdx) => removeCircuit(dayIdx, circIdx)}
                  onOpenCircuitExPicker={(circIdx) => openCircuitExPicker(dayIdx, circIdx)}
                  onMoveCircuitEx={(circIdx, exIdx, dir) =>
                    moveCircuitEx(dayIdx, circIdx, exIdx, dir)
                  }
                  onRemoveCircuitEx={(circIdx, exIdx) =>
                    removeCircuitEx(dayIdx, circIdx, exIdx)
                  }
                  onUpdateCircuitExRep={(circIdx, exIdx, ri, v) =>
                    updateCircuitExRep(dayIdx, circIdx, exIdx, ri, v)
                  }
                  onUpdateCircuitExPeso={(circIdx, exIdx, ri, v) =>
                    updateCircuitExPeso(dayIdx, circIdx, exIdx, ri, v)
                  }
                />
              ))}

              {newRoutineType !== "daily" && (
                <TouchableOpacity
                  onPress={addDay}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderStyle: "solid",
                    borderRadius: 14,
                    padding: 16,
                    alignItems: "center",
                    marginBottom: 20,
                  }}
                >
                  <Text style={{ color: colors.accent, fontWeight: "600" }}>
                    + Agregar día
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </KeyboardAvoidingView>

          {/* Save button */}
          {canSave && (
            <View
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: 20,
                paddingBottom: Platform.OS === "ios" ? 36 : 20,
                backgroundColor: colors.bg,
                borderTopWidth: 1,
                borderTopColor: colors.tabBorder,
              }}
            >
              <TouchableOpacity
                onPress={saveRoutine}
                disabled={savingRoutine}
                style={{
                  backgroundColor: colors.accent,
                  borderRadius: 14,
                  padding: 16,
                  alignItems: "center",
                  opacity: savingRoutine ? 0.7 : 1,
                }}
              >
                {savingRoutine ? (
                  <ActivityIndicator color={colors.accentText} size="small" />
                ) : (
                  <Text style={{ color: colors.accentText, fontWeight: "700", fontSize: 16 }}>
                    Guardar rutina
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

        </View>
      </Modal>
  );
}
