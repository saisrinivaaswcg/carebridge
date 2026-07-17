import { io } from "socket.io-client";

// Change this to your teammate's Socket.io server IP
const SOCKET_URL = "http://192.168.1.100:3000";

const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket"],
});

// Connect to Socket.io
export function connectSocket() {
  if (!socket.connected) {
    socket.connect();
  }
}

// Disconnect
export function disconnectSocket() {
  if (socket.connected) {
    socket.disconnect();
  }
}

// Join a family/group room
export function joinRoom(roomId) {
  socket.emit("join_room", roomId);
}

// Send a text message
export function sendMessage(message) {
  socket.emit("send_message", message);
}

// Listen for incoming messages
export function onReceiveMessage(callback) {
  socket.on("receive_message", callback);
}

// Stop listening for incoming messages
export function removeReceiveMessageListener() {
  socket.off("receive_message");
}

// Listen for ML alerts
export function onMLAlert(callback) {
  socket.on("ml_alert", callback);
}

// Stop listening for ML alerts
export function removeMLAlertListener() {
  socket.off("ml_alert");
}

export default socket;