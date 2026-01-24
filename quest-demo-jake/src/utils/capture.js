/**
 * Screen capture utilities
 * Captures the WebXR canvas as an image
 */

/**
 * Capture the WebGL canvas and return as blob URL
 * @param {HTMLCanvasElement} canvas - The Three.js/WebXR canvas element
 * @returns {Promise<{blobUrl: string, blob: Blob}>}
 */
export async function captureScreen(canvas = null) {
    try {
        // Find canvas if not provided
        if (!canvas) {
            canvas = document.querySelector('canvas');
        }

        if (!canvas) {
            console.warn('No canvas found for capture');
            return { blobUrl: null, blob: null };
        }

        // Convert canvas to blob
        const blob = await new Promise((resolve, reject) => {
            canvas.toBlob(
                (b) => {
                    if (b) resolve(b);
                    else reject(new Error('Canvas toBlob failed'));
                },
                'image/jpeg',
                0.8 // Quality
            );
        });

        // Create object URL for display
        const blobUrl = URL.createObjectURL(blob);

        console.log(`Screen captured: ${(blob.size / 1024).toFixed(1)}KB`);

        return { blobUrl, blob };
    } catch (error) {
        console.error('Screen capture failed:', error);
        return { blobUrl: null, blob: null, error };
    }
}

/**
 * Revoke blob URLs to free memory
 * @param {string[]} urls - Array of blob URLs to revoke
 */
export function cleanupBlobUrls(urls) {
    urls.forEach(url => {
        if (url && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
        }
    });
}

/**
 * Create a placeholder image with random gradient
 * Useful for demo mode when no actual capture is available
 */
export function createPlaceholderImage(text = '미리보기') {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;

    const ctx = canvas.getContext('2d');

    // Random gradient colors
    const gradients = [
        ['#667eea', '#764ba2'],  // Purple
        ['#f093fb', '#f5576c'],  // Pink
        ['#4facfe', '#00f2fe'],  // Blue
        ['#43e97b', '#38f9d7'],  // Green
        ['#fa709a', '#fee140'],  // Orange-Pink
        ['#a8edea', '#fed6e3'],  // Soft
    ];

    const [color1, color2] = gradients[Math.floor(Math.random() * gradients.length)];

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 640, 480);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 640, 480);

    // Random icons
    const icons = ['🏠', '🌳', '☕', '📱', '💬', '🎵', '📺', '🍽️', '🚶', '💭'];
    const icon = icons[Math.floor(Math.random() * icons.length)];

    // Draw icon
    ctx.font = '80px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, 320, 200);

    // Text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(text, 320, 320);

    // Time
    ctx.font = '20px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText(new Date().toLocaleTimeString('ko-KR'), 320, 360);

    return canvas.toDataURL('image/jpeg', 0.9);
}
