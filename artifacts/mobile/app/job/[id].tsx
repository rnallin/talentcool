import { Feather } from "@expo/vector-icons";
import { useGetJob } from "@workspace/api-client-react";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Colors from "@/constants/colors";

function formatCurrency(v: number) {
  return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function statusLabel(s: string) {
  if (s === "open") return "Aberta";
  if (s === "paused") return "Pausada";
  return "Fechada";
}

function statusColor(s: string) {
  if (s === "open") return Colors.statusOpen;
  if (s === "paused") return Colors.statusPaused;
  return Colors.statusClosed;
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

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: job, isLoading } = useGetJob(Number(id));

  if (isLoading || !job) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const candidates = job.candidates || [];
  const stageGroups: Record<string, typeof candidates> = {};
  candidates.forEach((c) => {
    const key = c.stage.toLowerCase();
    if (!stageGroups[key]) stageGroups[key] = [];
    stageGroups[key].push(c);
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.topCard}>
        <View style={styles.titleRow}>
          <Text style={styles.jobTitle}>{job.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor(job.status) + "18" }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor(job.status) }]} />
            <Text style={[styles.statusText, { color: statusColor(job.status) }]}>{statusLabel(job.status)}</Text>
          </View>
        </View>
        <Text style={styles.department}>{job.departmentName}</Text>

        <View style={styles.detailGrid}>
          <View style={styles.detailItem}>
            <Feather name="map-pin" size={14} color={Colors.textMuted} />
            <Text style={styles.detailText}>{job.location}</Text>
          </View>
          <View style={styles.detailItem}>
            <Feather name="monitor" size={14} color={Colors.textMuted} />
            <Text style={styles.detailText}>{job.workMode}</Text>
          </View>
          <View style={styles.detailItem}>
            <Feather name="award" size={14} color={Colors.textMuted} />
            <Text style={styles.detailText}>{job.seniority}</Text>
          </View>
          <View style={styles.detailItem}>
            <Feather name="clock" size={14} color={job.daysOpen > 30 ? Colors.warning : Colors.textMuted} />
            <Text style={[styles.detailText, job.daysOpen > 30 && { color: Colors.warning }]}>
              {job.daysOpen} dias aberta
            </Text>
          </View>
        </View>

        <View style={styles.salaryRow}>
          <Text style={styles.salaryLabel}>Faixa Salarial</Text>
          <Text style={styles.salaryValue}>
            {formatCurrency(job.minSalary)} - {formatCurrency(job.maxSalary)}
          </Text>
        </View>
      </View>

      {job.requirements && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Requisitos</Text>
          <Text style={styles.requirements}>{job.requirements}</Text>
        </View>
      )}

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Candidatos ({candidates.length})</Text>
        </View>

        {candidates.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="users" size={28} color={Colors.textMuted} />
            <Text style={styles.emptyText}>Nenhum candidato</Text>
          </View>
        ) : (
          Object.entries(stageGroups).map(([stage, cands]) => (
            <View key={stage} style={styles.stageGroup}>
              <View style={styles.stageHeader}>
                <View style={[styles.stageDot, { backgroundColor: (STAGE_CONFIG[stage] || { color: Colors.textMuted }).color }]} />
                <Text style={styles.stageName}>{(STAGE_CONFIG[stage] || { label: stage }).label}</Text>
                <View style={styles.stageCount}>
                  <Text style={styles.stageCountText}>{cands.length}</Text>
                </View>
              </View>
              {cands.map((c) => (
                <View key={c.id} style={styles.candidateItem}>
                  <View style={styles.candidateAvatar}>
                    <Text style={styles.candidateInitial}>{c.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.candidateInfo}>
                    <Text style={styles.candidateName}>{c.name}</Text>
                    <Text style={styles.candidateEmail}>{c.email}</Text>
                  </View>
                  <View style={styles.candidateSource}>
                    <Text style={styles.sourceText}>{c.source}</Text>
                  </View>
                </View>
              ))}
            </View>
          ))
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: 16,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  topCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  jobTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.text,
    flex: 1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  department: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: 16,
  },
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.textMuted,
  },
  salaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 14,
  },
  salaryLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.textSecondary,
  },
  salaryValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: Colors.primary,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  cardTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.text,
    marginBottom: 10,
  },
  requirements: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 8,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textMuted,
  },
  stageGroup: {
    marginBottom: 14,
  },
  stageHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  stageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stageName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  stageCount: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  stageCountText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: Colors.textSecondary,
  },
  candidateItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: 12,
  },
  candidateAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  candidateInitial: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.primary,
  },
  candidateInfo: {
    flex: 1,
  },
  candidateName: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: Colors.text,
  },
  candidateEmail: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
  },
  candidateSource: {
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  sourceText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: Colors.textSecondary,
  },
});
