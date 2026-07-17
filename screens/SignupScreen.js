import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function SignupScreen({ navigation }) {
  return (
    <View style={styles.container}>

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        accessibilityHint="Return to the Welcome screen"
      >
        <Text style={styles.backButtonText}>
          ← Back
        </Text>
      </TouchableOpacity>

      <Text style={styles.title}>
        Create Account
      </Text>

      <Text style={styles.subtitle}>
        Create your CareBridge account to stay connected with your loved ones.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your full name"
        accessibilityLabel="Full Name"
        accessibilityHint="Enter your full name"
      />

      <TextInput
        style={styles.input}
        placeholder="Enter your email address"
        keyboardType="email-address"
        autoCapitalize="none"
        accessibilityLabel="Email Address"
        accessibilityHint="Enter your email address"
      />

      <TextInput
        style={styles.input}
        placeholder="Create a password"
        secureTextEntry
        accessibilityLabel="Password"
        accessibilityHint="Create a secure password"
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm your password"
        secureTextEntry
        accessibilityLabel="Confirm Password"
        accessibilityHint="Re-enter your password"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Onboarding")}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Create Account"
        accessibilityHint="Create your CareBridge account"
      >
        <Text style={styles.buttonText}>
          Create Account
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.goBack()}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Back to Welcome"
        accessibilityHint="Return to the Welcome screen"
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
    fontSize: 22,
    textAlign: "center",
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