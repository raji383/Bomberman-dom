import { createElement } from "../../framework/createjsx.js";
import { freamwork } from "../../framework/index.js";
import { push } from "../../framework/route.js";
import { Boomb } from "./Boomb.js";
import { Players } from "./Players.js";
import { variables } from "../../variables.js";

export default function GameScreen() {
    const { messages, chatInput = "", ws, players, myId, boombs = [], explosion = [], map } = freamwork.state;

    // Redirect if websocket is not connected
    if (!ws) push('/');

    // Initialize Players instance if not present
    if (!freamwork.state.player) {
        freamwork.state.player = new Players(players);
    }

    // Chat input handler
    const handleChatInput = (e) => {
        freamwork.setState({ chatInput: e.target.value });
    };

    // Chat message send handler
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (chatInput.trim() && ws) {
            ws.send(JSON.stringify({
                type: 'chat_message',
                message: chatInput.trim(),
                playerId: myId
            }));
            freamwork.setState({ chatInput: "" });

            // Scroll chat to bottom
            const chatSection = e.target.parentElement;
            if (chatSection) {
                const chatMessages = chatSection.querySelector('.chat-messages');
                if (chatMessages) {
                    setTimeout(() => {
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    }, 100);
                }
            }
        }
    };

    // Render the entire game screen
    return createElement({
        tag: "div",
        attrs: { class: "game-container" },
        children: [
            // Game area
            createElement({
                tag: "div",
                attrs: { class: "game-area" },
                children: [
                    RenderMap(map),
                    // Players
                    ...freamwork.state.player.list.map((p) => p.draw()),
                    // Bombs
                    ...boombs.map((b) => b.draw()),
                    // Explosions
                    ...explosion.map((ex) => ex.draw ? ex.draw() : ex),
                    // Chat
                    RenderChat(messages, chatInput, handleChatInput, handleSendMessage, myId)
                ]
            })
        ]
    });
}

// Render the game map tiles
function RenderMap(map) {
    const result = [];
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            result.push(MapDraw(map[y][x], x, y));
        }
    }
    return result;
}

// Map tile renderer
function MapDraw(tileType, x, y) {
    let image = "";
    if (tileType === 1) image = "./tools/wall.png";
    else if (tileType === 0 || tileType === 3) image = "./tools/grass.png";
    else if (tileType === 2) image = "./tools/box.png";

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

// Chat section renderer
function RenderChat(messages, chatInput, handleChatInput, handleSendMessage, myId) {
    return createElement({
        tag: "div",
        attrs: { class: "chat-section" },
        children: [
            createElement({ tag: "h3", children: ["💬 Chat"] }),
            createElement({
                tag: "div",
                attrs: { class: "chat-messages" },
                children: messages.length === 0
                    ? [createElement({ tag: "p", children: ["No messages..."] })]
                    : messages.map((msg) =>
                        createElement({
                            tag: "div",
                            attrs: {
                                class: `message ${msg.isSystem ? 'system' : ''} ${msg.player === freamwork.state.players[myId]?.nickname ? 'own' : ''}`
                            },
                            children: [createElement({ tag: "strong", children: [`${msg.player}: ${msg.text}`] })]
                        })
                    )
            }),
            createElement({
                tag: "form",
                attrs: { class: "chat-form" },
                events: { submit: handleSendMessage },
                children: [
                    createElement({
                        tag: "input",
                        attrs: {
                            type: "text",
                            placeholder: "Type your message...",
                            maxlength: "100",
                            value: chatInput
                        },
                        events: { input: handleChatInput }
                    }),
                    createElement({
                        tag: "button",
                        attrs: { type: "submit" },
                        children: ["📤 Send"]
                    })
                ]
            })
        ]
    });
}
