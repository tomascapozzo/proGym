import OptionPicker from "@/components/train/OptionPicker";
import RepsPicker from "@/components/train/RepsPicker";
import RestPicker from "@/components/train/RestPicker";
import { useTheme } from "@/context/theme-context";
import type { RoutineCircuit } from "@/types/routine";
import React from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

const SERIES_OPTIONS = Array.from({ length: 20 }, (_, i) => String(i + 1));

interface CircuitCardProps {
  circ: RoutineCircuit;
  isFirst: boolean;
  colorIdx?: number;
  onUpdate(field: keyof RoutineCircuit, value: string | number): void;
  onRemove(): void;
  onOpenExPicker(): void;
  onMoveEx(exIdx: number, dir: "up" | "down"): void;
  onRemoveEx(exIdx: number): void;
  onUpdateExRep(exIdx: number, ri: number, v: string): void;
  onUpdateExPeso(exIdx: number, ri: number, v: string): void;
}

export default function CircuitCard({
  circ,
  isFirst,
  colorIdx = 0,
  onUpdate,
  onRemove,
  onOpenExPicker,
  onMoveEx,
  onRemoveEx,
  onUpdateExRep,
  onUpdateExPeso,
}: CircuitCardProps) {
  const { colors } = useTheme();
  const palette = colors.circuitPalette;
  const { bg: C_BG, text: C_ACCENT } = palette[colorIdx % palette.length];
  const C_BORDER = C_ACCENT;

  return (
    <View
      style={{
        backgroundColor: colors.setRowBg,
        borderRadius: 10,
        padding: 12,
        marginTop: isFirst ? 14 : 0,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: C_BORDER,
      }}
    >
      {/* Header */}
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
            backgroundColor: C_BG,
            borderRadius: 6,
            paddingHorizontal: 8,
            paddingVertical: 3,
          }}
        >
          <Text
            style={{
              color: C_ACCENT,
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
          onChangeText={(v) => onUpdate("nombre", v)}
          placeholder="Nombre del circuito"
          placeholderTextColor={colors.textDisabled}
          style={{
            flex: 1,
            backgroundColor: colors.surface,
            borderRadius: 8,
            padding: 8,
            color: C_ACCENT,
            fontWeight: "600",
            fontSize: 13,
          }}
        />
        <TouchableOpacity onPress={onRemove}>
          <Text style={{ color: colors.error, fontSize: 16, paddingLeft: 4 }}>
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
            Series
          </Text>
          <OptionPicker
            value={String(circ.rondas)}
            onChange={(v) => onUpdate("rondas", parseInt(v))}
            options={SERIES_OPTIONS}
            title="Series"
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
            onChange={(v) => onUpdate("descanso", v)}
          />
        </View>
      </View>

      {/* Circuit exercises */}
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
                onPress={() => onMoveEx(exIdx, "up")}
                disabled={exIdx === 0}
                style={{ opacity: exIdx === 0 ? 0.2 : 1, padding: 2 }}
              >
                <Text style={{ color: C_ACCENT, fontSize: 10 }}>▲</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onMoveEx(exIdx, "down")}
                disabled={exIdx === circ.ejercicios.length - 1}
                style={{
                  opacity: exIdx === circ.ejercicios.length - 1 ? 0.2 : 1,
                  padding: 2,
                }}
              >
                <Text style={{ color: C_ACCENT, fontSize: 10 }}>▼</Text>
              </TouchableOpacity>
            </View>
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: C_BG,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{ color: C_ACCENT, fontSize: 10, fontWeight: "700" }}
              >
                {exIdx + 1}
              </Text>
            </View>
            <Text
              style={{
                color: colors.text,
                fontSize: 13,
                fontWeight: "600",
                flex: 1,
              }}
              numberOfLines={1}
            >
              {cEx.nombre}
            </Text>
            <TouchableOpacity onPress={() => onRemoveEx(exIdx)}>
              <Text
                style={{ color: colors.error, fontSize: 16, paddingLeft: 8 }}
              >
                ×
              </Text>
            </TouchableOpacity>
          </View>

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
            <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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
                  <View style={{ marginBottom: 4 }}>
                    <RepsPicker
                      value={rep}
                      onChange={(v) => onUpdateExRep(exIdx, ri, v)}
                      triggerWidth={52}
                    />
                  </View>
                  <TextInput
                    value={(cEx.peso ?? [])[ri] ?? ""}
                    onChangeText={(v) => onUpdateExPeso(exIdx, ri, v)}
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

      <TouchableOpacity
        onPress={onOpenExPicker}
        style={{
          borderWidth: 1,
          borderColor: C_BORDER,
          borderStyle: "solid",
          borderRadius: 8,
          padding: 10,
          alignItems: "center",
          marginTop: 4,
        }}
      >
        <Text style={{ color: C_ACCENT, fontSize: 12 }}>
          + Agregar ejercicio
        </Text>
      </TouchableOpacity>
    </View>
  );
}
