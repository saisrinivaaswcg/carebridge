import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

export default function CheckInScreen({ navigation }) {
  const [selectedMood, setSelectedMood] = useState("");

  function submitCheckIn() {
    if (!selectedMood) {
      Alert.alert(
        "Please select a mood",
        "Choose how you're feeling today."
      );
      return;
    }

    Alert.alert(
      "Check-In Complete",
      `You selected: ${selectedMood}`
    );

    navigation.goBack();
  }

  const moods = [
    "😀 Great",
    "🙂 Good",
    "😐 Okay",
    "☹️ Not Good",
  ];

  return (
    <SafeAreaView style={styles.container}>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>
        🔔 Daily Check-In
      </Text>

      <Text style={styles.subtitle}>
        How are you feeling today?
      </Text>

      {moods.map((mood) => (
        <TouchableOpacity
          key={mood}
          style={[
            styles.option,
            selectedMood === mood && styles.selectedOption,
          ]}
          onPress={() => setSelectedMood(mood)}
        >
          <Text
            style={[
              styles.optionText,
              selectedMood === mood &&
                styles.selectedText,
            ]}
          >
            {mood}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.button}
        onPress={submitCheckIn}
      >
        <Text style={styles.buttonText}>
          Submit Check-In
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
    color: "#2563EB",
    fontWeight: "bold",
    marginBottom: 20,
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2563EB",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 20,
    color: "#666",
    marginBottom: 30,
  },

  option: {
    backgroundColor: "#F3F4F6",
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
  },

  selectedOption: {
    backgroundColor: "#2563EB",
  },

  optionText: {
    fontSize: 22,
  },

  selectedText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  button: {
    backgroundColor: "#2563EB",
    padding: 18,
    borderRadius: 15,
    marginTop: 30,
  },

  buttonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 22,
    fontWeight: "bold",
  },

});