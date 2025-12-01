const http = require("http");
const fs = require("fs");
const path = require("path");
const { WebSocketServer } = require('ws');


const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || '').split('?')[0]);
    let requested = urlPath === '/' || urlPath === '' ? '/index.html' : urlPath;

    let filePath;
    if (requested.startsWith('/framework/')) {
        filePath = path.join(__dirname, requested);
    } else {
        filePath = path.join(__dirname, 'app', requested.replace(/^\//, ''));
    }

    const types = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.json': 'application/json',
    };

    fs.stat(filePath, (statErr, stats) => {
        if (!statErr && stats.isDirectory()) {
            filePath = path.join(filePath, 'index.html');
        }

        fs.access(filePath, fs.constants.R_OK, (accessErr) => {
            if (accessErr) {
                // try adding .html when no extension
                const ext = path.extname(filePath);
                if (!ext) {
                    const tryHtml = filePath + '.html';
                    fs.access(tryHtml, fs.constants.R_OK, (ae2) => {
                        if (!ae2) return fs.readFile(tryHtml, sendFile(tryHtml, res, types));
                        // If there's no specific .html file, treat this as an SPA route and return index.html
                        const indexPath = path.join(__dirname, 'app', 'index.html');
                        return fs.readFile(indexPath, sendFile(indexPath, res, types));
                    });
                    return;
                }
                res.writeHead(404);
                return res.end('404 Not Found');
            }

            // file exists
            fs.readFile(filePath, sendFile(filePath, res, types));
        });
    });
});

function sendFile(filePath, res, types) {
    return (err, data) => {
        if (err) {
            res.writeHead(500);
            return res.end('500 Internal Server Error');
        }
        const ext = path.extname(filePath) || '.html';
        const contentType = types[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    };
}
const wss = new WebSocketServer({ server });
// keep track of connected players
const players = new Set();

function broadcastPlayers() {
    const payload = JSON.stringify({ type: 'players', count: players.size, players: Array.from(players) });
    wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN) client.send(payload);
    });
}

wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Received:', data);
            if (data.type === 'join') {
                const nick = String(data.nickname || 'anonymous');
                // attach nickname to socket and add to players set
                ws.nickname = nick;
                players.add(nick);
                console.log(`Player joined: ${nick}`);
                // acknowledge to the joining client
                if (ws.readyState === ws.OPEN) {
                    ws.send(JSON.stringify({ type: 'joined', nickname: nick }));
                }
                // broadcast updated players list to everyone
                broadcastPlayers();
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });

    ws.on('close', () => {
        if (ws.nickname) {
            players.delete(ws.nickname);
            console.log(`Player left: ${ws.nickname}`);
            broadcastPlayers();
        }
    });
});
server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
