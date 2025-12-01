import { createElement } from "../../framework/createjsx.js";
import { freamwork } from "../../framework/index.js";

const GRID_SIZE = 13;
const CELL_SIZE = 40;

export default function GameScreen() {
  const { players, blocks, walls, bombs, powerups, explosions, myId, ws, gameStarted, messages, chatInput = "" } = freamwork.state;

  // Vérifier le gagnant
  const alivePlayers = Object.values(players).filter(p => p.lives > 0);
  const isGameOver = alivePlayers.length <= 1 && gameStarted;
  const winner = isGameOver ? alivePlayers[0] : null;
  const isWinner = winner && winner.id === myId;

  const handleKeyDown = (e) => {
    if (!gameStarted || isGameOver) return;
    
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }
    
    const keys = { ...freamwork.state.keys, [e.key]: true };
    freamwork.setState({ keys });
    
    if (ws) {
      if (e.key === ' ') {
        // Placer une bombe
        const player = players[myId];
        if (player && player.lives > 0) {
          const bombX = Math.floor(player.x);
          const bombY = Math.floor(player.y);
          const bombId = `${bombX},${bombY}`;
          
          // Vérifier le nombre maximum de bombes
          const playerBombs = Object.values(bombs).filter(b => b.playerId === myId).length;
          const maxBombs = player.powerups?.bombs || 1;
          
          if (!bombs[bombId] && playerBombs < maxBombs) {
            ws.send(JSON.stringify({
              type: 'player_action',
              action: 'place_bomb',
              data: {
                x: bombX,
                y: bombY,
                flames: player.powerups?.flames || 1
              },
              playerId: myId
            }));
          }
        }
      }
    }
  };

  const handleKeyUp = (e) => {
    const keys = { ...freamwork.state.keys, [e.key]: false };
    freamwork.setState({ keys });
  };

  // Gestion du chat
  const handleChatInput = (e) => {
    freamwork.setState({ chatInput: e.target.value });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (chatInput.trim() && ws) {
      ws.send(JSON.stringify({
        type: 'chat_message',
        message: chatInput.trim(),
        playerId: myId
      }));
      freamwork.setState({ chatInput: "" });
    }
  };

  // Gestion des événements clavier
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  }

  // Créer la grille de jeu
  const grid = [];
  
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const cellId = `${x},${y}`;
      let cellClass = 'cell pixel-art';
      let cellContent = null;
      
      // Vérifier le contenu de la cellule
      if (walls.has(cellId)) {
        cellClass += ' wall-cell';
        cellContent = createElement({
          tag: "div",
          attrs: { class: "wall pixel-sprite" }
        });
      } else if (blocks.has(cellId)) {
        cellClass += ' block-cell';
        cellContent = createElement({
          tag: "div",
          attrs: { class: "block pixel-sprite" }
        });
      } else if (bombs[cellId]) {
        cellClass += ' bomb-cell';
        cellContent = createElement({
          tag: "div",
          attrs: { class: "bomb pixel-sprite" },
          children: [createElement({
            tag: "span",
            attrs: { class: "bomb-timer" },
            children: [Math.ceil(bombs[cellId].timer)]
          })]
        });
      } else if (explosions.has(cellId)) {
        cellClass += ' explosion-cell';
        cellContent = createElement({
          tag: "div",
          attrs: { class: "explosion pixel-sprite" }
        });
      } else if (powerups[cellId]) {
        cellClass += ' powerup-cell';
        const powerupType = powerups[cellId].type;
        cellContent = createElement({
          tag: "div",
          attrs: { class: `powerup pixel-sprite ${powerupType}` }
        });
      }
      
      // Vérifier les joueurs dans cette cellule
      const playerInCell = Object.values(players).find(p => 
        Math.floor(p.x) === x && Math.floor(p.y) === y && p.lives > 0
      );
      
      if (playerInCell) {
        // Utiliser la couleur du backend
        const playerClass = `player-${playerInCell.index + 1}`;
        const playerColor = playerInCell.color || '#3498db';
        
        cellClass += ` player-cell ${playerClass}`;
        if (playerInCell.id === myId) {
          cellClass += ' current-player';
        }
        
        cellContent = createElement({
          tag: "div",
          attrs: { 
            class: `player pixel-sprite ${playerClass}`,
            style: {
              backgroundColor: playerColor,
              borderColor: playerColor
            }
          }
        });
      }

      grid.push(
        createElement({
          tag: "div",
          attrs: { 
            class: cellClass,
            style: {
              position: 'absolute',
              left: `${x * CELL_SIZE}px`,
              top: `${y * CELL_SIZE}px`,
              width: `${CELL_SIZE}px`,
              height: `${CELL_SIZE}px`
            }
          },
          children: cellContent ? [cellContent] : []
        })
      );
    }
  }

  return createElement({
    tag: "div",
    attrs: { class: "game-screen pixel-theme" },
    children: [
      // Écran de fin de jeu
      isGameOver && createElement({
        tag: "div",
        attrs: { class: "game-over-screen pixel-art" },
        children: [
          createElement({
            tag: "h1",
            attrs: { class: "pixel-text" },
            children: [isWinner ? "🎉 VICTOIRE! 🎉" : "💀 FIN DU JEU"]
          }),
          createElement({
            tag: "p",
            attrs: { class: "pixel-text" },
            children: [winner ? 
              `Félicitations ${winner.nickname}! Tu es le dernier survivant!` :
              "Tous les joueurs sont éliminés!"
            ]
          }),
          createElement({
            tag: "button",
            attrs: { 
              class: "restart-btn pixel-button",
              events: {
                click: () => window.location.reload()
              }
            },
            children: ["🔄 Rejouer"]
          })
        ]
      }),

      // Interface de jeu principale
      createElement({
        tag: "div",
        attrs: { 
          class: "game-container pixel-border",
          style: {
            width: `${GRID_SIZE * CELL_SIZE}px`,
            height: `${GRID_SIZE * CELL_SIZE}px`
          }
        },
        children: grid
      }),
      
      // Interface utilisateur avec chat
      createElement({
        tag: "div",
        attrs: { class: "game-ui pixel-ui" },
        children: [
          createElement({
            tag: "div",
            attrs: { class: "players-panel pixel-panel" },
            children: [
              createElement({
                tag: "h3",
                attrs: { class: "pixel-text" },
                children: ["🎮 Joueurs"]
              }),
              ...Object.values(players).map((player) => {
                const isAlive = player.lives > 0;
                const playerClass = `player-${player.index + 1}`;
                const playerColor = player.color || '#3498db';
                
                return createElement({
                  tag: "div",
                  attrs: { 
                    class: `player-card pixel-card ${playerClass} ${player.id === myId ? 'my-player' : ''} ${!isAlive ? 'dead' : ''}`
                  },
                  children: [
                    createElement({
                      tag: "div",
                      attrs: { 
                        class: "player-header",
                        style: { borderLeft: `4px solid ${playerColor}` }
                      },
                      children: [
                        createElement({
                          tag: "div",
                          attrs: { class: "player-info" },
                          children: [
                            createElement({
                              tag: "div",
                              attrs: { 
                                class: `player-avatar pixel-sprite ${playerClass}`,
                                style: { backgroundColor: playerColor }
                              }
                            }),
                            createElement({
                              tag: "span",
                              attrs: { class: "player-name pixel-text" },
                              children: [
                                player.nickname,
                                player.id === myId && createElement({
                                  tag: "span",
                                  attrs: { class: "you-indicator" },
                                  children: [" (VOUS)"]
                                })
                              ]
                            })
                          ]
                        }),
                        createElement({
                          tag: "span",
                          attrs: { class: "player-lives pixel-text" },
                          children: [
                            isAlive ? "❤️ ".repeat(player.lives) : "💀 ÉLIMINÉ"
                          ]
                        })
                      ]
                    }),
                    isAlive && player.powerups && createElement({
                      tag: "div",
                      attrs: { class: "player-powerups" },
                      children: Object.entries(player.powerups).map(([type, value]) => 
                        createElement({
                          tag: "span",
                          attrs: { class: `powerup-badge pixel-badge ${type}` },
                          children: [`${type === 'bombs' ? '💣' : type === 'flames' ? '🔥' : '⚡'}${value}`]
                        })
                      )
                    })
                  ]
                });
              })
            ]
          }),
          
          createElement({
            tag: "div",
            attrs: { class: "right-panel" },
            children: [
              createElement({
                tag: "div",
                attrs: { class: "game-info pixel-panel" },
                children: [
                  createElement({
                    tag: "div",
                    attrs: { class: "fps-counter pixel-text" },
                    children: [`📊 FPS: ${Math.round(freamwork.state.fps)}`]
                  }),
                  createElement({
                    tag: "div",
                    attrs: { class: "controls-info pixel-text" },
                    children: [
                      createElement({
                        tag: "p",
                        children: ["🎮 Flèches = Déplacement"]
                      }),
                      createElement({
                        tag: "p", 
                        children: ["␣ Espace = Bombe"]
                      })
                    ]
                  })
                ]
              }),
               // chat 
              createElement({
                tag: "div",
                attrs: { class: "chat-section pixel-panel" },
                children: [
                  createElement({
                    tag: "h3",
                    attrs: { class: "pixel-text" },
                    children: ["💬 Chat en jeu"]
                  }),
                  createElement({
                    tag: "div",
                    attrs: { class: "chat-messages" },
                    children: messages.length === 0 ? 
                      createElement({
                        tag: "p",
                        attrs: { class: "pixel-text" },
                        children: ["Aucun message..."]
                      }) :
                      messages.map((msg) => 
                        createElement({
                          tag: "div",
                          attrs: { 
                            class: `message ${msg.isSystem ? 'system' : ''} ${msg.player === players[myId]?.nickname ? 'own' : ''} pixel-text`
                          },
                          children: [
                            createElement({
                              tag: "strong",
                              children: [`${msg.player}: ${msg.text} `]
                            }),
                            
                          ]
                        })
                      )
                  }),
                  createElement({
                    tag: "form",
                    attrs: { class: "chat-form" },
                    events: { submit: handleSendMessage ,},
                    children: [
                      createElement({
                        tag: "input",
                        attrs: {
                          type: "text",
                          placeholder: "Tape ton message...",
                          maxlength: "100",
                          value: chatInput,
                          class: "pixel-input"
                        },
                        events: {
                          input: handleChatInput
                        }
                      }),
                      createElement({
                        tag: "button",
                        attrs: { 
                          type: "submit",
                          class: "pixel-button"
                        },
                        children: ["📤"]
                      })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });
}