import fs from 'fs';

let cloudinary = null;
let isCloudinaryConfigured = false;

/**
 * Dynamically initialize Cloudinary to prevent startup crashes if package is missing
 */
const initCloudinary = async () => {
  try {
    const cloudinaryModule = await import('cloudinary');
    cloudinary = cloudinaryModule.v2 || cloudinaryModule.default?.v2;
    
    isCloudinaryConfigured = !!(
      process.env.CLOUDINARY_CLOUD_NAME && 
      process.env.CLOUDINARY_API_KEY && 
      process.env.CLOUDINARY_API_SECRET && 
      cloudinary
    );

    if (isCloudinaryConfigured && cloudinary) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
      });
      console.log("Cloudinary service initialized successfully.");
    } else {
      console.warn("Cloudinary environment variables missing. Falling back to local storage uploads.");
    }
  } catch (err) {
    console.warn("Cloudinary package not installed. Falling back to local storage uploads.");
  }
};

// Run initialization
initCloudinary();

/**
 * Uploads a local file to Cloudinary or falls back to local static serving paths.
 * @param {string} filePath - Path to local file.
 * @param {string} folder - Destination folder on Cloudinary.
 * @returns {Promise<string>} - Returns the Cloudinary URL or local static URL.
 */
export const uploadToCloudinary = async (filePath, folder = 'seller_docs') => {
  try {
    if (!cloudinary) {
      await initCloudinary();
    }

    if (isCloudinaryConfigured && cloudinary) {
      const result = await cloudinary.uploader.upload(filePath, {
        folder,
        resource_type: 'auto'
      });
      
      // Delete temp local file since it's uploaded to Cloudinary
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Failed to clean up local temp file after upload:', err.message);
      }
      
      return result.secure_url;
    } else {
      // Local fallback: format the path relative to uploads directory
      const fileName = filePath.split(/[\\/]/).pop();
      return `/uploads/${fileName}`;
    }
  } catch (error) {
    console.error('Cloudinary upload operation failed. Falling back to local path.', error.message);
    const fileName = filePath.split(/[\\/]/).pop();
    return `/uploads/${fileName}`;
  }
};
