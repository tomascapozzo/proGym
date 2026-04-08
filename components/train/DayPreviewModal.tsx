import CustomModal from "@/components/ui/custom/customModal";
import { useTheme } from "@/context/theme-context";
import type { RoutineDay } from "@/types/routine";
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
  previewDay: RoutineDay | null;
  onClose: () => void;
  onStartSession: () => void;
  confirmVisible: boolean;
  onConfirmStart: () => void;
  onCancelConfirm: () => void;
};

export default function DayPreviewModal({
  previewDay,
  onClose,
  onStartSession,
  confirmVisible,
  onConfirmStart,
  onCancelConfirm,
}: Props) {
  const { colors } = useTheme();

  return (
    <>
      <CustomModal
        visible={confirmVisible}
        title="¿Comenzar entrenamiento?"
        message={`${previewDay?.dia} · ${previewDay?.ejercicios.length} ejercicios`}
        confirmLabel="Comenzar"
        onConfirm={onConfirmStart}
        onCancel={onCancelConfirm}
      />

      <Modal
        visible={!!previewDay}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {previewDay && (
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
              <View>
                <Text
                  style={{ color: colors.text, fontSize: 20, fontWeight: "700" }}
                >
                  {previewDay.dia}
                </Text>
                <Text style={{ color: colors.accent, fontSize: 12, marginTop: 2 }}>
                  {previewDay.enfoque}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose}>
                <Text style={{ color: colors.textMuted, fontSize: 16 }}>Cerrar</Text>
              </TouchableOpacity>
            </View>

            {/* Exercise list */}
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 11,
                  letterSpacing: 1,
                  marginBottom: 12,
                }}
              >
                EJERCICIOS ({previewDay.ejercicios.length})
              </Text>
              {previewDay.ejercicios.map((ej, i) => (
                <View
                  key={i}
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: colors.border,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 15,
                      backgroundColor: colors.accentBgAlt,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 14,
                    }}
                  >
                    <Text
                      style={{ color: colors.accent, fontSize: 12, fontWeight: "700" }}
                    >
                      {i + 1}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{ color: colors.text, fontWeight: "600", fontSize: 14 }}
                    >
                      {ej.nombre}
                    </Text>
                    <Text
                      style={{ color: colors.textMuted, fontSize: 12, marginTop: 3 }}
                    >
                      {ej.series} series · {ej.reps} reps · {ej.descanso} descanso
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Start button */}
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
                onPress={onStartSession}
                style={{
                  backgroundColor: colors.accent,
                  borderRadius: 14,
                  padding: 16,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: colors.accentText, fontWeight: "700", fontSize: 16 }}
                >
                  Comenzar entrenamiento
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>
    </>
  );
}
