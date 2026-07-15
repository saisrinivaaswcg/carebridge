import { io } from "socket.io-client";

const SERVER_URL = "http://192.168.1.103:3000";

let socket = null;

export function connectSocket() {
  if (!socket) {
    socket = io(SERVER_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });
    socket.on("connect", () => {
      console.log("Connected to CareBridge:", socket.id);
    });
    socket.on("disconnect", () => {
      console.log("Disconnected from CareBridge");
    });
    socket.on("connect_error", (err) => {
      console.log("Connection error:", err.message);
    });
  }
  return socket;
}

export function joinRoom(seniorId) {
  if (socket) {
    socket.emit("join_room", seniorId);
  }
}

export function sendMessage(seniorId, senderId, text) {
  if (socket) {
    socket.emit("send_message", {
      room: seniorId,
      sender: senderId,
      text: text,
    });
  }
}

export function onReceiveMessage(callback) {
  if (socket) {
    socket.on("receive_message", callback);
  }
}

export function offReceiveMessage() {
  if (socket) {
    socket.off("receive_message");
  }
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
