import { freamwork } from "../framework/index.js";
import { initRouter } from "../framework/route.js";
import NicknameScreen from "./components/Nickname.js";
import LobbyScreen from "./components/Lobby.js";
import GameScreen from "./components/Game.js";

freamwork.state = {
  player: null,
  chatInput: "",
  roomId: null,
  myId: null,
  ws: null,
  players: [],
  messages: [],
  countdown: null,
  gameStarted: false,
  keys: {},
  gameLoopId: null,
  lastFrameTime: 0,
  boombs: [],
  explosion: []
};
freamwork.addRoute("/", NicknameScreen);
freamwork.addRoute("/lobby", LobbyScreen);
freamwork.addRoute("/game", GameScreen);
initRouter();