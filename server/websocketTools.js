import { variables} from './variables.js';
import { handleJoin, handleChatMessage } from './joinAndChat.js';
import { handlePlayerMove, handlePlayerWin } from './playersTools.js';
import { handleBommb } from './bombsTools.js';
import { GameRoom } from './index.js';
import { Player } from './index.js';
import { generateId } from './func.js';

export function handleMessage(ws, data) {
    switch (data.type) {
        case 'join':
            handleJoin(ws, data);
            break;
        case 'chat_message':
            handleChatMessage(ws, data);
            break;
        case 'playerMove':
            handlePlayerMove(ws, data)
            break
        case 'playerStop':
            const player = Array.from(variables.players.values()).find(p => p.ws === ws);
            if (!player || !player.roomId) return;

            const room = variables.rooms.get(player.roomId);
            if (!room) return;

            room.broadcast({
                type: "playerStop",
                playerId: player.id
            });
            break
        case 'boomb':
            handleBommb(ws, data)
            break
        case 'winning':
            handlePlayerWin(ws, data)
            break
        default:
            console.log('Unknown message type:', data.type);
    }
}

export function handleJoin(ws, data) {

    const playerId = generateId();
    const id = playerId
    const nickname = data.nickname
    const roomId = null
    let room = findAvailableRoom();

    if (!room) {
        const newRoomId = generateId();
        room = new GameRoom(newRoomId);
        variables.rooms.set(newRoomId, room);
    }
    let x = 1
    let y = 1
    const player = new Player(x, y, id, nickname, roomId, ws, room, data.cell)

    variables.players.set(playerId, player);

    room.addPlayer(player);
    player.roomId = room.id;


    ws.send(JSON.stringify({
        type: 'room_assigned',
        roomId: room.id,
        playerId: playerId,
        players: room.getPlayersList(),
        chatMessage: room.chatMessage
    }));

}


export function handleChatMessage(ws, data) {
    const player = Array.from(variables.players.values()).find(p => p.ws === ws);
    if (!player || !player.roomId) return;

    const room = variables.rooms.get(player.roomId);
    if (!room) return;

    const chatMessage = {
        player: player.nickname,
        text: data.message,
        timestamp: Date.now(),
        isSystem: false
    };
    room.chatMessage.push({
        player: player.nickname,
        text: data.message,
        timestamp: Date.now(),
        isSystem: false
    })

    room.broadcast({
        type: 'chat_message',
        message: chatMessage
    });
}