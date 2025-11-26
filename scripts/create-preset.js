const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: 'dzfirlb1z',
    api_key: '837772675295316',
    api_secret: 'qW-S-I23zjoDNVxjNChYCDKN2x0'
});

async function createPreset() {
    try {
        console.log("Creating upload preset 'aula_virtual_preset'...");

        const result = await cloudinary.api.create_upload_preset({
            name: 'aula_virtual_preset',
            unsigned: true,
            folder: 'aula_virtual_profiles',
            transformation: [
                { quality: 'auto', fetch_format: 'auto' }, // Auto compression and format
                { width: 500, height: 500, crop: 'limit' } // Limit max size
            ]
        });

        console.log("Success! Preset created:");
        console.log(result);
    } catch (error) {
        if (error.error && error.error.message && error.error.message.includes("already exists")) {
            console.log("Preset already exists. Updating...");
            try {
                const updateResult = await cloudinary.api.update_upload_preset('aula_virtual_preset', {
                    unsigned: true,
                    folder: 'aula_virtual_profiles',
                    transformation: [
                        { quality: 'auto', fetch_format: 'auto' },
                        { width: 500, height: 500, crop: 'limit' }
                    ]
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

createPreset();
