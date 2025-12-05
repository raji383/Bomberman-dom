import { createElement } from "../../framework/createjsx.js";
import { freamwork } from "../../framework/index.js";
import { push, router } from "../../framework/route.js";
import { Boomb } from "./Boomb.js";
import { Players } from "./Players.js";
import { variables } from "../../variables.js";
var d = true




export default function GameScreen() {
    if (!freamwork.state.player) {
        freamwork.state.player = new Players(freamwork.state.players)
    }

    return createElement({
        tag: "map", children: [
            RenderMap(),
            { tag: "div", children: freamwork.state.player.list.map((p) => { return p.draw() }) },
            freamwork.state.boombs.map((p) => { return p.draw() })
        ]
    })

}
function RenderMap() {
    const result = [];

    for (let y = 0; y < freamwork.state.map.length; y++) {
        for (let x = 0; x < freamwork.state.map[y].length; x++) {
            const element = freamwork.state.map[y][x];
            const tile = MapDraw(element, x, y);
            result.push(tile);
        }
    }

    console.log('result is :', result);
    

    return result;
}

function MapDraw(mapElement, x, y) {
    let image = "";

    if (mapElement === 1) image = "./tools/wall.png";
    else if (mapElement === 0 || mapElement === 3) image = "./tools/grass.png";
    else if (mapElement === 2) image = "./tools/box.png";

    return createElement({
        tag: "div",
        attrs: {
            class: "tile",
            style: `
                position: absolute;
                left: ${x * variables.GRID_CELL_SIZE}px;
                top: ${y * variables.GRID_CELL_SIZE}px;
                width: ${variables.GRID_CELL_SIZE}px;
                height: ${variables.GRID_CELL_SIZE}px;
                background-size: cover;
                background-image: url('${image}');
            `
        }
    });
}
