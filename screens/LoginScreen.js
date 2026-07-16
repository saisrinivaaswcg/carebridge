import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function LoginScreen({ navigation }) {
  return (
    <View style={styles.container}>

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        accessibilityHint="Return to the welcome screen"
      >
        <Text style={styles.backButtonText}>
          ← Back
        </Text>
      </TouchableOpacity>

      <Text style={styles.title}>
        Welcome Back
      </Text>

      <Text style={styles.subtitle}>
        Sign in to continue using CareBridge and stay connected with your loved ones.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your email address"
        keyboardType="email-address"
        autoCapitalize="none"
        accessible={true}
        accessibilityLabel="Email address"
        accessibilityHint="Enter your email address"
      />

      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        secureTextEntry
        accessible={true}
        accessibilityLabel="Password"
        accessibilityHint="Enter your password"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Home")}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Login"
        accessibilityHint="Sign in to your CareBridge account"
      >
        <Text style={styles.buttonText}>
          Login
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.goBack()}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Back to Welcome"
        accessibilityHint="Return to the welcome screen"
      >
        <Text style={styles.secondaryButtonText}>
          Back to Welcome
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    paddingHorizontal: 25,
  },

  backButtonText: {
    color: "#2563EB",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 30,
  },

  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#2563EB",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 18,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 15,
    marginBottom: 40,
    lineHeight: 26,
  },

  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 14,
    padding: 18,
    fontSize: 20,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
  },

  button: {
    backgroundColor: "#2563EB",
    padding: 18,
    borderRadius: 14,
    marginTop: 10,
  },

  buttonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 22,
    fontWeight: "bold",
  },

  secondaryButton: {
    marginTop: 25,
    alignItems: "center",
  },

  secondaryButtonText: {
    color: "#2563EB",
    fontSize: 20,
    fontWeight: "bold",
  },

});