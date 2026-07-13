import React, { useState } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import { Audio } from "expo-av";

export default function VoicePlayer({ uri }) {
  const [sound, setSound] = useState(null);
  const [playing, setPlaying] = useState(false);

  async function playSound() {
    try {
      if (playing) {
        await sound.stopAsync();
        setPlaying(false);
        return;
      }

      const { sound: playback } =
        await Audio.Sound.createAsync({
          uri,
        });

      setSound(playback);
      setPlaying(true);

      await playback.playAsync();

      playback.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setPlaying(false);
        }
      });
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={playSound}
    >
      <Text style={styles.text}>
        {playing ? "⏹ Stop" : "▶ Play Voice"}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 8,
    backgroundColor: "#2563EB",
    padding: 10,
    borderRadius: 10,
    alignSelf: "flex-start",
  },

  text: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});