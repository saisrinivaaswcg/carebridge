import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function HomeScreen({ navigation }) {
  const today = new Date().toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <View style={styles.container}>

      <Text style={styles.greeting}>
        👋 Good Afternoon
      </Text>

      <Text style={styles.name}>
        Welcome, Mary
      </Text>

      <Text style={styles.date}>
        {today}
      </Text>

      <Text style={styles.subtitle}>
        Stay connected with your loved ones and complete your daily wellbeing check-in.
      </Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("Chat")}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Family Chat"
        accessibilityHint="Open the family chat to send messages and voice notes"
      >
        <Text style={styles.cardTitle}>
          💬 Family Chat
        </Text>

        <Text style={styles.cardText}>
          Send text messages and voice notes to your family.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("CheckIn")}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Daily Check-In"
        accessibilityHint="Complete today's wellbeing check-in"
      >
        <Text style={styles.cardTitle}>
          🔔 Daily Check-In
        </Text>

        <Text style={styles.cardText}>
          Let your family know how you're feeling today.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("Profile")}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="My Profile"
        accessibilityHint="View your profile, language and accessibility settings"
      >
        <Text style={styles.cardTitle}>
          👤 My Profile
        </Text>

        <Text style={styles.cardText}>
          Manage your account, language and app settings.
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 25,
    paddingTop: 70,
  },

  greeting: {
    fontSize: 22,
    color: "#6B7280",
  },

  name: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#2563EB",
    marginTop: 5,
  },

  date: {
    fontSize: 18,
    color: "#6B7280",
    marginTop: 8,
  },

  subtitle: {
    fontSize: 18,
    color: "#4B5563",
    marginTop: 15,
    marginBottom: 35,
    lineHeight: 28,
  },

  card: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 24,
    paddingHorizontal: 22,
    borderRadius: 18,
    marginBottom: 20,
  },

  cardTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#111827",
  },

  cardText: {
    fontSize: 18,
    color: "#4B5563",
    lineHeight: 26,
  },

});