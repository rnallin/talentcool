import { Feather } from "@expo/vector-icons";
import {
  useGetMetricsOverview,
  useGetFunnelMetrics,
  useGetTimeToHireMetrics,
} from "@workspace/api-client-react";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";

function formatCurrency(v: number) {
  if (v >= 1000000) return `R$ ${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `R$ ${(v / 1000).toFixed(0)}k`;
  return `R$ ${v.toFixed(0)}`;
}

const STAGE_CONFIG: Record<string, { color: string; label: string }> = {
  triagem: { color: "#6366F1", label: "Triagem" },
  entrevista: { color: "#3B82F6", label: "Entrevista" },
  entrevista_rh: { color: "#60A5FA", label: "Entrevista RH" },
  entrevista_tecnica: { color: "#818CF8", label: "Entrevista Tecnica" },
  proposta: { color: "#F59E0B", label: "Proposta" },
  contratado: { color: "#10B981", label: "Contratado" },
  rejeitado: { color: "#EF4444", label: "Rejeitado" },
  reprovado: { color: "#EF4444", label: "Reprovado" },
};

function FunnelBar({ stage, count, max }: { stage: string; count: number; max: number }) {
  const key = stage.toLowerCase();
  const config = STAGE_CONFIG[key] || { color: "#94A3B8", label: stage };
  const pct = max > 0 ? (count / max) * 100 : 0;

  return (
    <View style={styles.funnelItem}>
      <View style={styles.funnelTop}>
        <View style={[styles.funnelDot, { backgroundColor: config.color }]} />
        <Text style={styles.funnelLabel}>{config.label}</Text>
        <Text style={styles.funnelCount}>{count}</Text>
      </View>
      <View style={styles.funnelBarBg}>
        <View style={[styles.funnelBarFill, { width: `${Math.max(pct, 3)}%`, backgroundColor: config.color }]} />
      </View>
    </View>
  );
}

export default function MetricsScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const { data: metrics, isLoading: ml, refetch: r1 } = useGetMetricsOverview();
  const { data: funnel, isLoading: fl, refetch: r2 } = useGetFunnelMetrics();
  const { data: tth, isLoading: tl, refetch: r3 } = useGetTimeToHireMetrics();

  const isLoading = ml || fl || tl;

  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([r1(), r2(), r3()]);
    setRefreshing(false);
  };

  const maxFunnel = (funnel || []).reduce((m, f) => Math.max(m, f.count), 0);

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Metricas</Text>
        <Text style={styles.subtitle}>Performance de RH</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <>
            <View style={styles.overviewGrid}>
              <View style={styles.overviewCard}>
                <Feather name="clock" size={18} color={Colors.primary} />
                <Text style={styles.overviewValue}>{(metrics?.avgTimeToHireDays ?? 0).toFixed(0)}d</Text>
                <Text style={styles.overviewLabel}>Tempo Medio</Text>
              </View>
              <View style={styles.overviewCard}>
                <Feather name="dollar-sign" size={18} color={Colors.primaryLight} />
                <Text style={styles.overviewValue}>{formatCurrency(metrics?.costPerHire ?? 0)}</Text>
                <Text style={styles.overviewLabel}>Custo/Contratacao</Text>
              </View>
              <View style={styles.overviewCard}>
                <Feather name="check-circle" size={18} color="#10B981" />
                <Text style={styles.overviewValue}>{metrics?.hiresThisMonth ?? 0}</Text>
                <Text style={styles.overviewLabel}>Contratados (mes)</Text>
              </View>
              <View style={styles.overviewCard}>
                <Feather name="thumbs-up" size={18} color="#6366F1" />
                <Text style={styles.overviewValue}>{(metrics?.candidateNps ?? 0).toFixed(0)}</Text>
                <Text style={styles.overviewLabel}>NPS Candidatos</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Funil de Contratacao</Text>
              <Text style={styles.cardSubtitle}>Distribuicao de candidatos por etapa</Text>
              <View style={styles.funnelList}>
                {(funnel || []).map((f, i) => (
                  <FunnelBar key={i} stage={f.stage} count={f.count} max={maxFunnel} />
                ))}
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Tempo de Contratacao por Departamento</Text>
              <Text style={styles.cardSubtitle}>Media de dias para contratar</Text>
              {(tth || []).map((d, i) => (
                <View key={i} style={styles.deptItem}>
                  <View style={styles.deptLeft}>
                    <Text style={styles.deptName}>{d.department}</Text>
                    <View style={styles.deptBarBg}>
                      <View
                        style={[
                          styles.deptBarFill,
                          {
                            width: `${Math.min((d.avgDays / 60) * 100, 100)}%`,
                            backgroundColor: d.avgDays > 35 ? Colors.warning : Colors.primaryLight,
                          },
                        ]}
                      />
                    </View>
                  </View>
                  <Text style={[styles.deptDays, d.avgDays > 35 && { color: Colors.warning }]}>
                    {d.avgDays.toFixed(0)}d
                  </Text>
                </View>
              ))}
            </View>

            <View style={{ height: 100 }} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: Colors.text,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scroll: {
    paddingHorizontal: 16,
  },
  loadingWrap: {
    paddingTop: 100,
    alignItems: "center",
  },
  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  overviewCard: {
    width: "48%",
    flexGrow: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 6,
  },
  overviewValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: Colors.text,
  },
  overviewLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textMuted,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 12,
  },
  cardTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.text,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 16,
  },
  funnelList: {
    gap: 12,
  },
  funnelItem: {},
  funnelTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  funnelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  funnelLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.text,
    flex: 1,
  },
  funnelCount: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.text,
  },
  funnelBarBg: {
    width: "100%",
    height: 8,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 4,
    overflow: "hidden",
  },
  funnelBarFill: {
    height: 8,
    borderRadius: 4,
  },
  deptItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  deptLeft: {
    flex: 1,
  },
  deptName: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.text,
    marginBottom: 4,
  },
  deptBarBg: {
    width: "100%",
    height: 6,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 3,
    overflow: "hidden",
  },
  deptBarFill: {
    height: 6,
    borderRadius: 3,
  },
  deptDays: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.text,
    minWidth: 30,
    textAlign: "right",
  },
});
