require("dotenv").config();
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { getUploadUrl, getPlaybackUrl } = require("./s3");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const KAVI_API_URL = process.env.KAVI_API_URL;
const SERVICE_API_KEY = process.env.SERVICE_API_KEY;

app.use(express.json());
app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.send("CareBridge server is running!");
});

// save message to Person 3's database
async function saveMessageToKavi(seniorId, direction, text) {
    try {
        const response = await fetch(`${KAVI_API_URL}/api/v1/seniors/${seniorId}/messages`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Service-Key": SERVICE_API_KEY,
            },
            body: JSON.stringify({
                direction: direction,
                channel: "app_text",
                content_text: text,
                sent_at: new Date().toISOString(),
            }),
        });
        const data = await response.json();
        console.log("Message saved to Kavi's DB:", data);
        return data;
    } catch (error) {
        console.error("Failed to save message to Kavi's DB:", error);
    }
}

// register voice note with Person 3 after S3 upload
async function saveVoiceNoteToKavi(seniorId, s3Key, durationSec) {
    try {
        const response = await fetch(`${KAVI_API_URL}/api/v1/seniors/${seniorId}/voice-notes`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Service-Key": SERVICE_API_KEY,
            },
            body: JSON.stringify({
                s3_key: s3Key,
                s3_bucket: process.env.S3_BUCKET_NAME,
                duration_seconds: durationSec,
                recorded_at: new Date().toISOString(),
            }),
        });
        const data = await response.json();
        console.log("Voice note saved to Kavi's DB:", data);
        return data;
    } catch (error) {
        console.error("Failed to save voice note to Kavi's DB:", error);
    }
}

// send transcript to ML service for analysis
async function analyseWithML(seniorId, transcript) {
    try {
        const response = await fetch(`${process.env.ML_SERVICE_URL}/analyse_user`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: seniorId,
                transcript: transcript,
            }),
        });
        const result = await response.json();
        console.log("ML analysis result:", result);
        return result;
    } catch (error) {
        console.error("ML service call failed:", error);
        return null;
    }
}
// create alert in Person 3's database
async function createAlert(seniorId, alertType, severity, description) {
    try {
        const response = await fetch(`${KAVI_API_URL}/api/v1/alerts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Service-Key": process.env.ML_SERVICE_KEY,
            },
            body: JSON.stringify({
                senior_id: seniorId,
                alert_type: alertType,
                severity: severity,
                description: description,
                source: "ml_service",
                detected_at: new Date().toISOString(),
            }),
        });
        const data = await response.json();
        console.log("Alert created:", data);
        return data;
    } catch (error) {
        console.error("Failed to create alert:", error);
    }
}
app.post("/messages", async (req, res) => {
    const { seniorId, direction, text } = req.body;
    console.log("New message from senior:", seniorId);
    const saved = await saveMessageToKavi(seniorId, direction, text);
    res.json(saved);
});

app.get("/messages", async (req, res) => {
    const { seniorId } = req.query;
    try {
        const response = await fetch(
            `${KAVI_API_URL}/api/v1/seniors/${seniorId}/messages`,
            {
                headers: { "X-Service-Key": SERVICE_API_KEY },
            }
        );
        const data = await response.json();
        res.json(data.data || []);
    } catch (error) {
        console.error("Failed to fetch messages:", error);
        res.json([]);
    }
});

app.post("/voice/upload-url", async (req, res) => {
    const { seniorId } = req.body;
    const { url, key } = await getUploadUrl(seniorId);
    res.json({ uploadUrl: url, key: key });
});

app.post("/voice/complete", async (req, res) => {
    const { seniorId, key, durationSec } = req.body;
    const saved = await saveVoiceNoteToKavi(seniorId, key, durationSec);
    res.json(saved);
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

    socket.on("send_message", async (data) => {
    console.log("Message received:", data);
    // save to Person 3's DB
    await saveMessageToKavi(data.room, "inbound", data.text);
    // broadcast to everyone in the room
    io.to(data.room).emit("receive_message", data);
    // analyse with ML in background
   analyseWithML(data.room, data.text).then(async (result) => {
    if (result && result.alert_tier && result.alert_tier !== "none" && result.alert_tier !== "low") {
        console.log("Alert triggered for senior:", data.room, "tier:", result.alert_tier);

        // save alert to PostgreSQL
        await createAlert(
            data.room,
            "sentiment_shift",
            result.alert_tier,
            `Communication pattern has shifted from personal baseline. Risk score: ${result.risk_score}. Confidence: ${result.confidence}.`
        );

        // push alert to connected family/caseworkers
        io.to(data.room).emit("alert", {
            seniorId: data.room,
            tier: result.alert_tier,
            riskScore: result.risk_score,
            confidence: result.confidence
        });
    }
});
});

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

httpServer.listen(3000, () => {
    console.log("CareBridge server started on http://localhost:3000");
});