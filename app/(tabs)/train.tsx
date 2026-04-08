import DayPreviewModal from "@/components/train/DayPreviewModal";
import RoutineCreatorModal from "@/components/train/RoutineCreatorModal";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { useRoutineCreator } from "@/hooks/useRoutineCreator";
import { supabase } from "@/lib/supabase";
import type { Routine, RoutineDay } from "@/types/routine";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function TrainScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();

  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loadingRoutine, setLoadingRoutine] = useState(true);

  // Day preview state
  const [previewDay, setPreviewDay] = useState<RoutineDay | null>(null);
  const [previewDayIndex, setPreviewDayIndex] = useState(0);
  const [confirmVisible, setConfirmVisible] = useState(false);

  // Refresh routine when tab is focused (e.g. after creating one)
  useFocusEffect(
    useCallback(() => {
      if (user) fetchRoutine();
    }, [user]),
  );

  const fetchRoutine = async () => {
    setLoadingRoutine(true);
    const { data } = await supabase
      .from("routines")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    setRoutine(data ?? null);
    setLoadingRoutine(false);
  };

  const routineCreator = useRoutineCreator(fetchRoutine);

  // ─── Day preview ──────────────────────────────────────────────────────────

  const openDayPreview = (day: RoutineDay, dayIndex: number) => {
    setPreviewDay(day);
    setPreviewDayIndex(dayIndex);
  };

  const doStartSession = () => {
    if (!previewDay) return;
    const day = previewDay;
    const idx = previewDayIndex;
    setConfirmVisible(false);
    setPreviewDay(null);
    router.push({
      pathname: "/session",
      params: {
        type: "routine",
        dayData: JSON.stringify(day),
        dayIndex: String(idx),
      },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* HEADER */}
        <Text
          style={{
            color: colors.text,
            fontSize: 26,
            fontWeight: "bold",
            marginTop: 16,
            marginBottom: 4,
          }}
        >
          Entrenar
        </Text>
        <Text style={{ color: colors.textMuted, marginBottom: 28 }}>
          ¿Cómo vas a entrenar hoy?
        </Text>

        {/* ── FOLLOW ROUTINE ── */}
        <Text
          style={{
            color: colors.textMuted,
            fontSize: 12,
            letterSpacing: 1,
            marginBottom: 10,
          }}
        >
          SEGUIR RUTINA
        </Text>

        {loadingRoutine ? (
          <ActivityIndicator
            color={colors.accent}
            style={{ marginBottom: 24, alignSelf: "flex-start" }}
          />
        ) : !routine ? (
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 20,
              marginBottom: 28,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: "center",
            }}
          >
            <Text
              style={{ color: colors.textMuted, textAlign: "center", lineHeight: 22 }}
            >
              No tenés una rutina todavía.{"\n"}Creá una abajo para empezar.
            </Text>
          </View>
        ) : (
          <View style={{ marginBottom: 28 }}>
            <Text style={{ color: colors.accent, fontSize: 12, marginBottom: 10 }}>
              {routine.data.nombre}
            </Text>
            {routine.data.dias.map((day, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => openDayPreview(day, idx)}
                activeOpacity={0.75}
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <View>
                  <Text style={{ color: colors.text, fontWeight: "600", fontSize: 15 }}>
                    {day.dia}
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
                    {day.enfoque} · {day.ejercicios.length} ejercicios
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: colors.accentBgAlt,
                    borderRadius: 20,
                    width: 36,
                    height: 36,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: colors.accent, fontSize: 14 }}>▶</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── CREATE ROUTINE ── */}
        <Text
          style={{
            color: colors.textMuted,
            fontSize: 12,
            letterSpacing: 1,
            marginBottom: 10,
          }}
        >
          CREAR RUTINA
        </Text>
        <TouchableOpacity
          onPress={routineCreator.openCreateRoutine}
          style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: colors.border,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.accentBgAlt,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: colors.accent, fontSize: 20, fontWeight: "700" }}>
              +
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontWeight: "600", fontSize: 15 }}>
              Armar rutina
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
              Armá tu propia rutina con días y ejercicios
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* ── MODALS ── */}
      <DayPreviewModal
        previewDay={previewDay}
        onClose={() => setPreviewDay(null)}
        onStartSession={() => setConfirmVisible(true)}
        confirmVisible={confirmVisible}
        onConfirmStart={doStartSession}
        onCancelConfirm={() => setConfirmVisible(false)}
      />

      <RoutineCreatorModal {...routineCreator} />
    </View>
  );
}
