import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

export default function ProfileScreen({ navigation }) {
  const [language] = useState("English");
  const [fontSize] = useState("Large");
  const [highContrast] = useState("Off");

  function logout() {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out of CareBridge?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => navigation.navigate("Welcome"),
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        accessibilityHint="Returns to the Home screen"
      >
        <Text style={styles.back}>
          ← Back
        </Text>
      </TouchableOpacity>

      <Text style={styles.title}>
        👤 My Profile
      </Text>

      <Text style={styles.subtitle}>
        Manage your account and accessibility preferences.
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>
          Name
        </Text>

        <Text style={styles.value}>
          Mary Tan
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Email
        </Text>

        <Text style={styles.value}>
          mary@email.com
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Phone Number
        </Text>

        <Text style={styles.value}>
          +65 9123 4567
        </Text>
      </View>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("Language")}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Preferred Language"
        accessibilityHint="Open language settings"
      >
        <Text style={styles.label}>
          🌍 Preferred Language
        </Text>

        <Text style={styles.value}>
          {language} ›
        </Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.label}>
          🔠 Font Size
        </Text>

        <Text style={styles.value}>
          {fontSize}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          🎨 High Contrast
        </Text>

        <Text style={styles.value}>
          {highContrast}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={logout}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Logout"
        accessibilityHint="Logs out of your CareBridge account"
      >
        <Text style={styles.logoutText}>
          Logout
        </Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
  },

  subtitle: {
    fontSize: 18,
    color: "#6B7280",
    marginTop: 8,
    marginBottom: 25,
    lineHeight: 26,
  },

  card: {
    backgroundColor: "#F3F4F6",
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
  },

  label: {
    fontSize: 18,
    color: "#6B7280",
  },

  value: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 6,
  },

  logoutButton: {
    backgroundColor: "#DC2626",
    padding: 18,
    borderRadius: 15,
    marginTop: 30,
  },

  logoutText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 22,
    fontWeight: "bold",
  },

});