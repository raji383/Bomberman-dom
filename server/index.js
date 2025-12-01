// server.js
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
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
    this.countdown = null;
    this.joinTimer = null;
    this.walls = new Set();
    this.blocks = new Set();
    this.bombs = new Map();
    this.explosions = new Set();
    this.powerups = new Map();
    this.lastBombId = 0;
    this.gameLoop = null;
    this.chatMessage = []
  }

  generateMap() {
    const GRID_SIZE = 13;
    this.walls.clear();
    this.blocks.clear();
    this.powerups.clear();

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (x === 0 || y === 0 || x === GRID_SIZE - 1 || y === GRID_SIZE - 1) {
          this.walls.add(`${x},${y}`);
        } else if (x % 2 === 0 && y % 2 === 0) {
          this.walls.add(`${x},${y}`);
        }
      }
    }

    const startPositions = [
      { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 },
      { x: 11, y: 1 }, { x: 10, y: 1 }, { x: 11, y: 2 },
      { x: 1, y: 11 }, { x: 2, y: 11 }, { x: 1, y: 10 },
      { x: 11, y: 11 }, { x: 10, y: 11 }, { x: 11, y: 10 }
    ];

    for (let y = 1; y < GRID_SIZE - 1; y++) {
      for (let x = 1; x < GRID_SIZE - 1; x++) {
        if (this.walls.has(`${x},${y}`)) continue;
        if (startPositions.some(pos => pos.x === x && pos.y === y)) continue;
        if (Math.random() < 0.7) {
          this.blocks.add(`${x},${y}`);

          if (Math.random() < 0.2) {
            const powerupTypes = ['bombs', 'flames', 'speed'];
            const type = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
            this.powerups.set(`${x},${y}`, { type });
          }
        }
      }
    }
  }

  addPlayer(player) {
    this.players.set(player.id, player);

    this.sendSystemMessage(`${player.nickname} joined the game!`);
    this.broadcast({
      type: 'players_update',
      players: this.getPlayersList()
    });

    if (this.joinTimer) {
      clearTimeout(this.joinTimer);
      this.joinTimer = null;
    }
    if (this.countdown) {
      clearInterval(this.countdown);
      this.countdown = null;
    }

    if (this.players.size > 2 && !this.gameStarted) {
      if (this.players.size === 4) {
        this.sendSystemMessage("Room full! Starting in 10 seconds...");
        this.startCountdown(10);
      } else {
            this.sendSystemMessage("Starting in 10 seconds!");
            this.startCountdown(10);
      }
    }else if (this.players.size == 2 && !this.gameStarted){
        this.sendSystemMessage("Starting in 20 seconds!");
         this.startCountdown(20);
    }
  }

  removePlayer(playerId) {
    const player = this.players.get(playerId);
    if (player) {
      console.log(`${player.nickname} left room ${this.id}`);
      this.sendSystemMessage(`${player.nickname} left the game`);
    }

    this.players.delete(playerId);
    this.broadcast({
      type: 'players_update',
      players: this.getPlayersList()
    });

    if (this.players.size === 0) {
      if (this.joinTimer) clearTimeout(this.joinTimer);
      if (this.countdown) clearInterval(this.countdown);
      if (this.gameLoop) clearInterval(this.gameLoop);
      this.gameStarted = false;
    }
  }

  startCountdown(seconds) {
    let countdown = seconds;

    this.broadcast({
      type: 'countdown',
      countdown: countdown
    });

    this.countdown = setInterval(() => {
      countdown--;
      this.broadcast({
        type: 'countdown',
        countdown: countdown
      });

      if (countdown <= 0) {
        clearInterval(this.countdown);
        this.countdown = null;
        this.startGame();
      }
    }, 1000);
  }

  startGame() {
    this.gameStarted = true;
    this.generateMap();

    const startPositions = [
      { x: 1.5, y: 1.5, color: '#3498db' },    // Blue
      { x: 11.5, y: 1.5, color: '#e74c3c' },   // Red
      { x: 1.5, y: 11.5, color: '#2ecc71' },   // Green
      { x: 11.5, y: 11.5, color: '#f39c12' }   // Orange
    ];

    let index = 0;
    for (const player of this.players.values()) {
      player.x = startPositions[index].x;
      player.y = startPositions[index].y;
      player.lives = 3;
      player.powerups = { bombs: 1, flames: 1, speed: 1 };
      player.color = startPositions[index].color;
      player.index = index;
      index++;
    }

    this.sendSystemMessage("🎮 THE GAME STARTS! FIGHT!");

    this.broadcast({
      type: 'game_start',
      walls: Array.from(this.walls),
      blocks: Array.from(this.blocks),
      players: this.getPlayersState(),
      powerups: Object.fromEntries(this.powerups),
      bombs: {},
    });

    // Start server game loop
    this.startServerGameLoop();
  }

  startServerGameLoop() {
    let lastUpdate = Date.now();

    this.gameLoop = setInterval(() => {
      const now = Date.now();
      const deltaTime = (now - lastUpdate) / 1000;
      lastUpdate = now;

      // Update bombs
      this.updateBombs(deltaTime);

    }, 50); // 20 FPS
  }

  updateBombs(deltaTime) {
    let updated = false;
    const bombsToRemove = [];

    this.bombs.forEach((bomb, bombId) => {
      bomb.timer -= deltaTime;

      if (bomb.timer <= 0) {
        bombsToRemove.push(bombId);
        this.explodeBomb(bombId);
        updated = true;
      }
    });
    bombsToRemove.forEach(bombId => {
      this.bombs.delete(bombId);
    });

    if (updated) {
      this.broadcast({
        type: 'bombs_update',
        bombs: Object.fromEntries(this.bombs)
      });
    }
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

  getPlayersState() {
    const state = {};
    this.players.forEach(player => {
      state[player.id] = {
        x: player.x,
        y: player.y,
        lives: player.lives,
        powerups: player.powerups,
        nickname: player.nickname,
        color: player.color,
        index: player.index
      };
    });
    return state;
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

  handlePlayerAction(playerId, action, data) {
    const player = this.players.get(playerId);
    if (!player || player.lives <= 0) return;

    if (action === 'move') {
      this.handlePlayerMovement(playerId, data);
    } else if (action === 'place_bomb') {
      this.placeBomb(playerId, data);
    }
  }

  handlePlayerMovement(playerId, data) {
    const player = this.players.get(playerId);
    if (!player) return;

    const speed = 0.2 * (player.powerups?.speed || 1);
    let newX = player.x;
    let newY = player.y;

    switch (data.key) {
      case 'ArrowUp':
        newY = player.y - speed;
        break;
      case 'ArrowDown':
        newY = player.y + speed;
        break;
      case 'ArrowLeft':
        newX = player.x - speed;
        break;
      case 'ArrowRight':
        newX = player.x + speed;
        break;
    }

    if (this.isValidPosition(newX, newY, player)) {
      player.x = newX;
      player.y = newY;

      this.checkPowerupCollection(player);

      this.broadcast({
        type: 'player_moved',
        playerId: playerId,
        x: player.x,
        y: player.y
      });
    }
  }

  isValidPosition(x, y, player) {
    if (x < 0.3 || x > 12.7 || y < 0.3 || y > 12.7) {
      return false;
    }

    const playerRadius = 0.3;
    const corners = [
      { x: x - playerRadius, y: y - playerRadius },
      { x: x + playerRadius, y: y - playerRadius },
      { x: x - playerRadius, y: y + playerRadius },
      { x: x + playerRadius, y: y + playerRadius }
    ];

    for (const corner of corners) {
      const cellX = Math.floor(corner.x);
      const cellY = Math.floor(corner.y);
      const cellId = `${cellX},${cellY}`;

      if (this.walls.has(cellId) || this.blocks.has(cellId)) {
        return false;
      }
    }

    return true;
  }

  checkPowerupCollection(player) {
    const playerCellX = Math.floor(player.x);
    const playerCellY = Math.floor(player.y);
    const cellId = `${playerCellX},${playerCellY}`;

    if (this.powerups.has(cellId)) {
      const powerup = this.powerups.get(cellId);

      switch (powerup.type) {
        case 'bombs':
          player.powerups.bombs = (player.powerups.bombs || 1) + 1;
          break;
        case 'flames':
          player.powerups.flames = (player.powerups.flames || 1) + 1;
          break;
        case 'speed':
          player.powerups.speed = (player.powerups.speed || 1) + 0.3;
          break;
      }

      this.powerups.delete(cellId);

      this.sendSystemMessage(`${player.nickname} collected a ${powerup.type} power-up!`);

      this.broadcast({
        type: 'powerup_collected',
        playerId: player.id,
        powerupType: powerup.type,
        players: this.getPlayersState(),
        powerups: Object.fromEntries(this.powerups)
      });
    }
  }

  placeBomb(playerId, data) {
    const player = this.players.get(playerId);
    if (!player) return;

    const bombX = Math.floor(data.x);
    const bombY = Math.floor(data.y);
    const bombId = `${bombX},${bombY}`;

    if (this.walls.has(bombId) || this.blocks.has(bombId) || this.bombs.has(bombId)) {
      return;
    }

    const playerCellX = Math.floor(player.x);
    const playerCellY = Math.floor(player.y);
    if (playerCellX !== bombX || playerCellY !== bombY) {
      return;
    }

    const playerBombs = Array.from(this.bombs.values()).filter(b => b.playerId === playerId).length;
    const maxBombs = player.powerups?.bombs || 1;

    if (playerBombs >= maxBombs) {
      return;
    }

    const bomb = {
      id: ++this.lastBombId,
      playerId: playerId,
      x: bombX,
      y: bombY,
      timer: 3,
      flames: data.flames || 1
    };

    this.bombs.set(bombId, bomb);

    this.broadcast({
      type: 'bomb_placed',
      id: bombId,
      playerId: playerId,
      x: bombX,
      y: bombY,
      timer: 3,
      flames: data.flames || 1
    });
  }

  explodeBomb(bombId) {
    const bomb = this.bombs.get(bombId);
    if (!bomb) return;

    const explosions = new Set([bombId]);
    const blocksRemoved = [];
    const playersHit = new Set();

    const directions = [
      { dx: 0, dy: -1 }, { dx: 1, dy: 0 },
      { dx: 0, dy: 1 }, { dx: -1, dy: 0 }
    ];

    directions.forEach(dir => {
      for (let i = 1; i <= bomb.flames; i++) {
        const expX = bomb.x + dir.dx * i;
        const expY = bomb.y + dir.dy * i;
        const expId = `${expX},${expY}`;

        if (this.walls.has(expId)) break;

        explosions.add(expId);

        if (this.blocks.has(expId)) {
          blocksRemoved.push(expId);
          this.blocks.delete(expId);
          break;
        }

        this.checkPlayerHit(expX, expY, playersHit);

        if (this.bombs.has(expId)) {
          this.explodeBomb(expId);
        }
      }
    });

    this.checkPlayerHit(bomb.x, bomb.y, playersHit);

    // Apply damage to players
    playersHit.forEach(playerId => {
      const player = this.players.get(playerId);
      if (player && player.lives > 0) {
        player.lives--;

        this.broadcast({
          type: 'player_damage',
          playerId: playerId,
          lives: player.lives
        });

        if (player.lives <= 0) {
          this.sendSystemMessage(`💀 ${player.nickname} has been eliminated!`);
        }
      }
    });

    this.broadcast({
      type: 'explosion',
      explosions: Array.from(explosions),
      blocksRemoved: blocksRemoved,
      players: this.getPlayersState(),
      powerups: Object.fromEntries(this.powerups)
    });

    setTimeout(() => {
      this.broadcast({
        type: 'clear_explosions'
      });
    }, 500);

    setTimeout(() => {
      this.checkGameOver();
    }, 1000);
  }

  checkPlayerHit(x, y, playersHit) {
    this.players.forEach(player => {
      if (player.lives > 0 &&
        Math.floor(player.x) === x &&
        Math.floor(player.y) === y) {
        playersHit.add(player.id);
      }
    });
  }

  checkGameOver() {
    const alivePlayers = Array.from(this.players.values()).filter(p => p.lives > 0);
    if (alivePlayers.length <= 1) {
      setTimeout(() => {
        this.broadcast({
          type: 'game_over',
          winner: alivePlayers[0] || null,
          players: this.getPlayersState()
        });
        if (this.gameLoop) {
          clearInterval(this.gameLoop);
          this.gameLoop = null;
        }
        this.gameStarted = false;
      }, 1000);
    }
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

    const fullPath = join(ROOT, safePath || 'app/index.html');

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
  console.log('New client connected');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      handleMessage(ws, data);
    } catch (error) {
      console.error('Message parsing error:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
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

function handleMessage(ws, data) {
  switch (data.type) {
    case 'join':
      handleJoin(ws, data);
      break;
    case 'chat_message':
      handleChatMessage(ws, data);
      break;
    case 'player_action':
      handlePlayerAction(ws, data);
      break;
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
    console.log(`New room created: ${newRoomId}`);
  }

  player.roomId = room.id;
  room.addPlayer(player);

  ws.send(JSON.stringify({
    type: 'room_assigned',
    roomId: room.id,
    playerId: playerId,
    players: room.getPlayersList(),
    chatMessage : room.chatMessage
  }));

  console.log(`${data.nickname} joined room ${room.id}`);
}

function findAvailableRoom() {
  for (const room of rooms.values()) {
    if (!room.gameStarted && room.players.size < 4) {
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

function handlePlayerAction(ws, data) {
  const player = Array.from(players.values()).find(p => p.ws === ws);
  if (!player || !player.roomId) return;

  const room = rooms.get(player.roomId);
  if (!room || !room.gameStarted) return;

  room.handlePlayerAction(player.id, data.action, data.data);
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
}, 30000);

server.listen(PORT, () => {
  console.log(`Server started: http://localhost:${PORT}/`);
  console.log(`WebSocket: ws://localhost:${PORT}/`);
});
