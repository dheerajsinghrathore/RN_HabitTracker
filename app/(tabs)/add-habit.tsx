import { databases } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { addHabitLocal } from "@/lib/db";
import Feather from "@expo/vector-icons/Feather";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ID } from "react-native-appwrite";
import { SafeAreaView } from "react-native-safe-area-context";

function AddHabitScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState("Daily");
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  // Reset form when navigating away
  useFocusEffect(
    useCallback(() => {
      return () => {
        setTitle("");
        setDescription("");
        setFrequency("Daily");
        setError(null);
        setFocusedField(null);
      };
    }, [])
  );

  const frequencies = ["Daily", "Weekly", "Monthly"];

  const handleSubmit = async () => {
    // Handle habit creation logic here
    if (!title.trim()) {
      setError("Habit name is required.");
      return;
    }
    setError(null);

    if (!user) return;
    try {
      // 1. Save to Remote DB (Appwrite)
      let appwriteId = undefined;
      try {
        const response = await databases.createDocument(
          process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!,
          ID.unique(),
          {
            title,
            description,
            frequency,
            streak_count: 0,
            last_completed: new Date().toISOString(),
            created_id: new Date().toISOString(),
            user_id: user.$id,
          }
        );
        appwriteId = response.$id;
      } catch (appwriteError) {
        // console.error("Appwrite error (non-blocking):", appwriteError);
        // We continue because we want local-first functionality
      }

      // 2. Save to Local DB (SQLite)
      await addHabitLocal({
        title,
        description,
        frequency,
        streak_count: 0,
        best_streak: 0,
        total_count: 0,
        last_completed: new Date().toISOString(),
        created_at: new Date().toISOString(),
        user_id: user.$id,
        appwrite_id: appwriteId,
      });

      router.back();
    } catch (error) {
      console.error("Error creating habit:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred.");
      }
    }
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.header}>New Habit</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Habit Name</Text>
            <View
              style={[
                styles.inputWrapper,
                focusedField === "title" && styles.inputWrapperFocused,
              ]}
            >
              <Feather
                name="edit-2"
                size={20}
                color={focusedField === "title" ? "#6366f1" : "#94a3b8"}
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Ex: Morning Run"
                placeholderTextColor="#94a3b8"
                value={title}
                onChangeText={setTitle}
                onFocus={() => setFocusedField("title")}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Frequency</Text>
            <View style={styles.frequencyWrapper}>
              {frequencies.map((freq) => (
                <TouchableOpacity
                  key={freq}
                  style={[
                    styles.frequencyChip,
                    frequency === freq && styles.frequencyChipSelected,
                  ]}
                  onPress={() => setFrequency(freq)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.frequencyText,
                      frequency === freq && styles.frequencyTextSelected,
                    ]}
                  >
                    {freq}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description (Optional)</Text>
            <View
              style={[
                styles.inputWrapper,
                styles.textAreaWrapper,
                focusedField === "description" && styles.inputWrapperFocused,
              ]}
            >
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Why do you want to start this habit?"
                placeholderTextColor="#94a3b8"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                onFocus={() => setFocusedField("description")}
                onBlur={() => setFocusedField(null)}
                textAlignVertical="top"
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            style={styles.createButton}
            activeOpacity={0.8}
          >
            <Text style={styles.createButtonText}>Create Habit</Text>
          </TouchableOpacity>

          {error && (
            <Text style={{ color: "red", marginTop: 12, textAlign: "center" }}>
              {error}
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    paddingHorizontal: 16,
    height: 56,
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    // Elevation for Android
    elevation: 2,
  },
  inputWrapperFocused: {
    borderColor: "#6366f1",
    backgroundColor: "#ffffff",
    shadowOpacity: 0.1,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
    height: "100%",
  },
  frequencyWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#e2e8f0",
    borderRadius: 14,
    padding: 4,
    height: 56,
  },
  frequencyChip: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  frequencyChipSelected: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  frequencyText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  frequencyTextSelected: {
    color: "#6366f1",
  },
  textAreaWrapper: {
    height: 120,
    alignItems: "flex-start",
    paddingVertical: 12,
  },
  textArea: {
    height: "100%",
  },
  createButton: {
    backgroundColor: "#6366f1",
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  createButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
});

export default AddHabitScreen;
