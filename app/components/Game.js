import { createElement } from "../../framework/createjsx.js";
import { freamwork } from "../../framework/index.js";
import { push } from "../../framework/route.js";
import { Players } from "./Players.js";
var d = true

export default function GameScreen() {
    if (!freamwork.state.player) {
        freamwork.state.player = new Players(freamwork.state.players)
    }

    return { tag: "div", children: freamwork.state.player.list.map((p) => { return p.draw() }) }

}