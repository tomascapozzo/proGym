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

export default function SignupScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !username.trim() || !email.trim() || !password.trim()) {
      setError("Completá todos los campos.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setError("");
    setLoading(true);
    const { error: err } = await signUp(
      email.trim(),
      password,
      name.trim(),
      username.trim(),
    );
    setLoading(false);
    if (err) {
      setError(err);
    }
    // navigation handled by root layout
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
        {/* HEADER */}
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
        <Text style={{ color: "#888", textAlign: "center", marginBottom: 40 }}>
          Creá tu cuenta y empezá hoy
        </Text>

        {/* NOMBRE */}
        <Text style={{ color: "#888", fontSize: 12, marginBottom: 6 }}>
          NOMBRE
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Tu nombre"
          placeholderTextColor="#555"
          autoCapitalize="words"
          style={{
            backgroundColor: "#111827",
            padding: 16,
            borderRadius: 12,
            color: "white",
            marginBottom: 16,
          }}
        />

        {/* USERNAME */}
        <Text style={{ color: "#888", fontSize: 12, marginBottom: 6 }}>
          USUARIO
        </Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="@usuario"
          placeholderTextColor="#555"
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

        {/* EMAIL */}
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

        {/* PASSWORD */}
        <Text style={{ color: "#888", fontSize: 12, marginBottom: 6 }}>
          CONTRASEÑA
        </Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Mínimo 6 caracteres"
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
          onPress={handleSignup}
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
              Crear cuenta
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: "#888", textAlign: "center" }}>
            ¿Ya tenés cuenta?{" "}
            <Text style={{ color: "#3B82F6" }}>Iniciá sesión</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
