import Feather from "@expo/vector-icons/Feather";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#f5f5f5" },
        headerTintColor: "#000",
        headerShadowVisible: false,
        tabBarStyle: { backgroundColor: "#f5f5f5" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Today's Habitsss",
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <Feather name="home" size={28} color={color} />
            ) : (
              <Feather name="home" size={24} color="black" />
            ),
        }}
      />
      <Tabs.Screen
        name="streak"
        options={{
          title: "Streaks",
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <Feather name="user" size={28} color={color} />
            ) : (
              <Feather name="user" size={24} color="black" />
            ),
        }}
      />
      <Tabs.Screen
        name="add-habit"
        options={{
          title: "Add Habit",
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <Feather name="plus-circle" size={28} color={color} />
            ) : (
              <Feather name="plus-circle" size={24} color="black" />
            ),
        }}
      />
    </Tabs>
  );
}
