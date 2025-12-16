import { createElement } from "../../framework/createjsx.js";
import { freamwork } from "../../framework/index.js";
import { push } from "../../framework/route.js";
import { Players } from "./Players.js";
import { variables } from "../../variables.js";
export default function GameScreen() {
    const { messages, chatInput = "", ws, myId, model_chat, winner } = freamwork.state;
    if (!ws) {
        push('/')
    }
    const handleChatInput = (e) => {
        freamwork.setState({ chatInput: e.target.value });
    };
    const handleSendMessage = (e) => {
        e.preventDefault();

        if (chatInput.trim()) {
            if (chatInput.trim().length <= 100 && freamwork.state.ws) {
                freamwork.state.ws.send(JSON.stringify({
                    type: 'chat_message',
                    message: chatInput.trim(),
                    playerId: freamwork.state.myId
                }));
                freamwork.setState({ chatInput: "" });

                const form = e.target;
                const chatSection = form.parentElement;

                if (chatSection) {
                    const chatMessages = chatSection.children[1];
                    if (chatMessages && chatMessages.classList.contains('chat-messages')) {
                        setTimeout(() => {
                            chatMessages.scrollTop = chatMessages.scrollHeight;
                        }, 100);
                    }
                }
            }
        }

    };
    if (!freamwork.state.player || freamwork.state.player.list.length == 0) {
        freamwork.state.player = new Players(freamwork.state.players)
    }
    return createElement({
        tag: "div",
        attrs: { class: "game-container" },
        children: [
            createElement({
                tag: "div",
                attrs: { class: "game-area" },
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

                        children: [
                            {
                                tag: "h1",
                                children: [`${winner ? "you win " : "hhhh you lose"}`]

                            },

                            // {
                            //     tag: "h1",
                            //     children: [`${freamwork.state.gameOver}`]
                            // },
                            {
                                tag: "button",
                                attrs: {
                                    class: "restartBtn",

                                },
                                events: {
                                    click: () => {
                                        location.reload()
                                    }
                                },
                                children: ["Rejouer"]
                            }
                        ]
                    })
                ]
            }),
            createElement({
                tag: "button",
                attrs: { class: "model-chat" },
                events: {
                    click: () => {
                        freamwork.setState({ model_chat: !freamwork.state.model_chat });
                    }
                },
                children: [model_chat ? "❌ Close" : "✅ Open"]
            }),
            , (model_chat) && (RenderChat(messages, chatInput, handleChatInput, handleSendMessage, myId))

        ]
    })

}
function RenderChat(messages, chatInput, handleChatInput, handleSendMessage, myId) {
    return createElement({
        tag: "div",
        attrs: { class: "chat-section", tabindex: "0" },

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
                                class: `message ${msg.isSystem ? 'system' : ''}`
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
function RenderMap() {
    if (!freamwork.state.map) return
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
    else if (mapElement === 4) image = "./tools/energy.png";
    else if (mapElement === 5) image = "./tools/bombNbr.png";
    else if (mapElement === 6) image = "./tools/bombRange.png";

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
                                    { tag: "span", children: [String(player.lives)] },
                                    ...(!player.alive
                                        ? [{ tag: "span", children: ["die"] }]
                                        : [])
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
                            },
                            {
                                tag: "div",
                                attrs: { class: "statItem" },
                                children: [
                                    { tag: "span", children: ["🎯"] },
                                    { tag: "span", children: [`${player.power}`] }
                                ]
                            }
                        ]
                    }
                ]
            }
        })
    }
}

