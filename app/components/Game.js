import { createElement } from "../../framework/createjsx.js";
import { freamwork } from "../../framework/index.js";
import { push, router } from "../../framework/route.js";
import { Boomb } from "./Boomb.js";
import { Players } from "./Players.js";
import { variables } from "../../variables.js";
var d = true




export default function GameScreen() {
    const { messages, chatInput = "", ws } = freamwork.state
    if (!ws) {
        push('/');
    }
    if (!freamwork.state.player) {
        freamwork.state.player = new Players(freamwork.state.players)
    }
    const handleChatInput = (e) => {
    freamwork.setState({ chatInput: e.target.value });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (chatInput.trim() && freamwork.state.ws) {
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
  };

    return createElement({
        tag: "div",
        attrs: { class: "map" },
        children: [
             {tag : "div", attrs: {class: "game-area"}, children:   [createElement({
        tag: "div",
        attrs: { class: "chat-section" },
        children: [
          createElement({ tag: "h3", children: ["💬 Chat"] }),
          createElement({
            tag: "div",
            attrs: { class: "chat-messages" },
            children: messages.length === 0
              ? createElement({ tag: "p", children: ["No messages..."] })
              : messages.map((msg, index) =>
                createElement({
                  tag: "div",
                  attrs: {
                    class: `message ${msg.isSystem ? 'system' : ''} ${msg.player === freamwork.state.players[freamwork.state.myId]?.nickname ? 'own' : ''}`
                  },
                  children: [createElement({ tag: "strong", children: [`${msg.player}: ${msg.text}`] })]
                })
              )
          }),
          createElement({
            tag: "form",
            attrs: { class: "chat-form" },
            events: { submit:   handleSendMessage },
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
   
    })]},
          

            RenderMap(),
            { tag: "div", children: freamwork.state.player.list.map((p) => { return p.draw() }) },
            freamwork.state.boombs.map((p) => { return p.draw() }),
            freamwork.state.explosion.map((ex) => { return ex }),
        ]
    });
          

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
