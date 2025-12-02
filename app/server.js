// ...existing code...
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Static folder
const STATIC_PATH = path.join(__dirname);

// MIME types
const MIME_TYPES = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".png": "image/png",
    ".jpg": "image/jpeg",
};

// Create HTTP server
const server = http.createServer((req, res) => {
    // strip querystring and decode URI
    const requestedUrl = decodeURI(req.url.split("?")[0]);

    // serve from app/web for frontend assets
    const webRoot = path.join(STATIC_PATH, 'web');

    // framework files served from project root ../framework
    const frameworkRoot = path.join(STATIC_PATH, '..', 'framework');

    // remove leading slashes
    const cleaned = requestedUrl.replace(/^\/+/, '');

    let filePath;
    if (requestedUrl === '/' || cleaned === '') {
        filePath = path.join(webRoot, 'index.html');
    } else if (requestedUrl.startsWith('/framework/') || cleaned.startsWith('framework/')) {
        // serve framework files
        const rel = cleaned.replace(/^framework\//, '');
        filePath = path.join(frameworkRoot, rel);
    } else if (requestedUrl.startsWith('/components/') || cleaned.startsWith('components/')) {
        // serve component files from app/components
        const rel = cleaned.replace(/^components\//, '');
            filePath = path.join(STATIC_PATH, 'components', rel);
    } else if (requestedUrl.startsWith('/tools/') || cleaned.startsWith('tools/')) {
        // serve static tools (images, sprites) from app/tools
        const rel = cleaned.replace(/^tools\//, '');
        filePath = path.join(STATIC_PATH, 'tools', rel);
    } else if (requestedUrl.startsWith('/web/') || cleaned.startsWith('web/')) {
        // serve files under /web/ from app/web
        const rel = cleaned.replace(/^web\//, '');
        filePath = path.join(webRoot, rel);
    } else {
        // serve from web root
        filePath = path.join(webRoot, cleaned);
    }

    // Extension
    let ext = path.extname(filePath);

    // If user reloads SPA route → serve index.html again
    if (!ext) {
        filePath = path.join(STATIC_PATH, "web/index.html");
        ext = ".html";
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            // File not found → return SPA index.html (correct path)
            const indexPath = path.join(STATIC_PATH, "web/index.html");
            fs.readFile(indexPath, (err2, indexData) => {
                if (err2) {
                    res.writeHead(500);
                    res.end("Internal server error");
                } else {
                    res.writeHead(200, { "Content-Type": "text/html" });
                    res.end(indexData);
                }
            });
            return;
        }

        res.writeHead(200, {
            "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
        });
        res.end(data);
    });
});

const PORT = 3000;
server.listen(PORT, () =>
    console.log(`Frontend running at http://localhost:${PORT}`)
);
