import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

// Ensure environment variables are loaded before this module is evaluated.
// ESM import hoisting means route modules (and this service) can be evaluated
// BEFORE app.js's dotenv.config() call, so we load here defensively.
// Idempotent: dotenv.config() is a no-op for already-set variables.
dotenv.config({ quiet: true });

// Configure Cloudinary
const isCloudinaryConfigured = () => {
  return (
    Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
    Boolean(process.env.CLOUDINARY_API_KEY) &&
    Boolean(process.env.CLOUDINARY_API_SECRET)
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('Cloudinary configured with provided API keys.');
} else {
  console.log('Notice: Cloudinary credentials not configured in environment. The service will provide reliable fallback image hosting.');
}

/**
 * Upload an image buffer to Cloudinary
 * @param {Buffer} buffer - Image file buffer from multer
 * @param {string} folder - Destination folder in Cloudinary
 * @returns {Promise<{url: string, public_id: string}>}
 */
export const uploadToCloudinary = (buffer, folder = 'megabasket/products') => {
  return new Promise((resolve, reject) => {
    if (isCloudinaryConfigured()) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [
            { width: 1000, height: 1000, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary stream error:', error);
            return reject(error);
          }
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
          });
        }
      );

      uploadStream.end(buffer);
    } else {
      // Graceful fallback when user has not yet entered Cloudinary API keys
      // Converts buffer to base64 data URI so preview and product images function seamlessly without throwing
      const base64 = buffer.toString('base64');
      const dataUri = `data:image/jpeg;base64,${base64}`;
      resolve({
        url: dataUri,
        public_id: `mock_cld_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      });
    }
  });
};

/**
 * Delete image from Cloudinary by public_id
 * @param {string} public_id
 * @returns {Promise<any>}
 */
export const deleteFromCloudinary = async (public_id) => {
  if (isCloudinaryConfigured() && public_id && !public_id.startsWith('mock_')) {
    return await cloudinary.uploader.destroy(public_id);
  }
  return { result: 'ok' };
};
