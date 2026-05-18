import CircuitCard from "@/components/train/CircuitCard";
import ExerciseRow from "@/components/train/ExerciseRow";
import { useTheme } from "@/context/theme-context";
import type { RoutineCircuit, RoutineDay } from "@/types/routine";
import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

interface DayCardProps {
  day: RoutineDay;
  dayIdx: number;
  isEditing: boolean;
  onToggleEdit(): void;
  canRemove: boolean;
  onRemove(): void;
  onUpdateField(field: "dia" | "enfoque", v: string): void;
  onRemoveExercise(exIdx: number): void;
  onUpdateDescanso(exIdx: number, v: string): void;
  onUpdateSeries(exIdx: number, v: number): void;
  onUpdateRep(exIdx: number, si: number, v: string): void;
  onUpdatePeso(exIdx: number, si: number, v: string): void;
  onOpenExPicker(): void;
  onAddCircuit(): void;
  onUpdateCircuit(circIdx: number, field: keyof RoutineCircuit, v: string | number): void;
  onRemoveCircuit(circIdx: number): void;
  onOpenCircuitExPicker(circIdx: number): void;
  onMoveCircuitEx(circIdx: number, exIdx: number, dir: "up" | "down"): void;
  onRemoveCircuitEx(circIdx: number, exIdx: number): void;
  onUpdateCircuitExRep(circIdx: number, exIdx: number, ri: number, v: string): void;
  onUpdateCircuitExPeso(circIdx: number, exIdx: number, ri: number, v: string): void;
}

export default function DayCard({
  day,
  dayIdx,
  isEditing,
  onToggleEdit,
  canRemove,
  onRemove,
  onUpdateField,
  onRemoveExercise,
  onUpdateDescanso,
  onUpdateSeries,
  onUpdateRep,
  onUpdatePeso,
  onOpenExPicker,
  onAddCircuit,
  onUpdateCircuit,
  onRemoveCircuit,
  onOpenCircuitExPicker,
  onMoveCircuitEx,
  onRemoveCircuitEx,
  onUpdateCircuitExRep,
  onUpdateCircuitExPeso,
}: DayCardProps) {
  const { colors } = useTheme();
  const circuits = day.circuitos ?? [];

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: isEditing ? colors.accent : colors.border,
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
        <TouchableOpacity onPress={onToggleEdit} style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontWeight: "700", fontSize: 15 }}>
            {day.dia || `Día ${dayIdx + 1}`}
            {day.enfoque ? (
              <Text style={{ color: colors.accent, fontWeight: "400" }}> · {day.enfoque}</Text>
            ) : null}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>
            {day.ejercicios.length} ejercicio{day.ejercicios.length !== 1 ? "s" : ""}
            {circuits.length > 0 &&
              ` · ${circuits.length} circuito${circuits.length !== 1 ? "s" : ""}`}
          </Text>
        </TouchableOpacity>
        {canRemove && (
          <TouchableOpacity onPress={onRemove}>
            <Text style={{ color: colors.error, fontSize: 18, paddingLeft: 12 }}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Expanded content */}
      {isEditing && (
        <View>
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
            <TextInput
              value={day.dia}
              onChangeText={(v) => onUpdateField("dia", v)}
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
              onChangeText={(v) => onUpdateField("enfoque", v)}
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

          {day.ejercicios.map((ej, exIdx) => (
            <ExerciseRow
              key={exIdx}
              ej={ej}
              onRemove={() => onRemoveExercise(exIdx)}
              onUpdateDescanso={(v) => onUpdateDescanso(exIdx, v)}
              onUpdateSeries={(v) => onUpdateSeries(exIdx, v)}
              onUpdateRep={(si, v) => onUpdateRep(exIdx, si, v)}
              onUpdatePeso={(si, v) => onUpdatePeso(exIdx, si, v)}
            />
          ))}

          <TouchableOpacity
            onPress={onOpenExPicker}
            style={{
              padding: 10,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: "center",
              marginTop: 4,
            }}
          >
            <Text style={{ color: colors.accent, fontSize: 13 }}>+ Agregar ejercicio</Text>
          </TouchableOpacity>

          {circuits.map((circ, circIdx) => (
            <CircuitCard
              key={`circ-${circIdx}`}
              circ={circ}
              isFirst={circIdx === 0}
              onUpdate={(f, v) => onUpdateCircuit(circIdx, f, v)}
              onRemove={() => onRemoveCircuit(circIdx)}
              onOpenExPicker={() => onOpenCircuitExPicker(circIdx)}
              onMoveEx={(exIdx, dir) => onMoveCircuitEx(circIdx, exIdx, dir)}
              onRemoveEx={(exIdx) => onRemoveCircuitEx(circIdx, exIdx)}
              onUpdateExRep={(exIdx, ri, v) => onUpdateCircuitExRep(circIdx, exIdx, ri, v)}
              onUpdateExPeso={(exIdx, ri, v) => onUpdateCircuitExPeso(circIdx, exIdx, ri, v)}
            />
          ))}

          <TouchableOpacity
            onPress={onAddCircuit}
            style={{
              padding: 10,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#7C3AED",
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <Text style={{ color: "#C4B5FD", fontSize: 13 }}>+ Crear circuito</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
