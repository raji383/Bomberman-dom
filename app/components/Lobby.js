import { createElement } from "../../framework/createjsx.js";
import { freamwork } from "../../framework/index.js";
import { push } from "../../framework/route.js";

export default function LobbyScreen() {
  const { players, countdown, roomId, messages, chatInput = "", ws } = freamwork.state;
  if (!ws) {
    push('/');
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

  const playerCount = Object.keys(players).length;
  const isFull = playerCount >= 4;

  return createElement({
    tag: "div",
    attrs: { class: "lobby-screen" },
    children: [
      createElement({
        tag: "h1",
        children: ["💣 Game Lobby"]
      }),

      createElement({
        tag: "div",
        attrs: { class: "lobby-info" },
        children: [
          createElement({ tag: "p", children: [`🏠 Room: ${roomId || 'Loading...'}`] }),
          createElement({ tag: "p", children: [`👥 Players: ${playerCount}/4`] }),
          countdown !== null && createElement({
            tag: "p",
            attrs: { class: "countdown" },
            children: [`⏰ Starting in: ${countdown} seconds`]
          }),
          !countdown && playerCount < 2 && createElement({
            tag: "p",
            attrs: { class: "waiting" },
            children: ["⏳ Waiting for players..."]
          }),
          !countdown && playerCount >= 2 && !isFull && createElement({
            tag: "p",
            attrs: { class: "waiting" },
            children: ["🚀 Auto-start in 20 seconds..."]
          }),
          isFull && createElement({
            tag: "p",
            attrs: { class: "full" },
            children: ["✅ Room full! Starting soon..."]
          })
        ]
      }),

      createElement({
        tag: "div",
        attrs: { class: "players-section" },
        children: [
          createElement({ tag: "h3", children: ["🎮 Connected Players"] }),
          createElement({
            tag: "div",
            attrs: { class: "players-grid" },
            children: playerCount === 0
              ? createElement({ tag: "p", children: ["No players yet..."] })
              : Object.values(players).map((player, index) =>
                createElement({
                  tag: "div",
                  attrs: {
                    class: `player-card ${player.id === freamwork.state.myId ? 'my-player' : ''}`
                  },
                  children: [
                    createElement({
                      tag: "div",
                      attrs: { class: "player-avatar", style: { backgroundColor: player.color } },
                      children: [`P${index + 1}`]
                    }),
                    createElement({
                      tag: "div",
                      attrs: { class: "player-info" },
                      children: [
                        createElement({ tag: "strong", children: [player.nickname] }),
                        player.id === freamwork.state.myId && createElement({
                          tag: "span",
                          attrs: { class: "you-badge" },
                          children: [" (YOU)"]
                        })
                      ]
                    })
                  ]
                })
              )
          })
        ]
      }),

      // Chat
      createElement({
        tag: "div",
        attrs: { class: "chat-section" },
        children: [
          createElement({ tag: "h3", children: ["💬 Chat"] }),
          createElement({
            tag: "div",
            attrs: { class: "chat-messages" },
            events: {
              created: (element) => { scrollToBottom(element); },
              updated: (element) => { scrollToBottom(element); }
            },
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
      })
    ]
  });
}
