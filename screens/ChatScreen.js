import React, { useState, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import ChatBubble from "../components/ChatBubble";
import MessageInput from "../components/MessageInput";
import VoiceRecorder from "../components/VoiceRecorder";

export default function ChatScreen({ navigation }) {
  const flatListRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: "1",
      sender: "Sarah",
      type: "text",
      text: "Good morning Mum ❤️",
      time: "9:00 AM",
    },
    {
      id: "2",
      sender: "You",
      type: "text",
      text: "Good morning! I'm feeling well today 😊",
      time: "9:02 AM",
    },
  ]);

  function currentTime() {
    return new Date().toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function sendMessage(text) {
    const newMessage = {
      id: Date.now().toString(),
      sender: "You",
      type: "text",
      text,
      time: currentTime(),
    };

    setMessages((prev) => [...prev, newMessage]);
  }

  function addVoiceMessage(uri) {
    const newMessage = {
      id: Date.now().toString(),
      sender: "You",
      type: "voice",
      uri,
      time: currentTime(),
    };

    setMessages((prev) => [...prev, newMessage]);
  }

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityHint="Returns to the Home screen"
        >
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          👨‍👩‍👧 Family Chat
        </Text>

        <Text style={styles.headerSubtitle}>
          Stay connected with your loved ones through messages and voice notes.
        </Text>

      </View>

      {messages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>
            No messages yet
          </Text>

          <Text style={styles.emptySubtitle}>
            Start a conversation with your family by sending a message or a voice note.
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatBubble message={item} />
          )}
          contentContainerStyle={{
            paddingVertical: 15,
            paddingBottom: 20,
          }}
          accessibilityLabel="Family chat messages"
          accessibilityHint="Displays your conversation with family members"
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({
              animated: true,
            })
          }
          onLayout={() =>
            flatListRef.current?.scrollToEnd({
              animated: false,
            })
          }
        />
      )}

      <VoiceRecorder
        onRecordingFinished={addVoiceMessage}
      />

      <MessageInput
        onSend={sendMessage}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  header: {
    backgroundColor: "#2563EB",
    padding: 18,
  },

  back: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
  },

  headerSubtitle: {
    color: "#E5E7EB",
    fontSize: 17,
    marginTop: 8,
    lineHeight: 24,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  emptyTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2563EB",
    marginBottom: 10,
    textAlign: "center",
  },

  emptySubtitle: {
    fontSize: 18,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 28,
  },

});