// server.js
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import { GameMap } from './map.js';
import { handleMessage } from './websocketTools.js';
import { variables } from '../variables.js';
// import { MIME_TYPES } from './variables.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const ROOT = join(__dirname, '..');
const PORT = 8080;


export class GameRoom {
  constructor(id) {
    this.id = id;
    this.players = new Map();
    this.gameStarted = false;

    this.joinTimer = null;
    this.startTimer = null;

    this.joinTimeLeft = 20;
    this.startTimeLeft = 10;

    this.map = new GameMap();
    this.chatMessage = [];
  }

  addPlayer(player) {
    this.players.set(player.id, player);

    this.sendSystemMessage(`${player.nickname} joined the game!`);

    this.broadcast({
      type: "players_update",
      players: this.getPlayersList(),
    });

    if (this.gameStarted) return;

    const count = this.players.size;
    if (count == 1) {
      this.chatMessage = []

    }

    if (count == 2) {
      this.startJoinTimer();
      return;
    }

    // if (count >= 2 && count < 4) {
    //   if (this.joinTimeLeft == 0) {
    //     this.startStartTimer();
    //   }
    //   return;
    // }
    if (count === 4) {
      this.stopJoinTimer();
      this.startStartTimer();
    }
  }

  removePlayer(playerId) {
    const player = this.players.get(playerId);
    if (player) {
      this.sendSystemMessage(`${player.nickname} left the game`);
    }

    this.players.delete(playerId);

    const count = this.players.size;
    if (!this.gameStarted) {
      this.broadcast({
        type: "players_update",
        players: this.getPlayersList(),
      });

    } else {
      this.broadcast({
        type: "number",
        number: playerId,
      });
    }
    if (this.gameStarted) return;

    if (count <= 1) {
      if (!this.startTimer) {
        this.stopJoinTimer();
        this.stopStartTimer();

        this.broadcast({ type: "join_timer", value: null });
      }

      // this.broadcast({ type: "join_timer", value: null });



    }
  }
  startJoinTimer() {
    this.stopJoinTimer();
    this.joinTimeLeft = 20;

    this.joinTimer = setInterval(() => {
      this.joinTimeLeft--;

      this.broadcast({ type: "join_timer", value: this.joinTimeLeft });

      if (this.joinTimeLeft <= 0) {
        this.stopJoinTimer();

        if (this.players.size >= 2) {
          this.startStartTimer();
        }
      }
    }, 1000);
  }

  stopJoinTimer() {
    if (this.joinTimer) {
      clearInterval(this.joinTimer);
      this.joinTimer = null;
    }
  }

  startStartTimer() {
    this.stopStartTimer();
    this.startTimeLeft = 10;
    this.startTimer = setInterval(() => {
      this.startTimeLeft--;
      this.broadcast({ type: "start_timer", value: this.startTimeLeft });
      if (this.startTimeLeft <= 0) {
        this.stopStartTimer();
        this.startGame();
      }
    }, 1000);
  }

  stopStartTimer() {
    if (this.startTimer) {
      clearInterval(this.startTimer);
      this.startTimer = null;
    }
  }
  startGame() {
    let positions = [
      [1, 1],
      [15, 1],
      [1, 15],
      [15, 15]
    ];
    const playerList = Array.from(this.players.values());
    for (let i = 0; i < playerList.length; i++) {
      playerList[i].x = positions[i][0] * playerList[i].cell
      playerList[i].y = positions[i][1] * playerList[i].cell
      playerList[i].initialX = positions[i][0] * playerList[i].cell
      playerList[i].initialY = positions[i][1] * playerList[i].cell

    }
    this.broadcast({
      type: 'game_start',
      message: 'The game has started!',
      players: playerList,
      map: this.map.map,
      number: playerList.length
    });
    this.gameStarted = true;
  }

  getPlayersList() {
    return Array.from(this.players.values()).map(p => ({
      id: p.id,
      nickname: p.nickname,
    }));
  }
  sendSystemMessage(text) {
    this.broadcast({
      type: 'chat_message',
      message: {
        player: "System",
        text: text,
        isSystem: true,
        timestamp: Date.now()
      }
    });
  }
  broadcast(message) {
    const messageStr = JSON.stringify(message);
    this.players.forEach(player => {
      if (player.ws && player.ws.readyState === 1) {
        try {
          player.ws.send(messageStr);
        } catch (error) {
          console.error('Error sending message:', error);
        }
      }
    });
  }
}
// HTTP Server
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    let pathname = decodeURIComponent(url.pathname || '/');

    if (pathname === '/') pathname = '/app/index.html';
    const safePath = pathname.replace(/^\/+/, '');

    if (safePath.includes('..')) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      // Directory Traversal Attack
      res.end('Invalid path');
      return;
    }
    let fullPath;
    if (safePath.startsWith('tools/')) {
      const rel = safePath.replace(/^tools\//, '');
      fullPath = join(ROOT, 'app', 'tools', rel);
    } else {
      fullPath = join(ROOT, safePath || 'app/index.html');
    }

    try {

      const fileContent = await readFile(fullPath);
      const ext = extname(fullPath) || '.html';
      const mimeType = variables.MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(fileContent);
    } catch (err) {
      const accept = req.headers.accept || '';
      if (accept.includes('text/html')) {
        try {
          const indexContent = await readFile(join(ROOT, 'app/index.html'));
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(indexContent);
          return;
        } catch (e) { }
      }
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 - File not found</h1>');
    }
  } catch (e) {
    console.error('Server error:', e);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal server error');
  }
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log("upgrade is good");
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      setTimeout(() => {
        handleMessage(ws, data);
      }, 0)
    } catch (error) {
      console.error('Message parsing error:', error);
    }
  });

  ws.on('close', (err) => {
    console.log('Client disconnected', err);
    const player = Array.from(variables.players.values()).find(p => p.ws === ws);
    if (player && player.roomId) {
      const room = variables.rooms.get(player.roomId);
      if (room) {
        room.removePlayer(player.id);
      }
      variables.players.delete(player.id);
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

setInterval(() => {
  for (const [roomId, room] of variables.rooms.entries()) {
    if (room.players.size === 0) {
      variables.rooms.delete(roomId);
    }
  }
}, 500);

server.listen(PORT, () => {
  console.log(`Server started: http://localhost:${PORT}/`);
});