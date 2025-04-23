export default function getFileTypeFromUrl(url: string): string | null {

    const fileExtensionMatch = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
    
    if (!fileExtensionMatch || fileExtensionMatch.length < 2) {
        return null; 
    }
  
    const fileExtension = fileExtensionMatch[1].toLowerCase();
  
    const videoExtensions = ["mp4", "webm", "ogg", "mov", "avi", "mkv", "flv", "wmv", "3gp", "m4v", "mpg", "mpeg"];
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg", "tiff"];
  
    if (videoExtensions.includes(fileExtension)) {
        return "video";
    } else if (imageExtensions.includes(fileExtension)) {
        return "image";
    } else {
        return null; 
    }
  }