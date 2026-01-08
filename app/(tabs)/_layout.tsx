import { Tabs } from "expo-router";
import Feather from "@expo/vector-icons/Feather";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "coral" }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <Feather name="home" size={28} color={color} />
            ) : (
              <Feather name="home" size={24} color="black" />
            ),
        }}
      />
      <Tabs.Screen
        name="login"
        options={{
          title: "Login",
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <Feather name="user" size={28} color={color} />
            ) : (
              <Feather name="user" size={24} color="black" />
            ),
        }}
      />
    </Tabs>
  );
}
