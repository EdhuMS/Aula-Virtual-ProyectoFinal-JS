// Utilidad para forzar la descarga de activos de Cloudinary
export function getDownloadUrl(url: string) {
    if (!url) return url;
    // Si es una URL de Cloudinary
    if (url.includes("cloudinary.com")) {
        // Si ya tiene fl_attachment, devolverla
        if (url.includes("fl_attachment")) return url;

        // Insertar fl_attachment después de /upload/
        // Esto funciona para ambos /image/upload/ y /raw/upload/
        return url.replace("/upload/", "/upload/fl_attachment/");
    }
    return url;
}
