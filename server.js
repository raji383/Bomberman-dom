const http = require("http");
const fs = require("fs");
const path = require("path");

const server = http.createServer((req, res) => {
    let filePath;
    if (req.url === "/") {
        filePath = path.join(__dirname, "app", "index.html");
    }
    else {
        if (req.url.startsWith("/framework/")) {
            filePath = path.join(__dirname, req.url);
        } else {
            filePath = path.join(__dirname, "app", req.url);
        }
    }

    const ext = path.extname(filePath);
    let contentType = "text/html";

    const types = {
        ".js": "text/javascript",
        ".css": "text/css",
        ".png": "image/png",
        ".jpg": "image/jpeg",
    };
    if (types[ext]) contentType = types[ext];

    fs.readFile(filePath, (err, data) => {
        if (err) {            
            res.writeHead(404);
            return res.end("404 Not Found");
        }

        res.writeHead(200, { "Content-Type": contentType });
        res.end(data);
    });
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
