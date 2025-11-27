require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function revertToAutoPreset() {
    try {
        const presetName = 'aula_virtual_assignments_raw'; // We'll update this one to be auto, or create a new one.
        // Let's go back to the original name 'aula_virtual_assignments' to be clean, or just update the current one the app uses.
        // The app currently uses 'aula_virtual_assignments_raw'.
        // Let's update 'aula_virtual_assignments_raw' to be "auto".

        console.log(`Updating preset '${presetName}' to AUTO...`);

        // Delete first to be clean
        try {
            await cloudinary.api.delete_upload_preset(presetName);
        } catch (e) { }

        const result = await cloudinary.api.create_upload_preset({
            name: presetName,
            unsigned: true,
            folder: 'aula_virtual_assignments',
            resource_type: "auto", // Back to AUTO
            use_filename: true,
            unique_filename: false
        });

        console.log("Success! Preset reverted to AUTO:");
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("Failed to revert preset:", error);
    }
}

revertToAutoPreset();
