import { createElement } from "../../framework/createjsx.js";
import { freamwork } from "../../framework/index.js";
import { push } from "../../framework/route.js";
import { NEW } from "./Players.js";



export default function GameScreen() {
    const player = NEW()
    console.log(player.list[0].draw());
    


    return { tag: "div", children: player.list.map((p) => { p.draw() }) }

}