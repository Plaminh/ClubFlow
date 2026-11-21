import cloudinary, { validateCloudinaryConfig } from '../config/cloudinary.js';

export const cloudinaryService = {
  /**
   * Uploads a file buffer to Cloudinary
   * @param {Buffer} buffer - The file buffer to upload
   * @param {string} [folder] - Optional folder in Cloudinary
   * @returns {Promise<{ secure_url: string, public_id: string, resource_type: string }>} Upload result containing relevant metadata
   */
  async uploadBuffer(buffer, folder = 'uploads') {
    validateCloudinaryConfig();
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'auto' },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            resource_type: result.resource_type,
          });
        },
      );

      uploadStream.end(buffer);
    });
  },

  /**
   * Deletes an asset from Cloudinary
   * @param {string} publicId - The public ID of the asset to delete
   * @param {string} [resourceType='image'] - The resource type of the asset
   * @returns {Promise<any>} Deletion result
   */
  async deleteAsset(publicId, resourceType = 'image') {
    validateCloudinaryConfig();
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, { resource_type: resourceType }, (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      });
    });
  },
};
