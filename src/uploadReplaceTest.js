import 'dotenv/config'; // Load environment variables
import express from 'express';
import multer from 'multer';
import { S3Client, DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Multer setup for handling file uploads
const upload = multer({ storage: multer.memoryStorage() });

const app = express();

// Function to delete an object from S3
async function deleteImageFromS3(key) {
  const deleteParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
  };

  try {
    await s3Client.send(new DeleteObjectCommand(deleteParams));
    console.log(`Successfully deleted ${key} from S3`);
  } catch (error) {
    console.error(`Error deleting ${key} from S3:`, error);
    throw error;
  }
}

// Function to upload an object to S3
async function uploadImageToS3(key, fileBuffer, contentType) {
  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
  };

  try {
    await s3Client.send(new PutObjectCommand(uploadParams));
    console.log(`Successfully uploaded ${key} to S3`);
    return `${process.env.IMAGE_BASE_URL}/${key}`;
  } catch (error) {
    console.error(`Error uploading ${key} to S3:`, error);
    throw error;
  }
}

// Function to update the database with the new image URL
async function updateDatabaseWithNewImageUrl(imageId, newImageUrl) {
  // Replace this with your actual database update logic
  console.log(`Updating database entry ${imageId} with new image URL: ${newImageUrl}`);
  // Example: await db.collection('images').updateOne({ _id: imageId }, { $set: { imageUrl: newImageUrl } });
}

// Express route to handle image replacement
app.post('/replace-image/:imageId', upload.single('newImage'), async (req, res) => {
  const { imageId } = req.params;
  const oldImageUrl = req.body.oldImageUrl; // Assume oldImageUrl is passed in the request body
  const newImageFile = req.file;

  if (!oldImageUrl || !newImageFile) {
    return res.status(400).json({ error: 'Old image URL and new image file are required' });
  }

  const oldImageKey = oldImageUrl.split('/').pop(); // Extract the key from the old image URL
  const newImageKey = `${uuidv4()}-${newImageFile.originalname}`; // Generate a unique key for the new image

  try {
    // Step 1: Delete the old image from S3
    await deleteImageFromS3(oldImageKey);

    // Step 2: Upload the new image to S3
    const newImageUrl = await uploadImageToS3(newImageKey, newImageFile.buffer, newImageFile.mimetype);

    // Step 3: Update the database with the new image URL
    await updateDatabaseWithNewImageUrl(imageId, newImageUrl);

    res.status(200).json({ message: 'Image replaced successfully', newImageUrl });
  } catch (error) {
    console.error('Error replacing image:', error);
    res.status(500).json({ error: 'Failed to replace image' });
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});