import CustomModal from "@/components/ui/custom/customModal";
import { useTheme } from "@/context/theme-context";
import type { RoutineCircuit, RoutineDay } from "@/types/routine";
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
  visible: boolean;
  previewDay: RoutineDay | null;
  onClose: () => void;
  onStartSession: () => void;
  confirmVisible: boolean;
  onConfirmStart: () => void;
  onCancelConfirm: () => void;
};

export default function DayPreviewModal({
  visible,
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
        message={`${previewDay?.dia} · ${[
          (previewDay?.ejercicios.length ?? 0) > 0 ? `${previewDay?.ejercicios.length} ejercicios` : null,
          (previewDay?.circuitos ?? []).length > 0 ? `${(previewDay?.circuitos ?? []).length} circuito${(previewDay?.circuitos ?? []).length !== 1 ? "s" : ""}` : null,
        ].filter(Boolean).join(" · ")}`}
        confirmLabel="Comenzar"
        onConfirm={onConfirmStart}
        onCancel={onCancelConfirm}
      />

      <Modal
        visible={visible}
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
                {[
                  previewDay.ejercicios.length > 0 ? `${previewDay.ejercicios.length} EJERCICIOS` : null,
                  (previewDay.circuitos ?? []).length > 0 ? `${(previewDay.circuitos ?? []).length} CIRCUITO${(previewDay.circuitos ?? []).length !== 1 ? "S" : ""}` : null,
                ].filter(Boolean).join(" · ")}
              </Text>

              {/* Standalone exercises */}
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
                    <Text style={{ color: colors.accent, fontSize: 12, fontWeight: "700" }}>
                      {i + 1}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14 }}>
                      {ej.nombre}
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 3 }}>
                      {ej.series} series · {Array.isArray(ej.reps) ? ej.reps.join("/") : ej.reps} reps · {ej.descanso} descanso
                    </Text>
                  </View>
                </View>
              ))}

              {/* Circuits */}
              {(previewDay.circuitos ?? []).map((circ: RoutineCircuit, ci) => (
                <View
                  key={`circ-${ci}`}
                  style={{
                    borderRadius: 12,
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: "#7C3AED44",
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      backgroundColor: "#2E106522",
                    }}
                  >
                    <Text style={{ color: "#C4B5FD", fontSize: 10, fontWeight: "800", letterSpacing: 1 }}>
                      CIRCUITO
                    </Text>
                    {circ.nombre ? (
                      <Text style={{ color: "#C4B5FD", fontSize: 13, fontWeight: "600", flex: 1 }}>
                        {circ.nombre}
                      </Text>
                    ) : <View style={{ flex: 1 }} />}
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
                        paddingVertical: 12,
                        paddingHorizontal: 14,
                        backgroundColor: colors.card,
                        borderTopWidth: 1,
                        borderTopColor: colors.border,
                      }}
                    >
                      <View
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 11,
                          backgroundColor: "#2E1065",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                        }}
                      >
                        <Text style={{ color: "#C4B5FD", fontSize: 10, fontWeight: "700" }}>
                          {ei + 1}
                        </Text>
                      </View>
                      <Text style={{ color: colors.text, fontSize: 14, flex: 1 }}>{cEx.nombre}</Text>
                      <Text style={{ color: colors.textMuted, fontSize: 12 }}>{Array.isArray(cEx.reps) ? cEx.reps.join("/") : cEx.reps} reps</Text>
                    </View>
                  ))}
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
