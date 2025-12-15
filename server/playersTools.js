import { variables } from '../variables.js';
export function handlePlayerMove(ws, data) {
    const player = Array.from(variables.players.values()).find(p => p.ws === ws);
    if (!player || !player.roomId) return;

    player.update(data.direction, data.delta);

    const room = variables.rooms.get(player.roomId);
    if (!room) return;

    room.broadcast({
        type: "playerMove",
        id: player.id,
        x: player.x,
        y: player.y,
        direction: data.direction,
        playerId: data.playerId,
        map: room.map.map,
        range: player.bombRange,
        speed: player.speed,
        bomb: player.maxBombs
    });
}

export function handlePlayerWin(ws, data) {
    const player = Array.from(variables.players.values()).find(p => p.ws === ws);
    if (!player || !player.roomId) return;
    const room = variables.rooms.get(player.roomId);
    if (!room) return;
    room.broadcast({
        type: data.type,
        message: data.message,
        id: data.playerId
    });
}

export function checkPlayerHit(room, fireCells) {
    room.players.forEach(p => {
        const pGx = Math.floor((p.x + p.size / 2) / p.cell);
        const pGy = Math.floor((p.y + p.size / 2) / p.cell);

        const isHit = fireCells.some(cell => cell.x === pGx && cell.y === pGy);

        if (isHit && p.candie) {
            p.candie = false
            setTimeout(() => {
                p.candie = true
            }, 3000)
            p.x = p.initialX
            p.y = p.initialY
            room.broadcast({
                type: "player_died",
                id: p.id,
                x: p.x,
                y: p.y
            });
        }
    });
}