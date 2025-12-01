// app/index.js
import { freamwork } from "../framework/index.js";
import { initRouter } from "../framework/route.js";
import NicknameScreen from "./components/Nickname.js";
import LobbyScreen from "./components/Lobby.js";
import GameScreen from "./components/Game.js";

// État global
freamwork.state = {
  playerName: "",
  chatInput: "",
  roomId: null,
  myId: null,
  ws: null,
  players: {},
  blocks: new Set(),
  walls: new Set(),
  powerups: {},
  bombs: {},
  explosions: new Set(),
  messages: [],
  countdown: null,
  gameStarted: false,
  fps: 0,
  keys: {},
  gameLoopId: null,
  lastFrameTime: 0
};

// Configuration des routes
freamwork.addRoute("/", NicknameScreen);
freamwork.addRoute("/lobby", LobbyScreen);
freamwork.addRoute("/game", GameScreen);
initRouter();