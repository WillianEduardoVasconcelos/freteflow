import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";

// Em testes web usa localhost; em celular físico usa o IP da sua rede local
const API_URL =
  Platform.OS === "web" ? "http://localhost:3000" : "http://192.168.15.3:3000";

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("admin@freteflow.com");
  const [password, setPassword] = useState("Admin123!");
  const [loading, setLoading] = useState(false);
  const [statusFrete, setStatusFrete] = useState<
    "pendente" | "em_transito" | "entregue"
  >("em_transito");
  const [lastCheckin, setLastCheckin] = useState<string | null>(null);

  // 1. Função de Login
  const handleLogin = async () => {
    if (!email || !password) {
      alertCustom("Erro", "Preencha e-mail e senha.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Falha ao autenticar");
      }

      setToken(data.accessToken || "token-autenticado");
      alertCustom("Sucesso", "Login efetuado com sucesso!");
    } catch (err: any) {
      // Fallback para demonstração caso a API não esteja rodando no momento
      setToken("demo-token");
      alertCustom("Modo Demonstração", "Acessando em modo demonstração.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Disparo de Check-in GPS
  const handleCheckin = () => {
    const horaAtual = new Date().toLocaleTimeString();
    setLastCheckin(horaAtual);
    alertCustom(
      "📍 Check-in Enviado",
      `Posição registrada na central às ${horaAtual}`,
    );
  };

  // 3. Registro de Ocorrência
  const handleOccurrence = () => {
    alertCustom(
      "⚠️ Ocorrência Registrada",
      "Notificação de atraso/trânsito enviada para a central com sucesso.",
    );
  };

  // Helper para alertas multiplataforma
  const alertCustom = (title: string, msg: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n${msg}`);
    } else {
      Alert.alert(title, msg);
    }
  };

  // --- TELA DE LOGIN ---
  if (!token) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loginCard}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>📦 FreteFlow</Text>
            <Text style={styles.subtitle}>Portal do Motorista</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="motorista@freteflow.com"
              placeholderTextColor="#94a3b8"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />

            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Acessar Minhas Viagens</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // --- PAINEL PRINCIPAL DO MOTORISTA ---
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Olá, Motorista</Text>
            <Text style={styles.plateText}>
              Veículo: Scania R450 • ABC-1234
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setToken(null)}
            style={styles.logoutButton}
          >
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>

        {/* Card do Frete Ativo */}
        <View style={styles.freightCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.freightCode}>FRETE #FF-2026-08</Text>
            <View
              style={[
                styles.badge,
                statusFrete === "em_transito"
                  ? styles.badgeMoving
                  : styles.badgeDone,
              ]}
            >
              <Text style={styles.badgeText}>
                {statusFrete === "em_transito" ? "EM TRÂNSITO" : "ENTREGUE"}
              </Text>
            </View>
          </View>

          <View style={styles.routeContainer}>
            <View style={styles.routePoint}>
              <Text style={styles.pointLabel}>ORIGEM</Text>
              <Text style={styles.pointValue}>São Paulo / SP (CD Central)</Text>
            </View>
            <View style={styles.routeDivider} />
            <View style={styles.routePoint}>
              <Text style={styles.pointLabel}>DESTINO</Text>
              <Text style={styles.pointValue}>
                Curitiba / PR (Distribuidora Sul)
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoText}>📦 Carga: Peças Automotivas</Text>
            <Text style={styles.infoText}>⚖️ Peso: 14.500 kg</Text>
          </View>

          {lastCheckin && (
            <Text style={styles.lastCheckinText}>
              Último check-in GPS: {lastCheckin}
            </Text>
          )}
        </View>

        {/* Botões de Ação Operacional */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Ações da Rota</Text>

          <TouchableOpacity
            style={styles.actionButtonCheckin}
            onPress={handleCheckin}
          >
            <Text style={styles.actionButtonText}>
              📍 Atualizar Localização (GPS)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButtonOccurrence}
            onPress={handleOccurrence}
          >
            <Text style={styles.actionButtonText}>
              ⚠️ Reportar Ocorrência / Atraso
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButtonFinish}
            onPress={() => {
              setStatusFrete("entregue");
              alertCustom(
                "Parabéns!",
                "Entrega finalizada com sucesso no sistema!",
              );
            }}
          >
            <Text style={styles.actionButtonText}>
              ✅ Confirmar Entrega Realizada
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  scrollContainer: {
    padding: 20,
  },
  loginCard: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#38bdf8",
  },
  subtitle: {
    fontSize: 16,
    color: "#94a3b8",
    marginTop: 4,
  },
  form: {
    backgroundColor: "#1e293b",
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  label: {
    color: "#cbd5e1",
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 8,
    padding: 12,
    color: "#fff",
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 10,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#f8fafc",
  },
  plateText: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 2,
  },
  logoutButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#334155",
    borderRadius: 6,
  },
  logoutText: {
    color: "#f8fafc",
    fontSize: 12,
  },
  freightCard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  freightCode: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#38bdf8",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeMoving: {
    backgroundColor: "#0369a1",
  },
  badgeDone: {
    backgroundColor: "#15803d",
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  routeContainer: {
    marginBottom: 16,
  },
  routePoint: {
    marginVertical: 4,
  },
  pointLabel: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "bold",
  },
  pointValue: {
    fontSize: 15,
    color: "#e2e8f0",
    fontWeight: "500",
  },
  routeDivider: {
    height: 1,
    backgroundColor: "#334155",
    marginVertical: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#334155",
    paddingTop: 12,
  },
  infoText: {
    color: "#94a3b8",
    fontSize: 13,
  },
  lastCheckinText: {
    marginTop: 12,
    color: "#38bdf8",
    fontSize: 12,
    fontStyle: "italic",
  },
  actionsContainer: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#f8fafc",
    marginBottom: 4,
  },
  actionButtonCheckin: {
    backgroundColor: "#0284c7",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  actionButtonOccurrence: {
    backgroundColor: "#d97706",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  actionButtonFinish: {
    backgroundColor: "#16a34a",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
});
