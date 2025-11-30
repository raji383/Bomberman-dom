import { freamwork } from "../framework/index.js";
import { YourNAme } from "./YourName.js";
import { Loby } from "./Loby.js";
import { StartGAme } from "./StartGame.js";
import { initRouter } from "../framework/route.js";



freamwork.state = {
    playerName: '',
    
}
freamwork.addRoute('/', YourNAme)
freamwork.addRoute('/loby' ,Loby)
freamwork.addRoute('/StartGAme', StartGAme)

initRouter();