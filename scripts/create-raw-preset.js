require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function createRawPreset() {
    try {
        const presetName = 'aula_virtual_assignments_raw';
        console.log(`Creating new preset '${presetName}'...`);

        // Delete if exists to be sure
        try {
            await cloudinary.api.delete_upload_preset(presetName);
        } catch (e) {
            // Ignore
        }

        const result = await cloudinary.api.create_upload_preset({
            name: presetName,
            unsigned: true,
            folder: 'aula_virtual_assignments', // Keep same folder
            resource_type: "raw", // Explicitly RAW
            use_filename: true,
            unique_filename: false,
            disallow_public_id: true // Let Cloudinary generate random ID to avoid conflicts? No, we want use_filename.
            // Actually, let's stick to defaults for naming but force RAW
        });

        console.log("Success! New Preset Created:");
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("Failed to create preset:", error);
    }
}

createRawPreset();
