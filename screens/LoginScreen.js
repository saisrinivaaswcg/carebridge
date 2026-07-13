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

      <Text style={styles.title}>Welcome Back</Text>

      <TextInput
        style={styles.input}
        placeholder="Email Address"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>← Back to Welcome</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    padding: 25,
  },

  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#2563EB",
    textAlign: "center",
    marginBottom: 40,
  },

  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 18,
    fontSize: 20,
    marginBottom: 20,
  },

  button: {
    backgroundColor: "#2563EB",
    padding: 18,
    borderRadius: 12,
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontSize: 22,
    textAlign: "center",
    fontWeight: "bold",
  },

  backButton: {
    marginTop: 20,
    alignItems: "center",
  },

  backButtonText: {
    color: "#2563EB",
    fontSize: 20,
    fontWeight: "bold",
  },

});