/**
 * Normalizes image and file URLs to include the correct base path.
 * If a URL starts with /uploads/, it prepends /web to match the basePath configuration.
 * @param {string} url - The URL to normalize.
 * @returns {string} - The normalized URL.
 */
export function normalizePath(url) {
    if (!url) return "";

    const trimmedUrl = url.trim();

    // If it's already an absolute URL (http/https), return as is
    if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://") || trimmedUrl.startsWith("data:")) {
        return trimmedUrl;
    }

    // Logic to ensure we don't double-prefix or miss the /web/uploads/ path
    let path = trimmedUrl;

    // If it already starts with /web/, assume it's fully qualified
    if (path.startsWith("/web/")) {
        return path;
    }

    // List of common media extensions
    const commonExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.pdf', '.doc', '.docx', '.xls', '.xlsx'];
    const hasMediaExtension = commonExtensions.some(ext => path.toLowerCase().endsWith(ext));

    if (hasMediaExtension) {
        // If it starts with /uploads/
        if (path.startsWith("/uploads/")) {
            return `/web${path}`;
        }
        // If it starts with uploads/ (no leading slash)
        if (path.startsWith("uploads/")) {
            return `/web/${path}`;
        }
        // If it's just a raw filename
        if (!path.includes("/")) {
            return `/web/uploads/${path}`;
        }
    }

    // Generic fallback: if it starts with / but not /web/, prepend /web
    if (path.startsWith("/") && !path.startsWith("/web/")) {
        return `/web${path}`;
    }

    return path;
}

/**
 * Normalizes all src and href attributes in an HTML string.
 * This is useful for content coming from a Rich Text Editor (like Quill).
 * @param {string} html - The HTML string to normalize.
 * @returns {string} - The normalized HTML string.
 */
export function normalizeHTML(html) {
    if (!html) return "";

    // Replace src="filename.jpg" or src="/uploads/filename.jpg"
    // with src="/web/uploads/filename.jpg"
    let normalized = html;

    // 1. Fix src attributes
    normalized = normalized.replace(/src="([^"]+)"/g, (match, url) => {
        return `src="${normalizePath(url)}"`;
    });

    // 2. Fix href attributes (for attachments in content)
    normalized = normalized.replace(/href="([^"]+)"/g, (match, url) => {
        // Only normalize internal paths, avoid normaling absolute external links again if they are fine
        if (!url.startsWith('http') && !url.startsWith('mailto:') && !url.startsWith('tel:')) {
            return `href="${normalizePath(url)}"`;
        }
        return match;
    });

    return normalized;
}
