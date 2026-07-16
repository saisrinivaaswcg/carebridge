import React, { useState } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from "react-native";
import { Audio } from "expo-av";

export default function VoiceRecorder({ onRecordingFinished }) {
  const [recording, setRecording] = useState(null);

  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow microphone access."
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } =
        await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );

      setRecording(recording);

    } catch (error) {
      console.log(error);
      Alert.alert(
        "Error",
        "Unable to start recording."
      );
    }
  }

  async function stopRecording() {
    try {
      if (!recording) return;

      await recording.stopAndUnloadAsync();

      const uri = recording.getURI();

      if (onRecordingFinished && uri) {
        onRecordingFinished(uri);
      }

      setRecording(null);

    } catch (error) {
      console.log(error);
      Alert.alert(
        "Error",
        "Unable to stop recording."
      );
    }
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        recording && styles.recordingButton,
      ]}
      onPress={
        recording
          ? stopRecording
          : startRecording
      }
    >
      <Text style={styles.text}>
        {recording
          ? "⏹ Stop Recording"
          : "🎤 Record Voice"}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#2563EB",
    marginHorizontal: 15,
    marginVertical: 10,
    padding: 16,
    borderRadius: 15,
    alignItems: "center",
  },

  recordingButton: {
    backgroundColor: "#DC2626",
  },

  text: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
});