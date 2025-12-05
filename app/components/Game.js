import { createElement } from "../../framework/createjsx.js";
import { freamwork } from "../../framework/index.js";
import { push, router } from "../../framework/route.js";
import { Boomb } from "./Boomb.js";
import { Players } from "./Players.js";
var d = true

export default function GameScreen() {
    if (!freamwork.state.player) {
        freamwork.state.player = new Players(freamwork.state.players)
    }

    return createElement({
        tag: "div",
        attrs: { class: "map" },
        children: [
            { tag: "div", children: freamwork.state.player.list.map((p) => { return p.draw() }) }
            ,
            freamwork.state.boombs.map((p) => { return p.draw() })
        ]
    })

}