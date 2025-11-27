require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function checkPreset() {
    try {
        const result = await cloudinary.api.upload_preset('aula_virtual_assignments');
        console.log("Resource Type:", result.settings.resource_type);
        console.log("Folder:", result.settings.folder);
        console.log("Unsigned:", result.unsigned);
    } catch (error) {
        console.error("Failed to fetch preset:", error);
    }
}

checkPreset();
