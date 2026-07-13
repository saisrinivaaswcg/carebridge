import React, { useState } from "react";
import {
  SafeAreaView,
  View,
 Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function ProfileScreen({ navigation }) {
  const [language] = useState("English");
  const [fontSize] = useState("Large");

  return (
    <SafeAreaView style={styles.container}>

      <TouchableOpacity
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>👤 My Profile</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>Mary Tan</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>mary@email.com</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Phone</Text>
        <Text style={styles.value}>+65 9123 4567</Text>
      </View>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("Language")}
      >
        <Text style={styles.label}>🌍 Preferred Language</Text>
        <Text style={styles.value}>{language} ›</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.label}>🔠 Font Size</Text>
        <Text style={styles.value}>{fontSize}</Text>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => navigation.navigate("Welcome")}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },

  back: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2563EB",
    marginBottom: 20,
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2563EB",
    marginBottom: 25,
  },

  card: {
    backgroundColor: "#F3F4F6",
    padding: 18,
    borderRadius: 15,
    marginBottom: 15,
  },

  label: {
    fontSize: 18,
    color: "#666",
  },

  value: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 5,
  },

  logoutButton: {
    backgroundColor: "#DC2626",
    padding: 18,
    borderRadius: 15,
    marginTop: 30,
  },

  logoutText: {
    color: "white",
    fontSize: 22,
    textAlign: "center",
    fontWeight: "bold",
  },
});