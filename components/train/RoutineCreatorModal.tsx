import ExercisePicker from "@/components/ui/custom/ExercisePicker";
import { useTheme } from "@/context/theme-context";
import type { useRoutineCreator } from "@/hooks/useRoutineCreator";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// 30s → 180s in 5s steps
const REST_OPTIONS = Array.from({ length: 31 }, (_, i) => `${30 + i * 5}s`);

function RestPicker({
  value,
  onChange,
  colors,
}: {
  value: string;
  onChange: (v: string) => void;
  colors: any;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={{
          backgroundColor: colors.accent,
          borderRadius: 8,
          paddingVertical: 8,
          paddingHorizontal: 12,
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          alignSelf: "flex-start",
        }}
      >
        <Text style={{ color: colors.accentText, fontSize: 12, fontWeight: "700" }}>
          {value || "60s"}
        </Text>
        <Text style={{ color: colors.accentText, fontSize: 9 }}>▼</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide">
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}
          onPress={() => setOpen(false)}
        >
          <Pressable>
            <View
              style={{
                backgroundColor: colors.card,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                borderTopWidth: 1,
                borderLeftWidth: 1,
                borderRightWidth: 1,
                borderColor: colors.border,
                maxHeight: 380,
              }}
            >
              {/* Handle + title */}
              <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 4 }}>
                <View
                  style={{
                    width: 36,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: colors.border,
                    marginBottom: 12,
                  }}
                />
                <Text style={{ color: colors.textMuted, fontSize: 11, letterSpacing: 1 }}>
                  DESCANSO
                </Text>
              </View>

              <ScrollView>
                {REST_OPTIONS.map((opt) => {
                  const active = value === opt;
                  return (
                    <TouchableOpacity
                      key={opt}
                      onPress={() => { onChange(opt); setOpen(false); }}
                      style={{
                        paddingVertical: 15,
                        paddingHorizontal: 24,
                        backgroundColor: active ? colors.accentBg : "transparent",
                        borderTopWidth: 1,
                        borderTopColor: colors.border,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text
                        style={{
                          color: active ? colors.accent : colors.text,
                          fontSize: 17,
                          fontWeight: active ? "700" : "400",
                        }}
                      >
                        {opt}
                      </Text>
                      {active && (
                        <Text style={{ color: colors.accent, fontSize: 16 }}>✓</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
                <View style={{ height: Platform.OS === "ios" ? 34 : 16 }} />
              </ScrollView>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const ROUTINE_TYPES: { value: "daily" | "weekly" | "monthly"; label: string; desc: string }[] = [
  { value: "daily", label: "Diaria", desc: "Una sola sesión, se archiva al completar" },
  { value: "weekly", label: "Semanal", desc: "Días secuenciales, se reinicia por semana" },
  { value: "monthly", label: "Mensual", desc: "Ciclo semanal, vuelve al día 1 cada semana" },
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
  updateExerciseSeries,
  updateExerciseRep,
  updateExercisePeso,
  removeExercise,
  openExPickerForDay,
  pickExercise,
  addCircuit,
  updateCircuit,
  removeCircuit,
  updateCircuitExRep,
  updateCircuitExPeso,
  removeCircuitEx,
  moveCircuitEx,
  openCircuitExPicker,
  pickCircuitExercise,
  pickCircuitExercises,
  pickExercises,
  saveRoutine,
}: Props) {

  const { colors } = useTheme();

  const canSave =
    !!newRoutineName.trim() &&
    newDays.length > 0 &&
    newDays.some(
      (d) =>
        d.ejercicios.length > 0 ||
        (d.circuitos ?? []).some((c) => c.ejercicios.length > 0),
    );

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

              {/* Routine type selector */}
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
                    {newRoutineType !== "daily" && (
                      <TouchableOpacity onPress={() => removeDay(dayIdx)}>
                        <Text style={{ color: colors.error, fontSize: 18, paddingLeft: 12 }}>
                          ×
                        </Text>
                      </TouchableOpacity>
                    )}
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

                          {/* Series count + descanso */}
                          <View style={{ flexDirection: "row", gap: 6, marginBottom: 10 }}>
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
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  gap: 6,
                                }}
                              >
                                <TouchableOpacity
                                  onPress={() =>
                                    updateExerciseSeries(dayIdx, exIdx, Math.max(1, ej.series - 1))
                                  }
                                  style={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: 8,
                                    backgroundColor: colors.surface,
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Text style={{ color: colors.text, fontSize: 18, lineHeight: 20 }}>
                                    −
                                  </Text>
                                </TouchableOpacity>
                                <Text
                                  style={{
                                    color: colors.text,
                                    fontSize: 16,
                                    fontWeight: "700",
                                    minWidth: 20,
                                    textAlign: "center",
                                  }}
                                >
                                  {ej.series}
                                </Text>
                                <TouchableOpacity
                                  onPress={() =>
                                    updateExerciseSeries(dayIdx, exIdx, ej.series + 1)
                                  }
                                  style={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: 8,
                                    backgroundColor: colors.surface,
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Text style={{ color: colors.text, fontSize: 18, lineHeight: 20 }}>
                                    +
                                  </Text>
                                </TouchableOpacity>
                              </View>
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
                              <RestPicker
                                value={ej.descanso}
                                onChange={(v) => updateExercise(dayIdx, exIdx, "descanso", v)}
                                colors={colors}
                              />
                            </View>
                          </View>

                          {/* Per-series reps + peso */}
                          <View>
                            <View
                              style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                marginBottom: 6,
                              }}
                            >
                              <Text style={{ color: colors.textDisabled, fontSize: 10 }}>
                                Reps / Peso por serie
                              </Text>
                              <Text style={{ color: colors.textDisabled, fontSize: 9 }}>
                                kg o % de 1RM
                              </Text>
                            </View>
                            <ScrollView
                              horizontal
                              showsHorizontalScrollIndicator={false}
                            >
                              {ej.reps.map((rep, si) => (
                                <View
                                  key={si}
                                  style={{ alignItems: "center", marginRight: 8 }}
                                >
                                  <Text
                                    style={{
                                      color: colors.textDisabled,
                                      fontSize: 9,
                                      marginBottom: 4,
                                    }}
                                  >
                                    S{si + 1}
                                  </Text>
                                  <TextInput
                                    value={rep}
                                    onChangeText={(v) =>
                                      updateExerciseRep(dayIdx, exIdx, si, v)
                                    }
                                    keyboardType="numeric"
                                    placeholder="reps"
                                    placeholderTextColor={colors.textDisabled}
                                    style={{
                                      backgroundColor: colors.surface,
                                      borderRadius: 8,
                                      padding: 8,
                                      color: colors.text,
                                      textAlign: "center",
                                      fontSize: 13,
                                      width: 52,
                                      marginBottom: 4,
                                    }}
                                  />
                                  <TextInput
                                    value={(ej.peso ?? [])[si] ?? ""}
                                    onChangeText={(v) =>
                                      updateExercisePeso(dayIdx, exIdx, si, v)
                                    }
                                    placeholder="kg"
                                    placeholderTextColor={colors.textDisabled}
                                    style={{
                                      backgroundColor: colors.surface,
                                      borderRadius: 8,
                                      padding: 8,
                                      color: colors.text,
                                      textAlign: "center",
                                      fontSize: 13,
                                      width: 52,
                                    }}
                                  />
                                </View>
                              ))}
                            </ScrollView>
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
                              <RestPicker
                                value={circ.descanso}
                                onChange={(v) => updateCircuit(dayIdx, circIdx, "descanso", v)}
                                colors={colors}
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
                              }}
                            >
                              {/* Header row: reorder + name + remove */}
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  gap: 6,
                                  marginBottom: 10,
                                }}
                              >
                                <View style={{ alignItems: "center", gap: 2 }}>
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
                                  <Text style={{ color: "#C4B5FD", fontSize: 10, fontWeight: "700" }}>
                                    {exIdx + 1}
                                  </Text>
                                </View>
                                <Text
                                  style={{ color: colors.text, fontSize: 13, fontWeight: "600", flex: 1 }}
                                  numberOfLines={1}
                                >
                                  {cEx.nombre}
                                </Text>
                                <TouchableOpacity onPress={() => removeCircuitEx(dayIdx, circIdx, exIdx)}>
                                  <Text style={{ color: colors.error, fontSize: 16, paddingLeft: 8 }}>
                                    ×
                                  </Text>
                                </TouchableOpacity>
                              </View>

                              {/* Per-round reps + peso cells */}
                              <View>
                                <View
                                  style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    marginBottom: 6,
                                  }}
                                >
                                  <Text style={{ color: colors.textDisabled, fontSize: 10 }}>
                                    Reps / Peso por ronda
                                  </Text>
                                  <Text style={{ color: colors.textDisabled, fontSize: 9 }}>
                                    kg o % de 1RM
                                  </Text>
                                </View>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                  {cEx.reps.map((rep, ri) => (
                                    <View key={ri} style={{ alignItems: "center", marginRight: 8 }}>
                                      <Text
                                        style={{
                                          color: colors.textDisabled,
                                          fontSize: 9,
                                          marginBottom: 4,
                                        }}
                                      >
                                        R{ri + 1}
                                      </Text>
                                      <TextInput
                                        value={rep}
                                        onChangeText={(v) =>
                                          updateCircuitExRep(dayIdx, circIdx, exIdx, ri, v)
                                        }
                                        keyboardType="numeric"
                                        placeholder="reps"
                                        placeholderTextColor={colors.textDisabled}
                                        style={{
                                          backgroundColor: colors.surface,
                                          borderRadius: 8,
                                          padding: 8,
                                          color: colors.text,
                                          textAlign: "center",
                                          fontSize: 13,
                                          width: 52,
                                          marginBottom: 4,
                                        }}
                                      />
                                      <TextInput
                                        value={(cEx.peso ?? [])[ri] ?? ""}
                                        onChangeText={(v) =>
                                          updateCircuitExPeso(dayIdx, circIdx, exIdx, ri, v)
                                        }
                                        placeholder="kg"
                                        placeholderTextColor={colors.textDisabled}
                                        style={{
                                          backgroundColor: colors.surface,
                                          borderRadius: 8,
                                          padding: 8,
                                          color: colors.text,
                                          textAlign: "center",
                                          fontSize: 13,
                                          width: 52,
                                        }}
                                      />
                                    </View>
                                  ))}
                                </ScrollView>
                              </View>
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

              {/* Add day button — hidden for daily routines */}
              {newRoutineType !== "daily" && (
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
        onSelectMultiple={pickCircuitExercises}
        multiSelect
        library={library}
        loading={loadingLibrary}
        title="Elegir ejercicios para circuito"
      />
    </>
  );
}
