import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";

type JobCardProps = {
  id: number;
  title: string;
  department: string;
  status: string;
  seniority: string;
  location: string;
  workMode: string;
  daysOpen: number;
  candidateCount: number;
  minSalary: number;
  maxSalary: number;
};

function formatSalary(v: number) {
  return `R$ ${(v / 1000).toFixed(0)}k`;
}

function statusColor(s: string) {
  if (s === "open") return Colors.statusOpen;
  if (s === "paused") return Colors.statusPaused;
  return Colors.statusClosed;
}

function statusLabel(s: string) {
  if (s === "open") return "Aberta";
  if (s === "paused") return "Pausada";
  return "Fechada";
}

export function JobCard(props: JobCardProps) {
  const { id, title, department, status, seniority, location, workMode, daysOpen, candidateCount, minSalary, maxSalary } = props;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => router.push({ pathname: "/job/[id]", params: { id: String(id) } })}
    >
      <View style={styles.top}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor(status) + "18" }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor(status) }]} />
            <Text style={[styles.statusText, { color: statusColor(status) }]}>{statusLabel(status)}</Text>
          </View>
        </View>
        <Text style={styles.department}>{department}</Text>
      </View>

      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <Feather name="map-pin" size={13} color={Colors.textMuted} />
          <Text style={styles.metaText}>{location}</Text>
        </View>
        <View style={styles.metaItem}>
          <Feather name="monitor" size={13} color={Colors.textMuted} />
          <Text style={styles.metaText}>{workMode}</Text>
        </View>
        <View style={styles.metaItem}>
          <Feather name="award" size={13} color={Colors.textMuted} />
          <Text style={styles.metaText}>{seniority}</Text>
        </View>
      </View>

      <View style={styles.bottom}>
        <Text style={styles.salary}>{formatSalary(minSalary)} - {formatSalary(maxSalary)}</Text>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Feather name="users" size={13} color={Colors.textSecondary} />
            <Text style={styles.statText}>{candidateCount}</Text>
          </View>
          <View style={[styles.stat, daysOpen > 30 && styles.statWarn]}>
            <Feather name="clock" size={13} color={daysOpen > 30 ? Colors.warning : Colors.textSecondary} />
            <Text style={[styles.statText, daysOpen > 30 && { color: Colors.warning }]}>{daysOpen}d</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 10,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  top: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  title: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
  },
  department: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  meta: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textMuted,
  },
  bottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 10,
  },
  salary: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.primary,
  },
  stats: {
    flexDirection: "row",
    gap: 12,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statWarn: {},
  statText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
