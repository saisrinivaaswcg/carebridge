import React, { useState, useRef, useEffect } from "react";
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
import {
  connectSocket,
  joinRoom,
  sendMessage as socketSendMessage,
  onReceiveMessage,
  offReceiveMessage,
} from "../services/socket";
import { uploadVoiceNote } from "../services/voiceUpload";
import { getUser } from "../services/auth";
import { SERVER_URL } from "../config";
const SENIOR_ID = "fe1e3b58-2e1a-475c-b088-bcaa5291eeb6";


export default function ChatScreen({ navigation }) {
  const flatListRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [senderName, setSenderName] = useState("user");

  useEffect(() => {
    connectSocket();
    joinRoom(SENIOR_ID);

    // get real logged in user
    getUser().then((user) => {
      if (user) setSenderName(user.full_name || user.id);
    });

    // load message history from your server
    fetch(`${SERVER_URL}/messages?seniorId=${SENIOR_ID}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data)) {
          setMessages(data);
        }
      })
      .catch((err) => console.log("Failed to load messages:", err));

    // listen for incoming real-time messages
    onReceiveMessage((data) => {
      const incoming = {
        id: Date.now().toString(),
        sender: data.sender,
        type: "text",
        text: data.text,
        time: new Date().toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, incoming]);
    });

    return () => {
      offReceiveMessage();
    };
  }, []);

  function currentTime() {
    return new Date().toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function sendMessage(text) {
    const newMessage = {
      id: Date.now().toString(),
      sender: senderName,
      type: "text",
      text,
      time: currentTime(),
    };
    setMessages((prev) => [...prev, newMessage]);
    socketSendMessage(SENIOR_ID, senderName, text);
  }

  async function addVoiceMessage(uri) {
    const newMessage = {
      id: Date.now().toString(),
      sender: senderName,
      type: "voice",
      uri,
      time: currentTime(),
    };
    setMessages((prev) => [...prev, newMessage]);

    const result = await uploadVoiceNote(uri, SENIOR_ID);
    if (result.success) {
      console.log("Voice note uploaded to S3:", result.key);
    } else {
      console.log("Voice upload failed:", result.error);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>👨‍👩‍👧 Family Chat</Text>
        <Text style={styles.headerSubtitle}>CareBridge</Text>
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatBubble message={item} />}
        contentContainerStyle={{ paddingVertical: 15, paddingBottom: 20 }}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        onLayout={() =>
          flatListRef.current?.scrollToEnd({ animated: false })
        }
      />
      <VoiceRecorder onRecordingFinished={addVoiceMessage} />
      <MessageInput onSend={sendMessage} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { backgroundColor: "#2563EB", padding: 18 },
  back: { color: "#fff", fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  headerTitle: { color: "white", fontSize: 26, fontWeight: "bold" },
  headerSubtitle: { color: "#E5E7EB", marginTop: 3, fontSize: 16 },
});