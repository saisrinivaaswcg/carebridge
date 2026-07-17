import React, { useState } from "react";
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

export default function CheckInScreen({ navigation }) {
  const [selectedMood, setSelectedMood] = useState("");

  const moods = [
    {
      emoji: "😀",
      title: "Great",
      description: "I feel energetic and happy today.",
    },
    {
      emoji: "🙂",
      title: "Good",
      description: "I am doing well today.",
    },
    {
      emoji: "😐",
      title: "Okay",
      description: "I feel alright, nothing unusual.",
    },
    {
      emoji: "☹️",
      title: "Not Good",
      description: "I would like some support today.",
    },
  ];

  function submitCheckIn() {
    if (!selectedMood) {
      Alert.alert(
        "Please Select a Mood",
        "Choose how you're feeling before submitting."
      );
      return;
    }

    Alert.alert(
      "Check-In Complete",
      `Thank you for checking in today.\n\nYou selected: ${selectedMood}`
    );

    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.container}>

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        accessibilityHint="Returns to the previous screen"
      >
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>
        🔔 Daily Check-In
      </Text>

      <Text style={styles.subtitle}>
        How are you feeling today?
      </Text>

      <Text style={styles.description}>
        Your response helps your family better understand how you're doing today.
      </Text>

      {moods.map((mood) => (
        <TouchableOpacity
          key={mood.title}
          style={[
            styles.option,
            selectedMood === mood.title &&
              styles.selectedOption,
          ]}
          onPress={() => setSelectedMood(mood.title)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Select ${mood.title}`}
          accessibilityHint={mood.description}
        >
          <Text
            style={[
              styles.optionTitle,
              selectedMood === mood.title &&
                styles.selectedText,
            ]}
          >
            {selectedMood === mood.title ? "✓ " : ""}
            {mood.emoji} {mood.title}
          </Text>

          <Text
            style={[
              styles.optionDescription,
              selectedMood === mood.title &&
                styles.selectedDescription,
            ]}
          >
            {mood.description}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.button}
        onPress={submitCheckIn}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Submit daily check-in"
        accessibilityHint="Saves today's wellbeing check-in"
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
    fontSize: 22,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 10,
  },

  description: {
    fontSize: 18,
    color: "#6B7280",
    lineHeight: 26,
    marginBottom: 25,
  },

  option: {
    backgroundColor: "#F3F4F6",
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
  },

  selectedOption: {
    backgroundColor: "#2563EB",
  },

  optionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 6,
  },

  optionDescription: {
    fontSize: 17,
    color: "#6B7280",
    lineHeight: 24,
  },

  selectedText: {
    color: "#FFFFFF",
  },

  selectedDescription: {
    color: "#E5E7EB",
  },

  button: {
    backgroundColor: "#2563EB",
    padding: 18,
    borderRadius: 15,
    marginTop: 25,
  },

  buttonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 22,
    fontWeight: "bold",
  },

});