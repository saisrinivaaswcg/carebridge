const SERVER_URL = "http://192.168.1.103:3000";

export async function uploadVoiceNote(localUri, seniorId) {
  try {
    // Step 1 - get presigned upload URL from your server
    const urlResponse = await fetch(`${SERVER_URL}/voice/upload-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seniorId }),
    });
    const { uploadUrl, key } = await urlResponse.json();
    console.log("Got upload URL, key:", key);

    // Step 2 - upload audio file directly to S3
    const fileResponse = await fetch(localUri);
    const blob = await fileResponse.blob();

    await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": "audio/m4a" },
      body: blob,
    });
    console.log("Uploaded to S3 successfully");

    // Step 3 - tell your server the upload is complete
    const completeResponse = await fetch(`${SERVER_URL}/voice/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        seniorId,
        key,
        durationSec: 30,
      }),
    });
    const saved = await completeResponse.json();
    console.log("Voice note registered:", saved);

    return { success: true, key };
  } catch (error) {
    console.error("Voice upload failed:", error);
    return { success: false, error };
  }
}
