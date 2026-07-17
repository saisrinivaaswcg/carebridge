import React, { useState } from "react";
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function LanguageScreen({ navigation }) {
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  const languages = [
    "English",
    "English (Singlish)",
    "中文 (Mandarin)",
    "Bahasa Melayu",
    "தமிழ் (Tamil)",
  ];

  return (
    <SafeAreaView style={styles.container}>

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        accessibilityHint="Returns to the previous screen"
      >
        <Text style={styles.backButton}>
          ← Back
        </Text>
      </TouchableOpacity>

      <Text style={styles.title}>
        🌍 Choose Your Preferred Language
      </Text>

      <Text style={styles.subtitle}>
        Select the language you are most comfortable reading and speaking.
      </Text>

      {languages.map((language) => (
        <TouchableOpacity
          key={language}
          style={[
            styles.languageCard,
            selectedLanguage === language &&
              styles.selectedCard,
          ]}
          onPress={() => setSelectedLanguage(language)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Select ${language}`}
          accessibilityHint="Changes the app language"
        >
          <Text
            style={[
              styles.languageText,
              selectedLanguage === language &&
                styles.selectedText,
            ]}
          >
            {selectedLanguage === language ? "✓ " : ""}
            {language}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.saveButton}
        onPress={() => navigation.goBack()}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Save language"
        accessibilityHint="Save your selected language and return to the previous screen"
      >
        <Text style={styles.saveButtonText}>
          Save Language
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

  backButton: {
    fontSize: 22,
    color: "#2563EB",
    fontWeight: "bold",
    marginBottom: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#2563EB",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 18,
    color: "#6B7280",
    marginBottom: 30,
    lineHeight: 26,
  },

  languageCard: {
    backgroundColor: "#F3F4F6",
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
  },

  selectedCard: {
    backgroundColor: "#2563EB",
  },

  languageText: {
    fontSize: 22,
    color: "#111827",
  },

  selectedText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  saveButton: {
    backgroundColor: "#2563EB",
    padding: 18,
    borderRadius: 15,
    marginTop: 30,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },

});