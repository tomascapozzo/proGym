import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const pickerData: Record<
  string,
  { title: string; options: string[]; multi?: boolean }
> = {
  edad: {
    title: "Edad",
    options: [
      "16 – 20 años",
      "21 – 25 años",
      "26 – 30 años",
      "31 – 35 años",
      "36 – 40 años",
      "41 – 45 años",
      "46+ años",
    ],
  },
  profesion: {
    title: "Tipo de trabajo",
    options: ["Oficina", "Trabajo de pie", "Trabajo físico", "Mixto"],
  },
  disponibilidad: {
    title: "Días disponibles",
    options: [
      "1 día",
      "2 días",
      "3 días",
      "4 días",
      "5 días",
      "6 días",
      "7 días",
    ],
  },
  equipamiento: {
    title: "Equipamiento",
    options: ["Gimnasio completo", "Mancuernas", "Peso corporal", "Casa"],
  },
  nivel: {
    title: "Nivel",
    options: ["Sin experiencia", "1 año", "1–3 años", "3+ años"],
  },
  actualidad: {
    title: "Actualidad",
    options: ["Fuerza", "Running", "Ambos", "Nada"],
  },
  objetivo: {
    title: "Objetivos",
    multi: true,
    options: ["Perder grasa", "Ganar fuerza", "Rendimiento", "Salud"],
  },
};

export default function OnboardingScreen() {
  const { user, refreshProfile } = useAuth();
  const [values, setValues] = useState<Record<string, string>>({});
  const [multiValues, setMultiValues] = useState<Record<string, string[]>>({});
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [lesiones, setLesiones] = useState("");
  const [currentPicker, setCurrentPicker] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const openPicker = (key: string) => setCurrentPicker(key);
  const closePicker = () => setCurrentPicker(null);

  const handleSelect = (key: string, option: string) => {
    const data = pickerData[key];
    if (data.multi) {
      const current = multiValues[key] || [];
      const updated = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      setMultiValues({ ...multiValues, [key]: updated });
    } else {
      setValues({ ...values, [key]: option });
      closePicker();
    }
  };

  const renderValue = (key: string) => {
    const data = pickerData[key];
    if (data.multi) {
      const val = multiValues[key] || [];
      if (val.length === 0) return "Seleccionar";
      if (val.length === 1) return val[0];
      return `${val.length} seleccionados`;
    }
    return values[key] || "Seleccionar";
  };

  const handleContinue = async () => {
    if (!user) return;
    setError("");
    setLoading(true);

    const { error: err } = await supabase.from("profiles").upsert({
      id: user.id,
      edad: values.edad ?? null,
      profesion: values.profesion ?? null,
      disponibilidad: values.disponibilidad ?? null,
      equipamiento: values.equipamiento ?? null,
      nivel: values.nivel ?? null,
      actualidad: values.actualidad ?? null,
      objetivo: multiValues.objetivo ?? [],
      peso: peso.trim() || null,
      altura: altura.trim() || null,
      lesiones: lesiones.trim() || null,
      onboarding_completed: true,
    });

    setLoading(false);

    if (err) {
      setError("Error guardando los datos. Intentá de nuevo.");
      return;
    }

    await refreshProfile();
    router.replace("/(tabs)");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0F1A" }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* HEADER */}
        <Text style={{ color: "#3B82F6", fontSize: 12, marginTop: 16 }}>
          Configuración inicial
        </Text>
        <Text
          style={{
            color: "white",
            fontSize: 26,
            fontWeight: "bold",
            marginTop: 6,
          }}
        >
          Contanos sobre vos
        </Text>
        <Text style={{ color: "#888", marginBottom: 24 }}>
          Esto ayuda a personalizar tu plan
        </Text>

        {/* PICKER FIELDS */}
        {Object.keys(pickerData).map((key) => (
          <TouchableOpacity
            key={key}
            onPress={() => openPicker(key)}
            style={{
              backgroundColor: "#111827",
              padding: 16,
              borderRadius: 12,
              marginBottom: 10,
            }}
          >
            <Text style={{ color: "white", fontSize: 15 }}>
              {pickerData[key].title}
            </Text>
            <Text style={{ color: "#3B82F6", fontSize: 12, marginTop: 2 }}>
              {renderValue(key)}
            </Text>
          </TouchableOpacity>
        ))}

        {/* NUMERIC INPUTS */}
        <TextInput
          placeholder="Peso (kg)"
          placeholderTextColor="#555"
          keyboardType="numeric"
          value={peso}
          onChangeText={setPeso}
          style={{
            backgroundColor: "#111827",
            padding: 16,
            borderRadius: 12,
            color: "white",
            marginBottom: 10,
          }}
        />

        <TextInput
          placeholder="Altura (cm)"
          placeholderTextColor="#555"
          keyboardType="numeric"
          value={altura}
          onChangeText={setAltura}
          style={{
            backgroundColor: "#111827",
            padding: 16,
            borderRadius: 12,
            color: "white",
            marginBottom: 10,
          }}
        />

        <TextInput
          placeholder="Lesiones (opcional)"
          placeholderTextColor="#555"
          value={lesiones}
          onChangeText={setLesiones}
          multiline
          style={{
            backgroundColor: "#111827",
            padding: 16,
            borderRadius: 12,
            color: "white",
            marginBottom: 20,
          }}
        />

        {error ? (
          <Text
            style={{ color: "#EF4444", textAlign: "center", marginBottom: 12 }}
          >
            {error}
          </Text>
        ) : null}

        {/* CTA */}
        <TouchableOpacity
          onPress={handleContinue}
          disabled={loading}
          style={{
            backgroundColor: "#2563EB",
            padding: 18,
            borderRadius: 14,
            alignItems: "center",
            opacity: loading ? 0.7 : 1,
            marginBottom: 40,
          }}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>
              Continuar →
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* PICKER MODAL */}
      <Modal visible={!!currentPicker} transparent animationType="slide">
        <Pressable
          onPress={closePicker}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "flex-end",
          }}
        >
          <Pressable>
            <View
              style={{
                backgroundColor: "#1C2535",
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                padding: 16,
                maxHeight: 400,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 16,
                  marginBottom: 10,
                  fontWeight: "600",
                }}
              >
                {currentPicker && pickerData[currentPicker].title}
              </Text>

              <FlatList
                data={currentPicker ? pickerData[currentPicker].options : []}
                keyExtractor={(item) => item}
                renderItem={({ item }) => {
                  const isSelected = currentPicker
                    ? pickerData[currentPicker].multi
                      ? (multiValues[currentPicker] || []).includes(item)
                      : values[currentPicker] === item
                    : false;

                  return (
                    <TouchableOpacity
                      onPress={() =>
                        currentPicker && handleSelect(currentPicker, item)
                      }
                      style={{
                        padding: 14,
                        borderRadius: 10,
                        backgroundColor: isSelected
                          ? "#2563EB22"
                          : "transparent",
                      }}
                    >
                      <Text style={{ color: isSelected ? "#3B82F6" : "white" }}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />

              <TouchableOpacity onPress={closePicker}>
                <Text
                  style={{
                    color: "#3B82F6",
                    textAlign: "right",
                    marginTop: 10,
                    fontWeight: "600",
                  }}
                >
                  Listo
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
