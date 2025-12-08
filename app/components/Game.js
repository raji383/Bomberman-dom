import { createElement } from "../../framework/createjsx.js";
import { freamwork } from "../../framework/index.js";
import { push, router } from "../../framework/route.js";
import { Players } from "./Players.js";
import { variables } from "../../variables.js";
var d = true




export default function GameScreen() {
    if (!freamwork.state.player) {
        freamwork.state.player = new Players(freamwork.state.players)
        const {ws} = freamwork.state;
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            push('/');
            return;
         
        }
    }
    return createElement({
        tag: "div",
        attrs: { class: "map" },
        children: [
            playersInfoVDOM(),
            RenderMap(),
            { tag: "div", children: freamwork.state.player.list.filter((p) => p?.alive).map((p) => { return p.draw() }) },
            freamwork.state.boombs.map((p) => { return p.draw() }),
            freamwork.state.explosion.map((ex) => { return ex.draw() }),
            (freamwork.state.gameOver != "") && ({
                tag: "div",
                attrs: {
                    class: "gameOver"
                },
                children: [{
                    tag: "h1",
                    children: [`${freamwork.state.gameOver}`]
                }]
            })
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
    return result;
}

function MapDraw(mapElement, x, y) {
    let image = "";

    if (mapElement === 1) image = "./tools/wall.png";
    else if (mapElement === 0 || mapElement === 3) image = "./tools/grass.png";
    else if (mapElement === 2) image = "./tools/box.png";
    console.log(freamwork.state.player);

    return createElement({
        tag: "div",
        attrs: {
            class: "tile",
            style: `
                position: absolute;
                left: ${x * variables.GRID_CELL_SIZE_w}px;
                top: ${y * variables.GRID_CELL_SIZE_h}px;
                width: ${variables.GRID_CELL_SIZE_w}px;
                height: ${variables.GRID_CELL_SIZE_h}px;
                background-size: cover;
                background-image: url('${image}');
            `
        }
    });
}

function playersInfoVDOM() {
    return {
        tag: "div",
        attrs: { class: "playersInfo" },
        children: freamwork.state.player.list.map(player => {
            return {
                tag: "div",
                attrs: { class: "playerBox" },
                children: [
                    // Header (player name)
                    {
                        tag: "div",
                        attrs: { class: "playerHeader" },
                        children: [
                            { tag: "p", children: [player.name] }
                        ]
                    },

                    // Stats row
                    {
                        tag: "div",
                        attrs: { class: "statsRow" },
                        children: [
                            // Lives
                            {
                                tag: "div",
                                attrs: { class: "statItem" },
                                children: [
                                    { tag: "span", children: ["❤️"] },
                                    { tag: "span", children: [`${player.lives}`] }
                                ]
                            },
                            // Speed
                            {
                                tag: "div",
                                attrs: { class: "statItem" },
                                children: [
                                    { tag: "span", children: ["⚡"] },
                                    { tag: "span", children: [`${player.speed}`] }
                                ]
                            },
                            // Bombs
                            {
                                tag: "div",
                                attrs: { class: "statItem" },
                                children: [
                                    { tag: "span", children: ["💣"] },
                                    { tag: "span", children: [`${player.bombs}`] }
                                ]
                            }
                        ]
                    }
                ]
            }
        })
    }
}

