import { v2 as cloudinary } from "cloudinary";

const configureCloudinary = () => {
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    return true;
  }

  return false;
};

const fallbackImages = [
  "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1517846693594-1567da72af75?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1504215680853-026ed2a45def?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=1200&q=80"
];

const uploadBuffer = (file, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto"
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    stream.end(file.buffer);
  });

export const uploadFiles = async (files = [], folder = "ride-loop") => {
  if (!files.length) return [];

  const cloudinaryReady = configureCloudinary();

  if (!cloudinaryReady) {
    return files.map((file, index) => ({
      url: fallbackImages[index % fallbackImages.length],
      publicId: `local/${Date.now()}-${index}`,
      alt: file.originalname
    }));
  }

  const uploads = await Promise.all(files.map((file) => uploadBuffer(file, folder)));

  return uploads.map((result) => ({
    url: result.secure_url,
    publicId: result.public_id,
    alt: result.original_filename
  }));
};
