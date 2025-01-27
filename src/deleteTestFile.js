import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

// Configure AWS S3 Client
const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION,
});

const deleteTestFile = async () => {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  const key = "ProfilePictures/test-image.jpg"; // Replace with the key of the file you want to delete

  if (!bucketName) {
    console.error("Bucket name is missing. Ensure AWS_S3_BUCKET_NAME is set in your .env file.");
    return;
  }

  try {
    console.log("Attempting to delete file:", key);
    const deleteParams = {
      Bucket: bucketName,
      Key: key,
    };

    const command = new DeleteObjectCommand(deleteParams);
    await s3.send(command);
    console.log("File deleted successfully.");
  } catch (err) {
    console.error("Error deleting file from S3:", err.message);
  }
};

deleteTestFile();
