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
        tag: "div",
        attrs: { class: "map" },
        children: [
            UsersInfos(),
            RenderMap(),
            { tag: "div", children: freamwork.state.player.list.map((p) => { return p.draw() }) },
            freamwork.state.boombs.map((p) => { return p.draw() }),
            freamwork.state.explosion.map((ex) => { return ex })
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


function UsersInfos() {
    console.log('111111111111111')
    const playersArray = freamwork.state.player.players

    const playerCardElements = playersArray.map((player, index) => {
        const ICON_HEART = '❤️';
        const ICON_SPEED = '⚡';
        const ICON_POWER = '💥';

        const createStatIcon = (icon, value) => createElement({
            tag: "div",
            attrs: { class: "p-stat-icon-value" },
            children: [
                createElement({
                    tag: "span",
                    attrs: { class: "icon-img" },
                    textContent: icon
                }),
                createElement({
                    tag: "span",
                    attrs: { class: "icon-value" },
                    textContent: value
                })
            ]
        });

        // --- CORRECTED: Build the individual Player Card (The main container) ---
        return createElement({
            tag: "div",
            attrs: {},
            children: [
                // 1. Player Name/ID Header
                createElement({
                    tag: "div",
                    attrs: { class: "p-card-header" },
                    textContent: player.name
                }),

                // 2. The Row of Stats
                createElement({
                    tag: "div",
                    attrs: { class: "p-stats-row" },
                    children: [
                        // Lives
                        createStatIcon(ICON_HEART, player.lives),
                        // Speed Level (or Speed Power)
                        createStatIcon(ICON_SPEED, player.speedLevel),
                        // Bomb Power/Range
                        createStatIcon(ICON_POWER, player.power),
                    ]
                })
            ]
        });
    });

    // Return the main wrapper element
    return createElement({
        tag: "div",
        attrs: { id: "player-stats-hud-wrapper", class: "player-stats-hud" },
        children: playerCardElements
    });
}