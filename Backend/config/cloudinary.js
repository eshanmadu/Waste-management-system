const cloudinary = require('cloudinary').v2;

// Validate environment variables
const requiredEnvVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Log the environment variables (without sensitive data)
console.log('Cloudinary configuration:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? '***' : 'missing',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '***' : 'missing'
});

// Configure Cloudinary using environment variables
try {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true // Force HTTPS
  });
  
  // Test the configuration
  cloudinary.api.ping()
    .then(result => {
      console.log("Cloudinary connection test successful:", result);
    })
    .catch(error => {
      console.error("Cloudinary connection test failed:", error);
      throw new Error("Failed to connect to Cloudinary. Please check your credentials.");
    });
} catch (error) {
  console.error("Failed to configure Cloudinary:", error);
  throw new Error("Failed to configure Cloudinary. Please check your environment variables.");
}

// Add a method to handle file uploads
cloudinary.uploadFile = async (file) => {
  try {
    console.log("Uploading file to Cloudinary:", {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });

    const result = await cloudinary.uploader.upload(file.path, {
      folder: "waste-reports",
      resource_type: "auto"
    });

    console.log("File uploaded successfully:", {
      url: result.secure_url,
      public_id: result.public_id
    });

    return result;
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);
    throw error;
  }
};

module.exports = cloudinary; 