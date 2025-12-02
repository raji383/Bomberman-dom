// backend/server.js
import { time } from "console";
import http from "http";
import { WebSocketServer } from "ws";

const PORT = 8080;
export const rooms = [];

const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end("WebSocket Backend is running");
});

const wsServer = new WebSocketServer({ server, path: "/ws" });

// track connected players by nickname
const players = new Set();

function broadcastPlayers() {
    const payload = JSON.stringify({ type: 'players', count: players.size, players: Array.from(players), time: Time });
    wsServer.clients.forEach((c) => {
        if (c.readyState === c.OPEN) c.send(payload);
    });
}
let Time = 20;
wsServer.on("connection", (client) => {

    client.on("message", (msg) => {
        try {
            const data = JSON.parse(msg.toString());
            if (data.type === 'join') {
                const nick = String(data.nickname || 'anonymous');
                client.nickname = nick;
                players.add(nick);
                console.log('Player joined:', nick);
                if (Time == 20) {
                    const d = setInterval(() => {
                        Time--;
                        if (Time == 0) {
                            Time = 20;
                            clearInterval(d);
                        }
                    }, 1000);
                }
                console.log("Time", Time);

                // ack
                if (client.readyState === client.OPEN) client.send(JSON.stringify({ type: 'joined', nickname: nick, time: Time }));
                broadcastPlayers(Time);
            }
        } catch (err) {
            console.log('Non-JSON message:', msg.toString());
        }
    });

    client.on("close", () => {
        if (client.nickname) {
            players.delete(client.nickname);
            console.log('Player left:', client.nickname);
            broadcastPlayers();
        }
    });
});

server.listen(PORT, () => {
    console.log("Backend WebSocket running at ws://localhost:" + PORT + "/ws");
    console.log("Backend  running at http://localhost:" + PORT);
});
