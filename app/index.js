import { freamwork } from "../framework/index.js";
import { initRouter } from "../framework/route.js";
import Room from "./components/startroom.js";



freamwork.state = {
  playerName: [],

}

freamwork.addRoute('/', Room)
freamwork.addRoute('/loby', () => { return ({ tag: 'div', children: ['home page'] }) })
freamwork.addRoute('/StartGAme', () => { return ({ tag: 'div', children: ['home page'] }) })
initRouter();

