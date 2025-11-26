require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function createAssignmentPreset() {
    try {
        console.log("Creating upload preset 'aula_virtual_assignments'...");

        const result = await cloudinary.api.create_upload_preset({
            name: 'aula_virtual_assignments',
            unsigned: true,
            folder: 'aula_virtual_assignments',
            resource_type: "auto", // Allow all file types (raw, image, video, etc.)
            transformation: [] // No transformations for raw files usually
        });

        console.log("Success! Preset created:");
        console.log(result);
    } catch (error) {
        if (error.error && error.error.message && error.error.message.includes("already exists")) {
            console.log("Preset already exists. Updating...");
            try {
                const updateResult = await cloudinary.api.update_upload_preset('aula_virtual_assignments', {
                    unsigned: true,
                    folder: 'aula_virtual_assignments',
                    resource_type: "auto",
                    transformation: []
                });
                console.log("Success! Preset updated:");
                console.log(updateResult);
            } catch (updateError) {
                console.error("Failed to update preset:", updateError);
            }
        } else {
            console.error("Failed to create preset:", error);
        }
    }
}

createAssignmentPreset();
