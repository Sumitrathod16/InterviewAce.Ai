import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

let isCloudinaryConfigured = false;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  });
  isCloudinaryConfigured = true;
  console.log('Cloudinary Service Configured successfully.');
} else {
  console.warn('Cloudinary config is missing. Uploads will fallback to local server storage.');
}

/**
 * Upload a file buffer to Cloudinary or save it locally
 * @param {Buffer} fileBuffer 
 * @param {string} originalName 
 * @returns {Promise<string>} File URL
 */
export const uploadFile = async (fileBuffer, originalName) => {
  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw', // Support PDF, DOCX
          folder: 'interviewace_resumes',
          public_id: `${Date.now()}_${path.parse(originalName).name}`
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload stream error:', error.message);
            reject(error);
          } else {
            resolve(result.secure_url);
          }
        }
      );
      uploadStream.end(fileBuffer);
    });
  } else {
    // Local fallback
    try {
      const uploadsDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const fileName = `${Date.now()}_${originalName.replace(/\s+/g, '_')}`;
      const filePath = path.join(uploadsDir, fileName);
      
      fs.writeFileSync(filePath, fileBuffer);
      
      const port = process.env.PORT || 5000;
      const fileUrl = `http://localhost:${port}/uploads/${fileName}`;
      console.log(`Saved file locally: ${fileUrl}`);
      return fileUrl;
    } catch (err) {
      console.error('Local file write error:', err.message);
      throw err;
    }
  }
};
