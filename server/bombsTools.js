import { variables } from '../variables.js';
import { checkPlayerHit } from './playersTools.js';

export function handleBommb(ws, data) {
    const player = Array.from(variables.players.values()).find(p => p.ws === ws);
    if (!player || !player.roomId) return;

    const room = variables.rooms.get(player.roomId);
    if (!room) return;
    if (player.lives <= 0) {
        return
    }
    const bombPos = player.tryPlaceBomb();

    if (!bombPos) return;

    room.broadcast({
        type: "boomb",
        id: player.id,
        message: {
            x: bombPos.x,
            y: bombPos.y,
            range: player.bombRange
        }
    });

    setTimeout(() => {
        handleExplosion(room, player, bombPos.x, bombPos.y);
    }, 3000);
}

export function handleExplosion(room, player, bx, by) {
    player.activeBombs--;

    const range = player.bombRange;
    const map = room.map.map;
    const affectedCells = [];
    const directions = [
        { x: 0, y: 0 },
        { x: 0, y: -1 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 1, y: 0 }
    ];

    affectedCells.push({ x: bx, y: by });
    for (let i = 1; i < directions.length; i++) {
        const dir = directions[i];

        for (let r = 1; r <= range; r++) {
            const tx = bx + (dir.x * r);
            const ty = by + (dir.y * r);

            if (ty < 0 || ty >= map.length || tx < 0 || tx >= map[0].length) break;

            const tile = map[ty][tx];

            if (tile === 1) {
                break;
            } else if (tile === 2) {
                const values = [0, 4, 5, 6, 0];
                const randomNbm = values[Math.floor(Math.random() * values.length)];
                map[ty][tx] = randomNbm;
                affectedCells.push({ x: tx, y: ty });
                break;
            } else {
                affectedCells.push({ x: tx, y: ty });
            }
        }
    }

    room.broadcast({
        type: "explosion",
        fire: affectedCells,
        map: map
    });

    checkPlayerHit(room, affectedCells);
}