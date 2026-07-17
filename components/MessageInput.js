import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";

export default function MessageInput({
  onSend,
  onRecordPress,
}) {
  const [message, setMessage] = useState("");

  function handleSend() {
    if (message.trim() === "") return;

    onSend(message);
    setMessage("");
  }

  return (
    <View style={styles.container}>

      <TextInput
        style={styles.input}
        placeholder="Type a message..."
        placeholderTextColor="#888"
        value={message}
        onChangeText={setMessage}
      />

      <TouchableOpacity
        style={styles.micButton}
        onPress={onRecordPress}
      >
        <Text style={styles.icon}>🎤</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.sendButton}
        onPress={handleSend}
      >
        <Text style={styles.sendIcon}>➤</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
  },

  input: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 18,
    marginRight: 10,
  },

  micButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },

  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },

  icon: {
    fontSize: 24,
  },

  sendIcon: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },

});