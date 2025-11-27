// Utility to force download of Cloudinary assets
export function getDownloadUrl(url: string) {
    if (!url) return url;
    // If it's a cloudinary URL
    if (url.includes("cloudinary.com")) {
        // If it already has fl_attachment, return it
        if (url.includes("fl_attachment")) return url;

        // Insert fl_attachment after /upload/
        // This works for both /image/upload/ and /raw/upload/
        return url.replace("/upload/", "/upload/fl_attachment/");
    }
    return url;
}
