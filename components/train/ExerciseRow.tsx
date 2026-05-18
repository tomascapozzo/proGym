import RepsPicker from "@/components/train/RepsPicker";
import RestPicker from "@/components/train/RestPicker";
import { useTheme } from "@/context/theme-context";
import type { RoutineDayExercise } from "@/types/routine";
import React from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

interface ExerciseRowProps {
  ej: RoutineDayExercise;
  onRemove(): void;
  onUpdateDescanso(v: string): void;
  onUpdateSeries(v: number): void;
  onUpdateRep(si: number, v: string): void;
  onUpdatePeso(si: number, v: string): void;
}

export default function ExerciseRow({
  ej,
  onRemove,
  onUpdateDescanso,
  onUpdateSeries,
  onUpdateRep,
  onUpdatePeso,
}: ExerciseRowProps) {
  const { colors } = useTheme();

  return (
    <View
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
          style={{ color: colors.text, fontWeight: "600", fontSize: 13, flex: 1 }}
          numberOfLines={1}
        >
          {ej.nombre}
        </Text>
        <TouchableOpacity onPress={onRemove}>
          <Text style={{ color: colors.error, fontSize: 16, paddingLeft: 8 }}>×</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: "row", gap: 6, marginBottom: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.textDisabled, fontSize: 10, marginBottom: 4 }}>
            Series
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <TouchableOpacity
              onPress={() => onUpdateSeries(Math.max(1, ej.series - 1))}
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                backgroundColor: colors.surface,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: colors.text, fontSize: 18, lineHeight: 20 }}>−</Text>
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
              onPress={() => onUpdateSeries(ej.series + 1)}
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                backgroundColor: colors.surface,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: colors.text, fontSize: 18, lineHeight: 20 }}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ flex: 2 }}>
          <Text style={{ color: colors.textDisabled, fontSize: 10, marginBottom: 4 }}>
            Descanso
          </Text>
          <RestPicker value={ej.descanso} onChange={onUpdateDescanso} />
        </View>
      </View>

      <View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
          <Text style={{ color: colors.textDisabled, fontSize: 10 }}>Reps / Peso por serie</Text>
          <Text style={{ color: colors.textDisabled, fontSize: 9 }}>kg o % de 1RM</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {ej.reps.map((rep, si) => (
            <View key={si} style={{ alignItems: "center", marginRight: 8 }}>
              <Text style={{ color: colors.textDisabled, fontSize: 9, marginBottom: 4 }}>
                S{si + 1}
              </Text>
              <View style={{ marginBottom: 4 }}>
                <RepsPicker
                  value={rep}
                  onChange={(v) => onUpdateRep(si, v)}
                  triggerWidth={52}
                />
              </View>
              <TextInput
                value={(ej.peso ?? [])[si] ?? ""}
                onChangeText={(v) => onUpdatePeso(si, v)}
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
  );
}
