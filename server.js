const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { getUploadUrl, getPlaybackUrl } = require("./s3");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.json());
app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.send("CareBridge server is running!");
});

app.post("/messages", (req, res) => {
    const { sender, text } = req.body;
    console.log("New message received from:", sender);
    res.json({
        id: 1,
        sender: sender,
        text: text,
        createdAt: new Date(),
    });
});

app.post("/voice/upload-url", async (req, res) => {
    const { seniorId } = req.body;
    const { url, key } = await getUploadUrl(seniorId);
    res.json({ uploadUrl: url, key: key });
});

app.get("/voice/playback-url", async (req, res) => {
    const { key } = req.query;
    const url = await getPlaybackUrl(key);
    res.json({ playbackUrl: url });
});

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join_room", (room) => {
        socket.join(room);
        console.log("User joined room:", room);
    });

    socket.on("send_message", (data) => {
        console.log("Message received:", data);
        io.to(data.room).emit("receive_message", data);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

httpServer.listen(3000, () => {
    console.log("CareBridge server started on http://localhost:3000");
});