import React, { useState } from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";

type Props = {
  visible: boolean;
  colors: any;
  onSubmit: (value: number) => void;
  onDismiss: () => void;
};

const RPE_LABELS: Record<number, string> = {
  1: "Muy fácil",
  2: "Fácil",
  3: "Moderado",
  4: "Algo difícil",
  5: "Difícil",
  6: "Muy difícil",
  7: "Duro",
  8: "Muy duro",
  9: "Casi máximo",
  10: "Máximo",
};

export default function RpePromptModal({ visible, colors, onSubmit, onDismiss }: Props) {
  const [selected, setSelected] = useState<number | null>(null);

  const handleSubmit = () => {
    if (selected !== null) {
      onSubmit(selected);
      setSelected(null);
    }
  };

  const handleDismiss = () => {
    setSelected(null);
    onDismiss();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" presentationStyle="overFullScreen">
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" }}
        onPress={handleDismiss}
      >
        <Pressable>
          <View
            style={{
              backgroundColor: colors.card,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: 36,
              borderTopWidth: 1,
              borderColor: colors.border,
            }}
          >
            {/* Handle */}
            <View
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.border,
                alignSelf: "center",
                marginBottom: 20,
              }}
            />

            <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700", marginBottom: 4 }}>
              Esfuerzo percibido
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 20 }}>
              {selected !== null ? RPE_LABELS[selected] : "¿Cómo fue el esfuerzo? (1–10)"}
            </Text>

            {/* Number grid: two rows of 5 */}
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <TouchableOpacity
                  key={n}
                  onPress={() => setSelected(n)}
                  style={{
                    flex: 1,
                    aspectRatio: 1,
                    borderRadius: 12,
                    backgroundColor: selected === n ? colors.accent : colors.surface,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: selected === n ? colors.accent : colors.border,
                  }}
                >
                  <Text
                    style={{
                      color: selected === n ? colors.accentText : colors.text,
                      fontSize: 18,
                      fontWeight: "700",
                    }}
                  >
                    {n}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 24 }}>
              {[6, 7, 8, 9, 10].map((n) => (
                <TouchableOpacity
                  key={n}
                  onPress={() => setSelected(n)}
                  style={{
                    flex: 1,
                    aspectRatio: 1,
                    borderRadius: 12,
                    backgroundColor: selected === n ? colors.accent : colors.surface,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: selected === n ? colors.accent : colors.border,
                  }}
                >
                  <Text
                    style={{
                      color: selected === n ? colors.accentText : colors.text,
                      fontSize: 18,
                      fontWeight: "700",
                    }}
                  >
                    {n}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={selected === null}
              style={{
                backgroundColor: selected !== null ? colors.accent : colors.surface,
                borderRadius: 14,
                padding: 16,
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Text
                style={{
                  color: selected !== null ? colors.accentText : colors.textMuted,
                  fontWeight: "700",
                  fontSize: 16,
                }}
              >
                Confirmar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDismiss}
              style={{ padding: 12, alignItems: "center" }}
            >
              <Text style={{ color: colors.textMuted, fontSize: 14 }}>Omitir</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
