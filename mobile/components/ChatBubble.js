import React from "react";
import { View, Text, StyleSheet } from "react-native";
import VoicePlayer from "./VoicePlayer";

export default function ChatBubble({ message }) {
  const isMe = message.sender === "You";

  return (
    <View
      style={[
        styles.container,
        isMe ? styles.rightContainer : styles.leftContainer,
      ]}
    >
      {!isMe && (
        <Text style={styles.sender}>
          {message.sender}
        </Text>
      )}

      <View
        style={[
          styles.bubble,
          isMe ? styles.myBubble : styles.otherBubble,
        ]}
      >
        {message.type === "text" ? (
          <Text
            style={[
              styles.message,
              isMe && { color: "#fff" },
            ]}
          >
            {message.text}
          </Text>
        ) : (
          <View>
            <Text
              style={[
                styles.voiceTitle,
                isMe && { color: "#fff" },
              ]}
            >
              🎤 Voice Message
            </Text>

            <VoicePlayer uri={message.uri} />
          </View>
        )}
      </View>

      <Text style={styles.time}>
        {message.time}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    paddingHorizontal: 12,
  },

  leftContainer: {
    alignItems: "flex-start",
  },

  rightContainer: {
    alignItems: "flex-end",
  },

  sender: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 4,
    marginLeft: 5,
  },

  bubble: {
    borderRadius: 18,
    padding: 15,
    maxWidth: "80%",
  },

  myBubble: {
    backgroundColor: "#2563EB",
  },

  otherBubble: {
    backgroundColor: "#E5E7EB",
  },

  message: {
    fontSize: 18,
    color: "#111",
  },

  voiceTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },

  time: {
    marginTop: 4,
    fontSize: 12,
    color: "#888",
  },
});