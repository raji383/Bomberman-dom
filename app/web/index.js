import { freamwork } from "../../framework/index.js";
import { initRouter } from "../../framework/route.js";
import Game from "../components/Game.js";
import Room from "../components/startroom.js";
import WaitingRoom from "../components/waitingRoom.js";


// 🚀 framework config
freamwork.state = {
  playerName: [],
  timer:0,
  mapcomp: null
};

freamwork.addRoute("/", Room);
freamwork.addRoute("/waiting", WaitingRoom);
freamwork.addRoute("/StartGame", Game);
initRouter();


