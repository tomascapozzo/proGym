import { useAuth } from "@/context/auth-context";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity
} from "react-native";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Completá todos los campos.");
      return;
    }
    setError("");
    setLoading(true);
    const { error: err } = await signIn(email.trim(), password);
    setLoading(false);
    if (err) {
      setError(err);
    }
    // navigation is handled by the root layout redirect
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#0A0F1A" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* LOGO / TITLE */}
        <Text
          style={{
            color: "#3B82F6",
            fontSize: 32,
            fontWeight: "bold",
            textAlign: "center",
            letterSpacing: 1,
            marginBottom: 4,
          }}
        >
          proGym
        </Text>
        <Text
          style={{
            color: "#888",
            textAlign: "center",
            marginBottom: 40,
          }}
        >
          Tu entrenador personal con IA
        </Text>

        {/* FORM */}
        <Text style={{ color: "#888", fontSize: 12, marginBottom: 6 }}>
          EMAIL
        </Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="tu@email.com"
          placeholderTextColor="#555"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          style={{
            backgroundColor: "#111827",
            padding: 16,
            borderRadius: 12,
            color: "white",
            marginBottom: 16,
          }}
        />

        <Text style={{ color: "#888", fontSize: 12, marginBottom: 6 }}>
          CONTRASEÑA
        </Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor="#555"
          secureTextEntry
          style={{
            backgroundColor: "#111827",
            padding: 16,
            borderRadius: 12,
            color: "white",
            marginBottom: 24,
          }}
        />

        {error ? (
          <Text
            style={{ color: "#EF4444", textAlign: "center", marginBottom: 16 }}
          >
            {error}
          </Text>
        ) : null}

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          style={{
            backgroundColor: "#2563EB",
            padding: 18,
            borderRadius: 14,
            alignItems: "center",
            marginBottom: 20,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>
              Iniciar sesión
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
          <Text style={{ color: "#888", textAlign: "center" }}>
            ¿No tenés cuenta?{" "}
            <Text style={{ color: "#3B82F6" }}>Registrate</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
