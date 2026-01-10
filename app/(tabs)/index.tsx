import { databases } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import {
  deleteHabitLocal,
  deleteHabitsLocal,
  getHabitsLocal,
  Habit,
} from "@/lib/db";
import Feather from "@expo/vector-icons/Feather";
import { useFocusEffect, useNavigation } from "expo-router";
import React, { useCallback, useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Index() {
  const { signOut, user } = useAuth();
  const navigation = useNavigation();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHabits, setSelectedHabits] = useState<number[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);

  const fetchHabits = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getHabitsLocal();
      setHabits(data);
    } catch (error) {
      console.error("Error fetching habits:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: signOut },
    ]);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: isSelectMode
        ? `${selectedHabits.length} Selected`
        : "Today's Habits",
      headerRight: () => (
        <View style={styles.headerActions}>
          {isSelectMode ? (
            <>
              <TouchableOpacity
                onPress={deleteSelectedHabits}
                style={styles.actionButton}
              >
                <Feather name="trash-2" size={22} color="#ef4444" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setIsSelectMode(false);
                  setSelectedHabits([]);
                }}
                style={styles.actionButton}
              >
                <Feather name="x" size={22} color="#1e293b" />
              </TouchableOpacity>
            </>
          ) : (
            <View style={{ flexDirection: "row", gap: 16 }}>
              {habits.length > 0 && (
                <TouchableOpacity
                  onPress={() => setIsSelectMode(true)}
                  style={styles.actionButton}
                >
                  <Feather name="edit" size={22} color="#6366f1" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={handleSignOut}
                style={styles.actionButton}
              >
                <Feather name="log-out" size={22} color="#ef4444" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      ),
    });
  }, [navigation, isSelectMode, selectedHabits.length, habits.length]);

  useFocusEffect(
    useCallback(() => {
      fetchHabits();
      // Reset select mode when navigating away or focusing back
      setIsSelectMode(false);
      setSelectedHabits([]);
    }, [fetchHabits])
  );

  const toggleSelect = (id: number) => {
    setSelectedHabits((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const deleteHabit = async (habit: Habit) => {
    if (!habit.id) return;

    try {
      // 1. Delete locally
      await deleteHabitLocal(habit.id);

      // 2. Delete from Appwrite (if exists)
      if (habit.appwrite_id) {
        try {
          await databases.deleteDocument(
            process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!,
            habit.appwrite_id
          );
        } catch (appwriteError) {
          console.error(
            "Appwrite deletion error (non-blocking):",
            appwriteError
          );
        }
      }

      // Refresh list
      fetchHabits();
    } catch (error) {
      console.error("Error deleting habit:", error);
      Alert.alert("Error", "Failed to delete habit.");
    }
  };

  const deleteSelectedHabits = async () => {
    if (selectedHabits.length === 0) return;

    Alert.alert(
      "Confirm Deletion",
      `Are you sure you want to delete ${selectedHabits.length} habit(s)?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const habitsToDelete = habits.filter((h) =>
                selectedHabits.includes(h.id!)
              );

              // 1. Delete locally
              await deleteHabitsLocal(selectedHabits);

              // 2. Delete from Appwrite
              for (const habit of habitsToDelete) {
                if (habit.appwrite_id) {
                  try {
                    await databases.deleteDocument(
                      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
                      process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!,
                      habit.appwrite_id
                    );
                  } catch (appwriteError) {
                    console.error("Appwrite deletion error:", appwriteError);
                  }
                }
              }

              // Reset state
              setIsSelectMode(false);
              setSelectedHabits([]);
              fetchHabits();
            } catch (error) {
              console.error("Error deleting habits:", error);
              Alert.alert("Error", "Failed to delete selected habits.");
            }
          },
        },
      ]
    );
  };

  const confirmSingleDelete = (habit: Habit) => {
    Alert.alert(
      "Delete Habit",
      `Are you sure you want to delete "${habit.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteHabit(habit),
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Habit }) => {
    const isSelected = selectedHabits.includes(item.id!);

    return (
      <TouchableOpacity
        style={[styles.habitCard, isSelected && styles.habitCardSelected]}
        onLongPress={() => {
          setIsSelectMode(true);
          toggleSelect(item.id!);
        }}
        onPress={() => {
          if (isSelectMode) {
            toggleSelect(item.id!);
          }
        }}
        activeOpacity={0.7}
      >
        {isSelectMode && (
          <View style={styles.selectionIndicator}>
            <Feather
              name={isSelected ? "check-circle" : "circle"}
              size={24}
              color={isSelected ? "#6366f1" : "#94a3b8"}
            />
          </View>
        )}
        <View style={styles.habitInfo}>
          <Text style={styles.habitTitle}>{item.title}</Text>
          {item.description ? (
            <Text style={styles.habitDescription}>{item.description}</Text>
          ) : null}
        </View>
        <View style={styles.rightContainer}>
          <View style={styles.badgeColumn}>
            <View style={styles.frequencyBadge}>
              <Text style={styles.frequencyText}>{item.frequency}</Text>
            </View>
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>{item.streak_count} 🔥</Text>
            </View>
          </View>
          {!isSelectMode && (
            <TouchableOpacity
              onPress={() => confirmSingleDelete(item)}
              style={styles.deleteIconButton}
            >
              <Feather name="trash-2" size={20} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && habits.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={habits}
        keyExtractor={(item) => item.id?.toString() || ""}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No habits found for today.
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Add a new habit to get started!
            </Text>
          </View>
        }
      />
    </View>
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
    backgroundColor: "#f8fafc",
  },
  headerActions: {
    flexDirection: "row",
    gap: 16,
    marginRight: 16,
  },
  actionButton: {
    padding: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  habitCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  habitCardSelected: {
    borderColor: "#6366f1",
    backgroundColor: "#f5f3ff",
  },
  selectionIndicator: {
    marginRight: 12,
  },
  habitInfo: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  badgeColumn: {
    alignItems: "flex-end",
    gap: 6,
  },
  frequencyBadge: {
    backgroundColor: "#e0e7ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  frequencyText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4338ca",
  },
  habitDescription: {
    fontSize: 14,
    color: "#64748b",
  },
  streakBadge: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  streakText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#d97706",
  },
  deleteIconButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 64,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 8,
  },
});
