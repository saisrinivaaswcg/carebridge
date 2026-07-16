import React, { useState } from "react";
import {
  SafeAreaView,
  View,
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

      <Text style={styles.title}>🌍 Select Language</Text>

      {languages.map((language) => (
        <TouchableOpacity
          key={language}
          style={[
            styles.languageCard,
            selectedLanguage === language && styles.selectedCard,
          ]}
          onPress={() => setSelectedLanguage(language)}
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

  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2563EB",
    marginBottom: 30,
  },

  languageCard: {
    backgroundColor: "#F3F4F6",
    padding: 18,
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