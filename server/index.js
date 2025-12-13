// server.js
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import { GameMap } from './map.js';

const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);
console.log(__dirname);


const ROOT = join(__dirname, '..');
const PORT = 8080;

const MIME_TYPES = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.gif': 'image/gif', '.ico': 'image/x-icon'
};

const rooms = new Map();
const players = new Map();

class GameRoom {
  constructor(id) {
    this.id = id;
    this.players = new Map();
    this.gameStarted = false;

    this.joinTimer = null;
    this.startTimer = null;

    this.joinTimeLeft = 3;
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

    if (count === 1) {
      this.chatMessage = []

      this.startJoinTimer();
      return;
    }

    if (count >= 2 && count < 4) {
      if (this.joinTimeLeft == 0) {
        this.startStartTimer();
      }
      return;
    }
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

      this.stopJoinTimer();
      this.stopStartTimer();
      if (count == 1 && !this.joinTimer) {
        this.joinTimeLeft = 0
        this.broadcast({ type: "join_timer", value: this.joinTimeLeft });

      }
      return;
    }
  }
  startJoinTimer() {
    this.stopJoinTimer();
    this.joinTimeLeft = 3;

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
    const playerList = Array.from(this.players.values());
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
      lives: p.lives || 3,
      color: p.color,
      index: p.index
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
      res.end('Invalid path');
      return;
    }

    // map some special folders into the `app` directory
    let fullPath;
    if (safePath.startsWith('tools/')) {
      // serve /tools/* from app/tools
      const rel = safePath.replace(/^tools\//, '');
      fullPath = join(ROOT, 'app', 'tools', rel);
    } else {
      fullPath = join(ROOT, safePath || 'app/index.html');
    }

    try {

      const fileContent = await readFile(fullPath);
      const ext = extname(fullPath) || '.html';
      const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
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
    const player = Array.from(players.values()).find(p => p.ws === ws);
    if (player && player.roomId) {
      const room = rooms.get(player.roomId);
      if (room) {
        room.removePlayer(player.id);
      }
      players.delete(player.id);
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});
function handlePlayerMove(ws, data) {
  const player = Array.from(players.values()).find(p => p.ws === ws);
  if (!player || !player.roomId) return;

  const room = rooms.get(player.roomId);
  if (!room) return;
  room.broadcast({
    type: data.type,
    message: data.message,
    id: data.playerId
  });
}
function handlePlayerWin(ws, data) {
  const player = Array.from(players.values()).find(p => p.ws === ws);
  if (!player || !player.roomId) return;

  const room = rooms.get(player.roomId);
  if (!room) return;
  room.broadcast({
    type: data.type,
    message: data.message,
    id: data.playerId
  });
}

function reDrawMap(ws, data) {
  const player = Array.from(players.values()).find(p => p.ws === ws);
  if (!player || !player.roomId) return;

  const room = rooms.get(player.roomId);
  if (!room) return;
  const randomNbm = Math.floor(Math.random() * 3) + 4;
  const map = room.map.map
  for (let p of data.message) {

    map[p.y][p.x] = randomNbm;

  }
  room.broadcast({
    type: data.type,
    message: map,
    id: data.playerId
  });
}
function PowerUp(ws, data) {
  const player = Array.from(players.values()).find(p => p.ws === ws);
  if (!player || !player.roomId) return;

  const room = rooms.get(player.roomId);
  if (!room) return;
  const map = room.map.map
  map[data.message.y][data.message.x] = 0;
  room.broadcast({
    type: data.type,
    message: map,
    power: data.message.power,
    id: data.playerId
  });
}

function sliding(ws, data) {
  const player = Array.from(players.values()).find(p => p.ws === ws);
  if (!player || !player.roomId) return;

  const room = rooms.get(player.roomId);
  if (!room) return;
  room.broadcast({
    type: data.type,
    message: data.message,
    id: data.playerId
  });
}

function handleMessage(ws, data) {
  switch (data.type) {
    case 'join':
      handleJoin(ws, data);
      break;
    case 'chat_message':
      handleChatMessage(ws, data);
      break;
    case 'playermove':
      handlePlayerMove(ws, data)
      break
    case 'playerstop':
      handlePlayerMove(ws, data)
      break
    case 'boomb':
      handlePlayerMove(ws, data)
      break
    case 'winning':
      handlePlayerWin(ws, data)
      break
    case 'boxdestroy':
      reDrawMap(ws, data)
      break
    case 'powerUp':
      PowerUp(ws, data)
      break
    case 'sliding':
      sliding(ws, data)

      break
    default:
      console.log('Unknown message type:', data.type);
  }
}

function handleJoin(ws, data) {
  const playerId = generateId();
  const player = {
    id: playerId,
    nickname: data.nickname,
    ws: ws,
    roomId: null,
    joinedAt: Date.now()
  };

  players.set(playerId, player);

  let room = findAvailableRoom();

  if (!room) {
    const newRoomId = generateId();
    room = new GameRoom(newRoomId);
    rooms.set(newRoomId, room);
  }

  player.roomId = room.id;
  room.addPlayer(player);

  ws.send(JSON.stringify({
    type: 'room_assigned',
    roomId: room.id,
    playerId: playerId,
    players: room.getPlayersList(),
    chatMessage: room.chatMessage
  }));

}

function findAvailableRoom() {
  for (const room of rooms.values()) {
    if (!room.gameStarted && room.players.size < 4 && room.startTimer === null) {
      return room;
    }
  }
  return null;
}

function handleChatMessage(ws, data) {
  const player = Array.from(players.values()).find(p => p.ws === ws);
  if (!player || !player.roomId) return;

  const room = rooms.get(player.roomId);
  if (!room) return;

  const chatMessage = {
    player: player.nickname,
    text: data.message,
    timestamp: Date.now(),
    isSystem: false
  };
  room.chatMessage.push({
    player: player.nickname,
    text: data.message,
    timestamp: Date.now(),
    isSystem: false
  })

  room.broadcast({
    type: 'chat_message',
    message: chatMessage
  });
}
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}
setInterval(() => {
  for (const [roomId, room] of rooms.entries()) {
    if (room.players.size === 0) {
      rooms.delete(roomId);
    }
  }
}, 500);

server.listen(PORT, () => {
  console.log(`Server started: http://localhost:${PORT}/`);
  console.log(`WebSocket: ws://localhost:${PORT}/`);
});