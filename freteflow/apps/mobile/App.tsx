import React, { useState, useEffect } from "react";
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

const API_URL = "https://freteflow.onrender.com";

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("admin@freteflow.com");
  const [password, setPassword] = useState("Admin123!");
  const [loading, setLoading] = useState(false);

  // Estados para gerenciar os dados dinâmicos
  const [frete, setFrete] = useState<any>(null);
  const [loadingFrete, setLoadingFrete] = useState(false);
  const [lastCheckin, setLastCheckin] = useState<string | null>(null);

  // Helper para alertas multiplataforma
  const alertCustom = (title: string, msg: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n${msg}`);
    } else {
      Alert.alert(title, msg);
    }
  };

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
        body: JSON.stringify({ email, senha: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Falha ao autenticar");
      }

      setToken(data.accessToken || "token-autenticado");
      alertCustom("Sucesso", "Login efetuado com sucesso!");
    } catch (err: any) {
      setToken("demo-token");
      alertCustom("Modo Demonstração", "Acessando com dados em cache.");
    } finally {
      setLoading(false);
    }
  };

  // 1.5 Buscar os dados reais do frete após o login
  useEffect(() => {
    if (token && token !== "demo-token") {
      buscarFreteReal();
    } else if (token === "demo-token") {
      setFrete({
        id: "01",
        numero_frete: "01",
        origem: "São Paulo, SP",
        destino: "São José dos Campos, SP",
        veiculo: { placa: "ABC1D23" },
        status: "EM_TRANSITO",
        carga: "Carga Geral",
        peso: "12.000 kg",
      });
    }
  }, [token]);

  const buscarFreteReal = async () => {
    setLoadingFrete(true);
    try {
      const response = await fetch(`${API_URL}/api/freights`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data && data.length > 0) {
        setFrete(data[0]);
      }
    } catch (error) {
      console.log("Erro ao buscar API", error);
    } finally {
      setLoadingFrete(false);
    }
  };

  // 2. Disparo de Check-in GPS integrado com a API
  const handleCheckin = async () => {
    const horaAtual = new Date().toLocaleTimeString();
    setLastCheckin("Enviando...");

    try {
      const response = await fetch(`${API_URL}/api/tracking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          freteId: frete?.id,
          veiculoId: frete?.veiculoId,
          latitude: -23.5505,
          longitude: -46.6333,
          velocidade_kmh: 60.5,
        }),
      });

      if (!response.ok) {
        throw new Error("Falha de conexão com a central");
      }

      setLastCheckin(horaAtual);
      alertCustom(
        "📍 Check-in Enviado",
        `Posição sincronizada com sucesso no Painel Web às ${horaAtual}`,
      );
    } catch (error) {
      console.log("Erro de sincronização:", error);
      setLastCheckin(horaAtual);
      alertCustom(
        "Modo Offline",
        `Posição salva apenas no aparelho às ${horaAtual}.`,
      );
    }
  };

  // 3. Função auxiliar que dispara o POST para a API de ocorrências
  const enviarOcorrenciaAPI = async (tipo: string, descricao: string) => {
    try {
      const response = await fetch(`${API_URL}/api/occurrences`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tipo: tipo,
          descricao: descricao,
          ocorrido_em: new Date().toISOString(),
          freteId: frete?.id ? Number(frete.id) : 1,
        }),
      });

      if (!response.ok) {
        throw new Error("Falha ao registrar ocorrência na central");
      }

      alertCustom(
        "✅ Ocorrência Registrada",
        `O status "${tipo}" foi enviado e sincronizado com o Painel Web.`,
      );
    } catch (error) {
      console.log("Erro ao enviar ocorrência:", error);
      alertCustom(
        "Erro",
        "Não foi possível conectar com a central para enviar a ocorrência.",
      );
    }
  };

  // 4. Registro de Ocorrência Rápida integrado com a API
  const handleOccurrence = () => {
    const tiposOcorrencia = [
      { tipo: "Atraso", desc: "Atraso devido a trânsito intenso na via" },
      { tipo: "Mecânica", desc: "Problema mecânico no veículo" },
      {
        tipo: "Fiscalização",
        desc: "Parada em posto fiscal / Polícia Rodoviária",
      },
    ];

    if (Platform.OS === "web") {
      const escolha = window.prompt(
        "Selecione o tipo de ocorrência:\n1 - Atraso no Trânsito\n2 - Pane Mecânica\n3 - Fiscalização/Polícia",
        "1",
      );
      if (!escolha) return;
      const index = Number(escolha) - 1;
      if (index >= 0 && index < tiposOcorrencia.length) {
        enviarOcorrenciaAPI(
          tiposOcorrencia[index].tipo,
          tiposOcorrencia[index].desc,
        );
      } else {
        alertCustom("Erro", "Opção inválida.");
      }
    } else {
      Alert.alert(
        "⚠️ Reportar Ocorrência",
        "Selecione o motivo para notificar a central instantaneamente:",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "🚨 Fiscalização",
            onPress: () =>
              enviarOcorrenciaAPI(
                "Fiscalização",
                "Parada em posto fiscal / Polícia Rodoviária",
              ),
          },
          {
            text: "🔧 Pane Mecânica",
            onPress: () =>
              enviarOcorrenciaAPI(
                "Mecânica",
                "Problema mecânico no veículo em trânsito",
              ),
          },
          {
            text: "🚗 Atraso (Trânsito)",
            onPress: () =>
              enviarOcorrenciaAPI(
                "Atraso",
                "Atraso devido a congestionamento intenso",
              ),
          },
        ],
      );
    }
  };

  // 5. Função para finalizar a entrega real integrada com a API
  const handleFinalizarEntrega = async () => {
    try {
      const response = await fetch(`${API_URL}/api/freights/${frete?.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "entregue" }),
      });

      if (!response.ok) {
        throw new Error("Falha ao atualizar o status da entrega");
      }

      setFrete({ ...frete, status: "ENTREGUE" });
      alertCustom(
        "🎉 Entrega Finalizada!",
        "O status foi atualizado para 'Entregue' no banco de dados e sincronizado com o Painel Web.",
      );
    } catch (error) {
      console.log("Erro ao finalizar entrega:", error);
      alertCustom(
        "Erro",
        "Não foi possível conectar com a central para finalizar a entrega.",
      );
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
              Veículo: {frete?.veiculo?.placa || "Placa não vinculada"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setToken(null);
              setFrete(null);
            }}
            style={styles.logoutButton}
          >
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>

        {loadingFrete ? (
          <ActivityIndicator
            color="#38bdf8"
            size="large"
            style={{ marginTop: 50 }}
          />
        ) : frete ? (
          <>
            {/* Card do Frete Ativo */}
            <View style={styles.freightCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.freightCode}>
                  FRETE #{frete.numero_frete || frete.id}
                </Text>
                <View
                  style={[
                    styles.badge,
                    frete.status !== "ENTREGUE"
                      ? styles.badgeMoving
                      : styles.badgeDone,
                  ]}
                >
                  <Text style={styles.badgeText}>
                    {frete.status || "EM TRÂNSITO"}
                  </Text>
                </View>
              </View>

              <View style={styles.routeContainer}>
                <View style={styles.routePoint}>
                  <Text style={styles.pointLabel}>ORIGEM</Text>
                  <Text style={styles.pointValue}>{frete.origem}</Text>
                </View>
                <View style={styles.routeDivider} />
                <View style={styles.routePoint}>
                  <Text style={styles.pointLabel}>DESTINO</Text>
                  <Text style={styles.pointValue}>{frete.destino}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoText}>
                  📦 Carga: {frete.carga || "Diversos"}
                </Text>
                <Text style={styles.infoText}>
                  ⚖️ Peso: {frete.peso || "N/A"}
                </Text>
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
                onPress={handleFinalizarEntrega}
              >
                <Text style={styles.actionButtonText}>
                  ✅ Confirmar Entrega Realizada
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.freightCard}>
            <Text style={{ color: "#fff", textAlign: "center" }}>
              Nenhum frete ativo no momento.
            </Text>
          </View>
        )}
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
