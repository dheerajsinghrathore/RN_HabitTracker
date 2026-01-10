import { getHabitsLocal, getTopStreaksLocal, Habit } from "@/lib/db";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StreaksScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [topHabits, setTopHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const allHabits = await getHabitsLocal();
      const top3 = await getTopStreaksLocal(3);
      setHabits(allHabits);
      setTopHabits(top3);
    } catch (error) {
      console.error("Error fetching streak data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const renderTopStreakItem = (item: Habit, index: number) => {
    const colors = ["#fbbf24", "#94a3b8", "#d97706"]; // Gold, Silver, Bronze
    return (
      <View key={item.id} style={styles.topStreakRow}>
        <View style={styles.rankBadgeContainer}>
          <View style={[styles.rankBadge, { backgroundColor: colors[index] }]}>
            <Text style={styles.rankText}>{index + 1}</Text>
          </View>
          <Text style={styles.topStreakTitle} numberOfLines={1}>
            {item.title}
          </Text>
        </View>
        <Text style={styles.topStreakCount}>{item.streak_count}</Text>
      </View>
    );
  };

  const renderHabitCard = ({ item }: { item: Habit }) => (
    <View style={styles.habitCard}>
      <Text style={styles.habitTitle}>{item.title}</Text>
      <Text style={styles.habitDescription} numberOfLines={1}>
        {item.description || "No description provided"}
      </Text>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <View style={[styles.iconContainer, { backgroundColor: "#fffbeb" }]}>
            <Text style={styles.statIcon}>🔥</Text>
          </View>
          <View>
            <Text style={styles.statValue}>{item.streak_count}</Text>
            <Text style={styles.statLabel}>Current</Text>
          </View>
        </View>

        <View style={styles.statBox}>
          <View style={[styles.iconContainer, { backgroundColor: "#fffbeb" }]}>
            <Text style={styles.statIcon}>🏆</Text>
          </View>
          <View>
            <Text style={styles.statValue}>{item.best_streak || 0}</Text>
            <Text style={styles.statLabel}>Best</Text>
          </View>
        </View>

        <View style={styles.statBox}>
          <View style={[styles.iconContainer, { backgroundColor: "#f0fdf4" }]}>
            <Text style={styles.statIcon}>✅</Text>
          </View>
          <View>
            <Text style={styles.statValue}>{item.total_count || 0}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>
      </View>
    </View>
  );

  if (loading && habits.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.headerTitle}>Habit Streaks</Text>

        {/* Top Streaks Card */}
        {topHabits.length > 0 && (
          <View style={styles.topStreaksCard}>
            <View style={styles.topStreaksHeader}>
              <Text style={styles.topStreaksLabel}>🥇 Top Streaks</Text>
            </View>
            <View style={styles.topStreaksList}>
              {topHabits.map((item, index) => renderTopStreakItem(item, index))}
            </View>
          </View>
        )}

        {/* All Habits Stats */}
        <FlatList
          data={habits}
          renderItem={renderHabitCard}
          keyExtractor={(item) => item.id?.toString() || ""}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No habits to track yet.</Text>
            </View>
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 24,
  },
  topStreaksCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  topStreaksHeader: {
    marginBottom: 16,
  },
  topStreaksLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#6366f1",
  },
  topStreaksList: {
    gap: 12,
  },
  topStreakRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  rankBadgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rankText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  topStreakTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    flex: 1,
  },
  topStreakCount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#6366f1",
  },
  habitCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
  },
  habitTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  habitDescription: {
    fontSize: 14,
    color: "#94a3b8",
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  statBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  statIcon: {
    fontSize: 18,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase",
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyStateText: {
    color: "#94a3b8",
    fontSize: 16,
  },
});
