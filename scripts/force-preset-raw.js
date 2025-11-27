require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function forceUpdate() {
    try {
        console.log("Attempting to delete and recreate...");
        try {
            await cloudinary.api.delete_upload_preset('aula_virtual_assignments');
        } catch (e) {
            console.log("Delete failed (maybe didn't exist), continuing...");
        }

        const createResult = await cloudinary.api.create_upload_preset({
            name: 'aula_virtual_assignments',
            unsigned: true,
            folder: 'aula_virtual_assignments',
            resource_type: "raw", // Top level
            use_filename: true,
            unique_filename: false
        });
        console.log("Recreation Result:", JSON.stringify(createResult, null, 2));
    } catch (error) {
        console.error("Operation failed:", error);
    }
}

forceUpdate();
