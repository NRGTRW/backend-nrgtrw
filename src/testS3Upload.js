import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure AWS S3 Client
const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION,
});

const testUpload = async () => {
  const filePath = path.join(__dirname, "test-image.jpg"); // Path to your test image
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }

  const fileContent = fs.readFileSync(filePath);

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `ProfilePictures/test-image.jpg`, // Path in the S3 bucket
    Body: fileContent,
    ContentType: "image/jpeg",
  };

  try {
    console.log("Uploading file to S3...");
    const command = new PutObjectCommand(params);
    const data = await s3.send(command);
    console.log("File uploaded successfully:", data);
  } catch (error) {
    console.error("Error uploading to S3:", error.message);
  }
};

testUpload();
