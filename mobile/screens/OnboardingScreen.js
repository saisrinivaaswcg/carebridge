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
        "Stay connected with your loved ones through simple text messages and voice notes.",
    },
    {
      emoji: "🎤",
      title: "Voice Notes",
      description:
        "Send and receive voice messages easily with one tap.",
    },
    {
      emoji: "🔔",
      title: "Daily Check-ins",
      description:
        "Receive gentle reminders to check in with your family every day.",
    },
  ];

  const [page, setPage] = useState(0);

  const nextPage = () => {
    if (page < pages.length - 1) {
      setPage(page + 1);
    } else {
      navigation.navigate("Home");
    }
  };

  return (
    <View style={styles.container}>

      <Text style={styles.emoji}>
        {pages[page].emoji}
      </Text>

      <Text style={styles.title}>
        {pages[page].title}
      </Text>

      <Text style={styles.description}>
        {pages[page].description}
      </Text>

      <View style={styles.dots}>
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
      >
        <Text style={styles.buttonText}>
          {page === pages.length - 1 ? "Get Started" : "Next"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("Home")}
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
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },

  emoji: {
    fontSize: 80,
    marginBottom: 20,
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
    color: "#555",
    lineHeight: 30,
    marginBottom: 40,
  },

  dots: {
    flexDirection: "row",
    marginBottom: 40,
  },

  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 5,
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
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },

  skip: {
    fontSize: 18,
    color: "#2563EB",
    fontWeight: "bold",
  },

});