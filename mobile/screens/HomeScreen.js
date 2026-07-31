import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { getUser } from "../services/auth";

export default function HomeScreen({ navigation }) {
  const [userName, setUserName] = useState("there");

  useEffect(() => {
    getUser().then((user) => {
      if (user) setUserName(user.full_name || "there");
    });
  }, []);

  return (
    <View style={styles.container}>

      <Text style={styles.greeting}>
        👋 Good Afternoon
      </Text>

      <Text style={styles.name}>
        Welcome, {userName}
      </Text>

      <Text style={styles.subtitle}>
        Stay connected with your loved ones.
      </Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("Chat")}
      >
        <Text style={styles.cardTitle}>
          💬 Family Chat
        </Text>
        <Text style={styles.cardText}>
          Send text messages and voice notes
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("CheckIn")}
      >
        <Text style={styles.cardTitle}>
          🔔 Daily Check-In
        </Text>
        <Text style={styles.cardText}>
          Complete today's wellbeing check-in
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("Profile")}
      >
        <Text style={styles.cardTitle}>
          👤 My Profile
        </Text>
        <Text style={styles.cardText}>
          Manage your account and settings
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 25,
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
  subtitle: {
    fontSize: 18,
    color: "#666",
    marginTop: 10,
    marginBottom: 35,
  },
  card: {
    backgroundColor: "#F3F4F6",
    padding: 22,
    borderRadius: 18,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  cardText: {
    fontSize: 18,
    color: "#555",
  },
});