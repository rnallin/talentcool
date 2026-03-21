import { Feather } from "@expo/vector-icons";
import { useGetMetricsOverview, useListJobs } from "@workspace/api-client-react";
import React from "react";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { KPICard } from "@/components/KPICard";
import Colors from "@/constants/colors";

function formatCurrency(v: number) {
  if (v >= 1000000) return `R$ ${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `R$ ${(v / 1000).toFixed(0)}k`;
  return `R$ ${v.toFixed(0)}`;
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const {
    data: metrics,
    isLoading: metricsLoading,
    refetch: refetchMetrics,
  } = useGetMetricsOverview();

  const {
    data: jobs,
    isLoading: jobsLoading,
    refetch: refetchJobs,
  } = useListJobs({ status: "open" });

  const isLoading = metricsLoading || jobsLoading;
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchMetrics(), refetchJobs()]);
    setRefreshing(false);
  };

  const recentJobs = (jobs || []).slice(0, 5);

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Talent Cool</Text>
          <Text style={styles.subtitle}>Dashboard de RH</Text>
        </View>
        <View style={styles.avatarWrap}>
          <Feather name="user" size={20} color={Colors.primary} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {isLoading && !metrics ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <>
            <View style={styles.kpiRow}>
              <KPICard
                title="Vagas Abertas"
                value={String(metrics?.totalOpenJobs ?? 0)}
                icon="briefcase"
                iconBg={Colors.infoBg}
                iconColor={Colors.info}
                trend={metrics?.openJobsGrowth}
              />
              <KPICard
                title="Candidatos"
                value={String(metrics?.totalCandidates ?? 0)}
                icon="users"
                iconBg="#F3E8FF"
                iconColor="#9333EA"
                trend={metrics?.candidatesGrowth}
              />
            </View>

            <View style={styles.kpiRow}>
              <KPICard
                title="Tempo Medio"
                value={`${(metrics?.avgTimeToHireDays ?? 0).toFixed(0)}d`}
                icon="clock"
                iconBg={Colors.warningBg}
                iconColor={Colors.warning}
                subtitle="para contratacao"
              />
              <KPICard
                title="Custo Total"
                value={formatCurrency(metrics?.totalOpenJobsCost ?? 0)}
                icon="trending-down"
                iconBg={Colors.dangerBg}
                iconColor={Colors.danger}
                subtitle="vagas abertas"
              />
            </View>

            <View style={styles.kpiRow}>
              <KPICard
                title="Custo/Contratacao"
                value={formatCurrency(metrics?.costPerHire ?? 0)}
                icon="dollar-sign"
                iconBg="#ECFDF5"
                iconColor="#059669"
              />
              <KPICard
                title="Contratados"
                value={`${metrics?.hiresThisMonth ?? 0}`}
                icon="check-circle"
                iconBg="#ECFDF5"
                iconColor="#10B981"
                subtitle="este mes"
              />
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Vagas Recentes</Text>
                <Pressable onPress={() => router.push("/(tabs)/jobs")}>
                  <Text style={styles.sectionLink}>Ver todas</Text>
                </Pressable>
              </View>

              {recentJobs.length === 0 ? (
                <View style={styles.emptyState}>
                  <Feather name="inbox" size={32} color={Colors.textMuted} />
                  <Text style={styles.emptyText}>Nenhuma vaga aberta</Text>
                </View>
              ) : (
                recentJobs.map((job) => (
                  <Pressable
                    key={job.id}
                    style={({ pressed }) => [styles.jobItem, pressed && { opacity: 0.8 }]}
                    onPress={() => router.push({ pathname: "/job/[id]", params: { id: String(job.id) } })}
                  >
                    <View style={styles.jobLeft}>
                      <View style={[styles.jobDot, { backgroundColor: Colors.statusOpen }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.jobTitle} numberOfLines={1}>{job.title}</Text>
                        <Text style={styles.jobDept}>{job.departmentName}</Text>
                      </View>
                    </View>
                    <View style={styles.jobRight}>
                      <View style={styles.jobStat}>
                        <Feather name="users" size={12} color={Colors.textMuted} />
                        <Text style={styles.jobStatText}>{job.candidateCount}</Text>
                      </View>
                      <View style={styles.jobStat}>
                        <Feather name="clock" size={12} color={job.daysOpen > 30 ? Colors.warning : Colors.textMuted} />
                        <Text style={[styles.jobStatText, job.daysOpen > 30 && { color: Colors.warning }]}>
                          {job.daysOpen}d
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                ))
              )}
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: Colors.primary,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  avatarWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary + "12",
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    paddingHorizontal: 16,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  kpiRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  section: {
    marginTop: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 17,
    color: Colors.text,
  },
  sectionLink: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.primaryLight,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textMuted,
  },
  jobItem: {
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
  jobLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  jobDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  jobTitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: Colors.text,
  },
  jobDept: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
  },
  jobRight: {
    flexDirection: "row",
    gap: 10,
  },
  jobStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  jobStatText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textMuted,
  },
});
