import { freamwork } from "../framework/index.js";
import { initRouter } from "../framework/route.js";
import Room from "./components/startroom.js";
import WaitingRoom from "./components/waitingRoom.js";



freamwork.state = {
  playerName: [],

}

freamwork.addRoute('/', Room)
freamwork.addRoute('/waiting', WaitingRoom)
freamwork.addRoute('/StartGAme', Game)
initRouter();

