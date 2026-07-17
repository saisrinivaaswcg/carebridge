import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>

      <Text
        style={styles.logo}
        accessible={true}
        accessibilityLabel="CareBridge logo"
      >
        ❤️
      </Text>

      <Text style={styles.title}>
        CareBridge
      </Text>

      <Text style={styles.subtitle}>
        Stay connected with your loved ones through simple messages, voice notes and daily wellbeing check-ins.
      </Text>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => navigation.navigate("Login")}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Login"
        accessibilityHint="Sign in to your CareBridge account"
      >
        <Text style={styles.loginText}>
          Login
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.signupButton}
        onPress={() => navigation.navigate("Signup")}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Create Account"
        accessibilityHint="Create a new CareBridge account"
      >
        <Text style={styles.signupText}>
          Create Account
        </Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        Designed with accessibility and simplicity for older adults.
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
  },

  logo: {
    fontSize: 80,
    marginBottom: 20,
  },

  title: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#2563EB",
  },

  subtitle: {
    fontSize: 20,
    textAlign: "center",
    color: "#4B5563",
    marginTop: 15,
    marginBottom: 50,
    lineHeight: 30,
  },

  loginButton: {
    backgroundColor: "#2563EB",
    width: "100%",
    padding: 18,
    borderRadius: 15,
    marginBottom: 16,
  },

  loginText: {
    color: "#FFFFFF",
    fontSize: 22,
    textAlign: "center",
    fontWeight: "bold",
  },

  signupButton: {
    width: "100%",
    padding: 18,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#2563EB",
  },

  signupText: {
    color: "#2563EB",
    fontSize: 22,
    textAlign: "center",
    fontWeight: "bold",
  },

  footer: {
    marginTop: 40,
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },

});