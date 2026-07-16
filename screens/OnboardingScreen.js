import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function OnboardingScreen({ navigation }) {
  const pages = [
    {
      emoji: "❤️",
      title: "Welcome to CareBridge",
      description:
        "CareBridge helps you stay connected with your family through simple text messages and voice notes.",
    },
    {
      emoji: "🎤",
      title: "Easy Voice Notes",
      description:
        "Tap the microphone to record a voice message. Your family can listen anytime.",
    },
    {
      emoji: "🔔",
      title: "Daily Check-In",
      description:
        "Complete a quick daily check-in so your loved ones know how you're feeling.",
    },
  ];

  const [page, setPage] = useState(0);

  function nextPage() {
    if (page < pages.length - 1) {
      setPage(page + 1);
    } else {
      navigation.replace("Home");
    }
  }

  function skipOnboarding() {
    navigation.replace("Home");
  }

  return (
    <View style={styles.container}>

      <Text
        style={styles.emoji}
        accessible={true}
        accessibilityLabel={pages[page].title}
      >
        {pages[page].emoji}
      </Text>

      <Text style={styles.title}>
        {pages[page].title}
      </Text>

      <Text style={styles.description}>
        {pages[page].description}
      </Text>

      <View
        style={styles.dots}
        accessible={true}
        accessibilityLabel={`Step ${page + 1} of ${pages.length}`}
      >
        {pages.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              page === index && styles.activeDot,
            ]}
          />
        ))}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={nextPage}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={
          page === pages.length - 1
            ? "Get Started"
            : "Next"
        }
        accessibilityHint="Move to the next onboarding page"
      >
        <Text style={styles.buttonText}>
          {page === pages.length - 1
            ? "Get Started"
            : "Next"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={skipOnboarding}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Skip onboarding"
        accessibilityHint="Go directly to the Home screen"
      >
        <Text style={styles.skip}>
          Skip
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
    alignItems: "center",
    paddingHorizontal: 30,
  },

  emoji: {
    fontSize: 90,
    marginBottom: 25,
  },

  title: {
    fontSize: 34,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2563EB",
    marginBottom: 20,
  },

  description: {
    fontSize: 20,
    textAlign: "center",
    color: "#4B5563",
    lineHeight: 32,
    marginBottom: 45,
  },

  dots: {
    flexDirection: "row",
    marginBottom: 40,
  },

  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 6,
  },

  activeDot: {
    backgroundColor: "#2563EB",
  },

  button: {
    backgroundColor: "#2563EB",
    width: "100%",
    padding: 18,
    borderRadius: 15,
    marginBottom: 20,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },

  skip: {
    fontSize: 20,
    color: "#2563EB",
    fontWeight: "bold",
  },

});