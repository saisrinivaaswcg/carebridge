const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { randomUUID } = require("crypto");
require("dotenv").config();

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const BUCKET = process.env.S3_BUCKET_NAME;

async function getUploadUrl(seniorId) {
    const key = `voice-notes/${seniorId}/${randomUUID()}.ogg`;
    const url = await getSignedUrl(s3, new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        ContentType: "audio/ogg",
    }), { expiresIn: 300 });
    return { url, key };
}

async function getPlaybackUrl(key) {
    const url = await getSignedUrl(s3, new GetObjectCommand({
        Bucket: BUCKET,
        Key: key,
    }), { expiresIn: 300 });
    return url;
}

module.exports = { getUploadUrl, getPlaybackUrl };