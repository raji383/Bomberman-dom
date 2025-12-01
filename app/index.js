import { freamwork } from "../framework/index.js";
import { initRouter } from "../framework/route.js";



freamwork.state = {
  playerName: [],

}

freamwork.addRoute('/',()=>{return({tag:'div', children:['home page']})})
freamwork.addRoute('/loby', ()=>{return({tag:'div', children:['home page']})})
freamwork.addRoute('/StartGAme', ()=>{return({tag:'div', children:['home page']})})
initRouter();

