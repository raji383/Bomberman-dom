import { variables } from './variables.js';

export function findAvailableRoom() {
    for (const room of variables.rooms.values()) {
        if (!room.gameStarted && room.players.size < 4 && room.startTimer === null) {
            return room;
        }
    }
    return null;
}


export function generateId() {
    return Math.random().toString(36).substr(2, 9);
}