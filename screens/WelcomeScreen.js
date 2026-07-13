import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>❤️</Text>

      <Text style={styles.title}>CareBridge</Text>

      <Text style={styles.subtitle}>
        Stay connected with your loved ones.
      </Text>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.signupButton}
        onPress={() => navigation.navigate("Signup")}
      >
        <Text style={styles.signupText}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },

  logo: {
    fontSize: 70,
    marginBottom: 20,
  },

  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#2563EB",
  },

  subtitle: {
    fontSize: 20,
    textAlign: "center",
    color: "#555",
    marginTop: 12,
    marginBottom: 50,
  },

  loginButton: {
    backgroundColor: "#2563EB",
    width: "100%",
    padding: 18,
    borderRadius: 15,
    marginBottom: 16,
  },

  loginText: {
    color: "#fff",
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
});