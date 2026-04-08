import ExercisePicker from "@/components/ui/custom/ExercisePicker";
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

type Props = ReturnType<typeof useRoutineCreator>;

export default function RoutineCreatorModal({
  createVisible,
  closeCreateRoutine,
  newRoutineName,
  setNewRoutineName,
  newDays,
  editingDayIdx,
  setEditingDayIdx,
  savingRoutine,
  exPickerVisible,
  setExPickerVisible,
  circuitExPickerVisible,
  setCircuitExPickerVisible,
  library,
  loadingLibrary,
  addDay,
  updateDay,
  removeDay,
  updateExercise,
  removeExercise,
  openExPickerForDay,
  pickExercise,
  addCircuit,
  updateCircuit,
  removeCircuit,
  updateCircuitEx,
  removeCircuitEx,
  moveCircuitEx,
  openCircuitExPicker,
  pickCircuitExercise,
  pickExercises,
  saveRoutine,
}: Props) {

  const REST_OPTIONS = ["30s", "60s", "90s", "120s"];
  const { colors } = useTheme();

  const canSave =
    !!newRoutineName.trim() &&
    newDays.length > 0 &&
    newDays.some((d) => d.ejercicios.length > 0 || (d.circuitos ?? []).length > 0);

  return (
    <>
      {/* ── ROUTINE CREATION MODAL ── */}
      <Modal visible={createVisible} animationType="slide">
        <View style={{ flex: 1, backgroundColor: colors.bg }}>
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
                <View
                  key={dayIdx}
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 14,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: editingDayIdx === dayIdx ? colors.accent : colors.border,
                  }}
                >
                  {/* Day header */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() =>
                        setEditingDayIdx(editingDayIdx === dayIdx ? null : dayIdx)
                      }
                      style={{ flex: 1 }}
                    >
                      <Text
                        style={{ color: colors.text, fontWeight: "700", fontSize: 15 }}
                      >
                        {day.dia || `Día ${dayIdx + 1}`}
                        {day.enfoque ? (
                          <Text style={{ color: colors.accent, fontWeight: "400" }}>
                            {" "}· {day.enfoque}
                          </Text>
                        ) : null}
                      </Text>
                      <Text
                        style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}
                      >
                        {day.ejercicios.length} ejercicio
                        {day.ejercicios.length !== 1 ? "s" : ""}
                        {(day.circuitos ?? []).length > 0 &&
                          ` · ${(day.circuitos ?? []).length} circuito${
                            (day.circuitos ?? []).length !== 1 ? "s" : ""
                          }`}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeDay(dayIdx)}>
                      <Text style={{ color: colors.error, fontSize: 18, paddingLeft: 12 }}>
                        ×
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Day detail (expanded) */}
                  {editingDayIdx === dayIdx && (
                    <View>
                      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
                        <TextInput
                          value={day.dia}
                          onChangeText={(v) => updateDay(dayIdx, "dia", v)}
                          placeholder="Nombre del día"
                          placeholderTextColor={colors.textDisabled}
                          style={{
                            flex: 1,
                            backgroundColor: colors.surface,
                            borderRadius: 8,
                            padding: 10,
                            color: colors.text,
                            fontSize: 14,
                          }}
                        />
                        <TextInput
                          value={day.enfoque}
                          onChangeText={(v) => updateDay(dayIdx, "enfoque", v)}
                          placeholder="Enfoque"
                          placeholderTextColor={colors.textDisabled}
                          style={{
                            flex: 1,
                            backgroundColor: colors.surface,
                            borderRadius: 8,
                            padding: 10,
                            color: colors.text,
                            fontSize: 14,
                          }}
                        />
                      </View>

                      {/* Exercises in this day */}
                      {day.ejercicios.map((ej, exIdx) => (
                        <View
                          key={exIdx}
                          style={{
                            backgroundColor: colors.setRowBg,
                            borderRadius: 10,
                            padding: 12,
                            marginBottom: 8,
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: 8,
                            }}
                          >
                            <Text
                              style={{
                                color: colors.text,
                                fontWeight: "600",
                                fontSize: 13,
                                flex: 1,
                              }}
                              numberOfLines={1}
                            >
                              {ej.nombre}
                            </Text>
                            <TouchableOpacity onPress={() => removeExercise(dayIdx, exIdx)}>
                              <Text
                                style={{ color: colors.error, fontSize: 16, paddingLeft: 8 }}
                              >
                                ×
                              </Text>
                            </TouchableOpacity>
                          </View>

                          <View style={{ flexDirection: "row", gap: 6 }}>
                            <View style={{ flex: 1 }}>
                              <Text
                                style={{
                                  color: colors.textDisabled,
                                  fontSize: 10,
                                  marginBottom: 4,
                                }}
                              >
                                Series
                              </Text>
                              <TextInput
                                value={String(ej.series)}
                                onChangeText={(v) =>
                                  updateExercise(dayIdx, exIdx, "series", parseInt(v) || 0)
                                }
                                keyboardType="numeric"
                                style={{
                                  backgroundColor: colors.surface,
                                  borderRadius: 8,
                                  padding: 8,
                                  color: colors.text,
                                  textAlign: "center",
                                  fontSize: 14,
                                }}
                              />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text
                                style={{
                                  color: colors.textDisabled,
                                  fontSize: 10,
                                  marginBottom: 4,
                                }}
                              >
                                Reps
                              </Text>
                              <TextInput
                                value={ej.reps}
                                onChangeText={(v) =>
                                  updateExercise(dayIdx, exIdx, "reps", v)
                                }
                                style={{
                                  backgroundColor: colors.surface,
                                  borderRadius: 8,
                                  padding: 8,
                                  color: colors.text,
                                  textAlign: "center",
                                  fontSize: 14,
                                }}
                              />
                            </View>
                            <View style={{ flex: 2 }}>
                              <Text
                                style={{
                                  color: colors.textDisabled,
                                  fontSize: 10,
                                  marginBottom: 4,
                                }}
                              >
                                Descanso
                              </Text>
                              <View style={{ flexDirection: "row", gap: 4 }}>
                                {REST_OPTIONS.map((opt) => {
                                  const active = ej.descanso === opt;
                                  return (
                                    <TouchableOpacity
                                      key={opt}
                                      onPress={() => updateExercise(dayIdx, exIdx, "descanso", opt)}
                                      style={{
                                        flex: 1,
                                        backgroundColor: active ? colors.accent : colors.surface,
                                        borderRadius: 8,
                                        paddingVertical: 8,
                                        alignItems: "center",
                                      }}
                                    >
                                      <Text
                                        style={{
                                          color: active ? colors.accentText : colors.textDisabled,
                                          fontSize: 11,
                                          fontWeight: "600",
                                        }}
                                      >
                                        {opt}
                                      </Text>
                                    </TouchableOpacity>
                                  );
                                })}
                              </View>
                            </View>
                          </View>
                        </View>
                      ))}

                      {/* Add exercise to day */}
                      <TouchableOpacity
                        onPress={() => openExPickerForDay(dayIdx)}
                        style={{
                          padding: 10,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: colors.border,
                          alignItems: "center",
                          marginTop: 4,
                        }}
                      >
                        <Text style={{ color: colors.accent, fontSize: 13 }}>
                          + Agregar ejercicio
                        </Text>
                      </TouchableOpacity>

                      {/* Circuits in this day */}
                      {(day.circuitos ?? []).map((circ, circIdx) => (
                        <View
                          key={`circ-${circIdx}`}
                          style={{
                            backgroundColor: colors.setRowBg,
                            borderRadius: 10,
                            padding: 12,
                            marginTop: circIdx === 0 ? 14 : 0,
                            marginBottom: 8,
                            borderWidth: 1,
                            borderColor: "#7C3AED",
                          }}
                        >
                          {/* Circuit header */}
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              marginBottom: 8,
                              gap: 8,
                            }}
                          >
                            <View
                              style={{
                                backgroundColor: "#2E1065",
                                borderRadius: 6,
                                paddingHorizontal: 8,
                                paddingVertical: 3,
                              }}
                            >
                              <Text
                                style={{
                                  color: "#C4B5FD",
                                  fontSize: 9,
                                  fontWeight: "800",
                                  letterSpacing: 1,
                                }}
                              >
                                CIRCUITO
                              </Text>
                            </View>
                            <TextInput
                              value={circ.nombre}
                              onChangeText={(v) =>
                                updateCircuit(dayIdx, circIdx, "nombre", v)
                              }
                              placeholder="Nombre del circuito"
                              placeholderTextColor={colors.textDisabled}
                              style={{
                                flex: 1,
                                backgroundColor: colors.surface,
                                borderRadius: 8,
                                padding: 8,
                                color: "#C4B5FD",
                                fontWeight: "600",
                                fontSize: 13,
                              }}
                            />
                            <TouchableOpacity onPress={() => removeCircuit(dayIdx, circIdx)}>
                              <Text
                                style={{ color: colors.error, fontSize: 16, paddingLeft: 4 }}
                              >
                                ×
                              </Text>
                            </TouchableOpacity>
                          </View>

                          {/* Rounds & rest */}
                          <View style={{ flexDirection: "row", gap: 6, marginBottom: 10 }}>
                            <View style={{ flex: 1 }}>
                              <Text
                                style={{
                                  color: colors.textDisabled,
                                  fontSize: 10,
                                  marginBottom: 4,
                                }}
                              >
                                Rondas
                              </Text>
                              <TextInput
                                value={String(circ.rondas)}
                                onChangeText={(v) =>
                                  updateCircuit(dayIdx, circIdx, "rondas", parseInt(v) || 0)
                                }
                                keyboardType="numeric"
                                style={{
                                  backgroundColor: colors.surface,
                                  borderRadius: 8,
                                  padding: 8,
                                  color: colors.text,
                                  textAlign: "center",
                                  fontSize: 14,
                                }}
                              />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text
                                style={{
                                  color: colors.textDisabled,
                                  fontSize: 10,
                                  marginBottom: 4,
                                }}
                              >
                                Descanso
                              </Text>
                              <TextInput
                                value={circ.descanso}
                                onChangeText={(v) =>
                                  updateCircuit(dayIdx, circIdx, "descanso", v)
                                }
                                style={{
                                  backgroundColor: colors.surface,
                                  borderRadius: 8,
                                  padding: 8,
                                  color: colors.text,
                                  textAlign: "center",
                                  fontSize: 14,
                                }}
                              />
                            </View>
                          </View>

                          {/* Circuit exercises with reorder */}
                          {circ.ejercicios.map((cEx, exIdx) => (
                            <View
                              key={exIdx}
                              style={{
                                backgroundColor: colors.card,
                                borderRadius: 8,
                                padding: 10,
                                marginBottom: 6,
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              {/* Reorder buttons */}
                              <View style={{ alignItems: "center", justifyContent: "center", gap: 2 }}>
                                <TouchableOpacity
                                  onPress={() => moveCircuitEx(dayIdx, circIdx, exIdx, "up")}
                                  disabled={exIdx === 0}
                                  style={{ opacity: exIdx === 0 ? 0.2 : 1, padding: 2 }}
                                >
                                  <Text style={{ color: "#C4B5FD", fontSize: 10 }}>▲</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  onPress={() => moveCircuitEx(dayIdx, circIdx, exIdx, "down")}
                                  disabled={exIdx === circ.ejercicios.length - 1}
                                  style={{
                                    opacity: exIdx === circ.ejercicios.length - 1 ? 0.2 : 1,
                                    padding: 2,
                                  }}
                                >
                                  <Text style={{ color: "#C4B5FD", fontSize: 10 }}>▼</Text>
                                </TouchableOpacity>
                              </View>

                              {/* Number badge */}
                              <View
                                style={{
                                  width: 20,
                                  height: 20,
                                  borderRadius: 10,
                                  backgroundColor: "#2E1065",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Text
                                  style={{ color: "#C4B5FD", fontSize: 10, fontWeight: "700" }}
                                >
                                  {exIdx + 1}
                                </Text>
                              </View>

                              {/* Exercise name */}
                              <Text
                                style={{ color: colors.text, fontSize: 12, flex: 1 }}
                                numberOfLines={1}
                              >
                                {cEx.nombre}
                              </Text>

                              {/* Reps input */}
                              <TextInput
                                value={cEx.reps}
                                onChangeText={(v) =>
                                  updateCircuitEx(dayIdx, circIdx, exIdx, "reps", v)
                                }
                                style={{
                                  backgroundColor: colors.surface,
                                  borderRadius: 6,
                                  padding: 6,
                                  color: colors.text,
                                  textAlign: "center",
                                  fontSize: 12,
                                  width: 50,
                                }}
                              />
                              <Text style={{ color: colors.textDisabled, fontSize: 10 }}>
                                reps
                              </Text>

                              {/* Remove */}
                              <TouchableOpacity
                                onPress={() => removeCircuitEx(dayIdx, circIdx, exIdx)}
                              >
                                <Text
                                  style={{ color: colors.error, fontSize: 14, paddingLeft: 4 }}
                                >
                                  ×
                                </Text>
                              </TouchableOpacity>
                            </View>
                          ))}

                          {/* Add exercise to circuit */}
                          <TouchableOpacity
                            onPress={() => openCircuitExPicker(dayIdx, circIdx)}
                            style={{
                              borderWidth: 1,
                              borderColor: "#7C3AED",
                              borderStyle: "dashed",
                              borderRadius: 8,
                              padding: 10,
                              alignItems: "center",
                              marginTop: 4,
                            }}
                          >
                            <Text style={{ color: "#C4B5FD", fontSize: 12 }}>
                              + Agregar ejercicio
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ))}

                      {/* Create circuit button */}
                      <TouchableOpacity
                        onPress={() => addCircuit(dayIdx)}
                        style={{
                          padding: 10,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: "#7C3AED",
                          alignItems: "center",
                          marginTop: 8,
                        }}
                      >
                        <Text style={{ color: "#C4B5FD", fontSize: 13 }}>
                          + Crear circuito
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}

              {/* Add day button */}
              <TouchableOpacity
                onPress={addDay}
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderStyle: "dashed",
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
                  <Text
                    style={{ color: colors.accentText, fontWeight: "700", fontSize: 16 }}
                  >
                    Guardar rutina
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>

      {/* ── EXERCISE PICKER (for routine creation) ── */}
      <ExercisePicker
        visible={exPickerVisible}
        onClose={() => setExPickerVisible(false)}
        onSelect={pickExercise}
        onSelectMultiple={pickExercises}
        multiSelect
        library={library}
        loading={loadingLibrary}
        title="Elegir ejercicios"
      />

      {/* ── CIRCUIT EXERCISE PICKER ── */}
      <ExercisePicker
        visible={circuitExPickerVisible}
        onClose={() => setCircuitExPickerVisible(false)}
        onSelect={pickCircuitExercise}
        library={library}
        loading={loadingLibrary}
        title="Ejercicio para circuito"
      />
    </>
  );
}
