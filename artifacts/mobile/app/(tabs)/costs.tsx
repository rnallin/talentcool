import { Feather } from "@expo/vector-icons";
import { useGetOpenJobsCost } from "@workspace/api-client-react";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";

function formatCurrency(v: number) {
  return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function CovSimulator() {
  const [salary] = useState(12000);
  const [charges] = useState(68);
  const [days] = useState(45);
  const [factor] = useState(1.5);

  const totalMensal = salary * (1 + charges / 100);
  const dailyLoss = (totalMensal * factor) / 22;
  const totalLoss = dailyLoss * days;

  return (
    <View style={styles.simCard}>
      <View style={styles.simHeader}>
        <View>
          <Text style={styles.simTitle}>Simulador de CoV</Text>
          <Text style={styles.simSubtitle}>Custo de Vacancia</Text>
        </View>
        <View style={styles.simIcon}>
          <Feather name="sliders" size={20} color={Colors.primaryLight} />
        </View>
      </View>

      <View style={styles.simRow}>
        <Text style={styles.simLabel}>Salario Base</Text>
        <Text style={styles.simValue}>{formatCurrency(salary)}</Text>
      </View>
      <View style={styles.simBar}>
        <View style={[styles.simBarFill, { width: "60%", backgroundColor: Colors.primary }]} />
      </View>

      <View style={styles.simRow}>
        <Text style={styles.simLabel}>Encargos CLT</Text>
        <Text style={styles.simValue}>{charges}%</Text>
      </View>
      <View style={styles.simBar}>
        <View style={[styles.simBarFill, { width: "68%", backgroundColor: Colors.primaryLight }]} />
      </View>

      <View style={styles.simRow}>
        <Text style={styles.simLabel}>Dias em Aberto</Text>
        <Text style={styles.simValue}>{days} dias</Text>
      </View>
      <View style={styles.simBar}>
        <View style={[styles.simBarFill, { width: "45%", backgroundColor: Colors.warning }]} />
      </View>

      <View style={styles.simRow}>
        <Text style={styles.simLabel}>Fator de Impacto</Text>
        <Text style={styles.simValue}>{factor}x</Text>
      </View>

      <View style={styles.resultBox}>
        <Text style={styles.resultLabel}>CUSTO TOTAL ESTIMADO</Text>
        <Text style={styles.resultValue}>{formatCurrency(totalLoss)}</Text>
        <Text style={styles.resultNote}>Perda diaria: {formatCurrency(dailyLoss)}/dia</Text>
      </View>
    </View>
  );
}

export default function CostsScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const { data: costReport, isLoading } = useGetOpenJobsCost();

  const jobs = costReport?.jobs ?? [];
  const totalCost = costReport?.totalMonthlyCost ?? 0;

  const highestCostJob = jobs.length > 0
    ? jobs.reduce((max, j) => j.totalAccruedCost > max.totalAccruedCost ? j : max, jobs[0])
    : null;

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Custos</Text>
        <Text style={styles.subtitle}>Custo de Vacancia</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <>
            <View style={styles.totalCard}>
              <View style={styles.totalTop}>
                <View style={styles.totalIconWrap}>
                  <Feather name="alert-triangle" size={20} color={Colors.danger} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.totalLabel}>Custo Total de Vagas Abertas</Text>
                  <Text style={styles.totalValue}>{formatCurrency(totalCost)}</Text>
                </View>
              </View>
              <Text style={styles.totalNote}>
                {jobs.length} {jobs.length === 1 ? "vaga aberta" : "vagas abertas"} gerando perda
              </Text>
            </View>

            {highestCostJob && (
              <View style={styles.alertCard}>
                <Feather name="alert-circle" size={16} color={Colors.warning} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.alertText}>
                    Maior custo: <Text style={styles.alertBold}>{highestCostJob.jobTitle}</Text>
                  </Text>
                  <Text style={styles.alertValue}>
                    {formatCurrency(highestCostJob.totalAccruedCost)} ({highestCostJob.daysOpen}d aberta)
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Vagas Abertas</Text>
              {jobs.map((job) => (
                <View key={job.jobId} style={styles.costItem}>
                  <View style={styles.costLeft}>
                    <Text style={styles.costTitle} numberOfLines={1}>{job.jobTitle}</Text>
                    <View style={styles.costMeta}>
                      <Text style={styles.costMetaText}>{job.department}</Text>
                      <View style={styles.costDot} />
                      <Text style={[styles.costMetaText, (job.daysOpen ?? 0) > 30 && { color: Colors.warning }]}>
                        {job.daysOpen}d
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.costLoss}>{formatCurrency(job.totalAccruedCost)}</Text>
                </View>
              ))}
            </View>

            <CovSimulator />

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
  totalCard: {
    backgroundColor: Colors.dangerBg,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  totalTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  totalIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  totalLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "#991B1B",
  },
  totalValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    color: "#DC2626",
    marginTop: 2,
  },
  totalNote: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#B91C1C",
  },
  alertCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: Colors.warningBg,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  alertText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#92400E",
  },
  alertBold: {
    fontFamily: "Inter_600SemiBold",
  },
  alertValue: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: "#B45309",
    marginTop: 2,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 17,
    color: Colors.text,
    marginBottom: 12,
  },
  costItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 8,
  },
  costLeft: {
    flex: 1,
    marginRight: 12,
  },
  costTitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: Colors.text,
  },
  costMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 3,
  },
  costMetaText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textMuted,
  },
  costDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.textMuted,
  },
  costLoss: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.danger,
  },
  simCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 16,
  },
  simHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  simTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 17,
    color: Colors.text,
  },
  simSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
  },
  simIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primary + "10",
    alignItems: "center",
    justifyContent: "center",
  },
  simRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  simLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
  },
  simValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.text,
  },
  simBar: {
    width: "100%",
    height: 6,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 3,
    marginBottom: 14,
    overflow: "hidden",
  },
  simBarFill: {
    height: 6,
    borderRadius: 3,
  },
  resultBox: {
    backgroundColor: Colors.dangerBg,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  resultLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: "#991B1B",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  resultValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: "#DC2626",
  },
  resultNote: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#B91C1C",
    marginTop: 4,
  },
});
