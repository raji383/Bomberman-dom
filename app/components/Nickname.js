import { createElement } from "../../framework/createjsx.js";
import { freamwork } from "../../framework/index.js";
import { push } from "../../framework/route.js";

export default function NicknameScreen() {
  const { playerName } = freamwork.state;

  const handleInput = (e) => {
    freamwork.setState({ playerName: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (playerName && playerName.trim()) {
      connectToServer(playerName.trim());
    }
  };

  return createElement({
    tag: "div",
    attrs: { class: "nickname-screen" },
    children: [
      createElement({
        tag: "h1",
        children: ["💣 Bomberman Multiplayer"]
      }),
      createElement({
        tag: "p",
        attrs: { class: "subtitle" },
        children: ["Rejoins la bataille et sois le dernier survivant!"]
      }),
      createElement({
        tag: "form",
        attrs: { class: "nickname-form" },
        events: { submit: handleSubmit },
        children: [
          createElement({
            tag: "input",
            attrs: {
              type: "text",
              placeholder: "Entre ton pseudo",
              maxlength: "15",
              required: true,
              value: playerName || "",
              autofocus: true
            },
            events: {
              input: handleInput
            }
          }),
          createElement({
            tag: "button",
            attrs: { type: "submit" },
            children: ["🎮 Rejoindre la partie"]
          })
        ]
      }),
      createElement({
        tag: "div",
        attrs: { class: "instructions" },
        children: [
          createElement({
            tag: "h3",
            children: ["🎯 Comment jouer?"]
          }),
          createElement({
            tag: "ul",
            children: [
              createElement({
                tag: "li",
                children: ["👥 2-4 joueurs par partie"]
              }),
              createElement({
                tag: "li", 
                children: ["💣 Place des bombes avec ESPACE"]
              }),
              createElement({
                tag: "li",
                children: ["🎮 Déplace-toi avec les FLÈCHES"]
              }),
              createElement({
                tag: "li",
                children: ["⚡ Collecte les power-ups pour améliorer tes capacités"]
              })
            ]
          })
        ]
      })
    ]
  });
}

function connectToServer(nickname) {
  try {
    const ws = new WebSocket('ws://localhost:8080');
    
    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'join',
        nickname: nickname
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log(' Message serveur:', data.type);
        handleServerMessage(data);
      } catch (error) {
        console.error(' Erreur parsing message:', error);
      }
    };

    ws.onclose = () => {
      console.log('Déconnecté du serveur');
    };

    ws.onerror = (error) => {
      console.error(' Erreur WebSocket:', error);
    };

    freamwork.setState({ ws: ws });
  } catch (error) {
    console.error(' Erreur connexion:', error);
  }
}

function handleServerMessage(data) {  
  switch(data.type) {
    case 'room_assigned':
      console.log(data.chatMessage);     
      freamwork.setState({ 
        roomId: data.roomId,
        myId: data.playerId,
        players: data.players || {},
        messages : data.chatMessage
      });
      push('lobby');
      break;
      
    case 'players_update':
      freamwork.setState({ players: data.players || {} });
      break;
      
    case 'game_start':
      freamwork.setState({ 
        gameStarted: true,
        players: data.players || {},
        walls: new Set(data.walls || []),
        blocks: new Set(data.blocks || []),
        powerups: data.powerups || {},
        bombs: data.bombs || {},
        explosions: new Set(),
      });
      push('game');
      startGameLoop();
      break;
      
    case 'countdown':
      freamwork.setState({ countdown: data.countdown });
      break;
      
    case 'chat_message':
      const messages = [...freamwork.state.messages, data.message];
      freamwork.setState({ messages: messages.slice(-50) });
      break;
      
    case 'player_moved':
      const players = { ...freamwork.state.players };
      if (players[data.playerId]) {
        players[data.playerId].x = data.x;
        players[data.playerId].y = data.y;
        freamwork.setState({ players });
      }
      break;
      
    case 'bomb_placed':
      const bombs = { ...freamwork.state.bombs };
      bombs[data.id] = {
        playerId: data.playerId,
        x: data.x,
        y: data.y,
        timer: data.timer,
        flames: data.flames
      };
      freamwork.setState({ bombs });
      break;
      
    case 'bombs_update':
      freamwork.setState({ bombs: data.bombs || {} });
      break;
      
    case 'explosion':
      freamwork.setState({
        explosions: new Set(data.explosions || []),
        blocks: new Set([...freamwork.state.blocks].filter(b => !data.blocksRemoved?.includes(b))),
        powerups: data.powerups || {},
        players: data.players || freamwork.state.players
      });
      break;
      
    case 'powerup_collected':
      freamwork.setState({
        players: data.players || freamwork.state.players,
        powerups: data.powerups || {}
      });
      break;
      
    case 'player_damage':
      const updatedPlayers = { ...freamwork.state.players };
      if (updatedPlayers[data.playerId]) {
        updatedPlayers[data.playerId].lives = data.lives;
        freamwork.setState({ players: updatedPlayers });
      }
      break;
      
    case 'clear_explosions':
      freamwork.setState({ explosions: new Set() });
      break;
      
    case 'game_over':
      freamwork.setState({ 
        gameStarted: false,
        players: data.players || freamwork.state.players
      });
      break;
      
    default:
      console.log( 'Message inconnu:', data.type);
  }
}

function startGameLoop() {
  //let lastTime = 0;
  let frameCount = 0;
  let lastFpsUpdate = 0;

  function gameLoop(timestamp) {
    const loopId = requestAnimationFrame(gameLoop);
    freamwork.setState({ gameLoopId: loopId });

    // Calcul FPS
    frameCount++;
    if (timestamp >= lastFpsUpdate + 1000) {
      freamwork.setState({ fps: frameCount });
      frameCount = 0;
      lastFpsUpdate = timestamp;
    }

    handleContinuousInput();
  }

  gameLoop();
}

function handleContinuousInput() {
  const { keys, ws, myId, gameStarted } = freamwork.state;  
  if (!ws || !myId || !gameStarted) return;
  ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].forEach(key => {
    if (keys[key]) {
      ws.send(JSON.stringify({
        type: 'player_action',
        action: 'move',
        data: { key: key },
        playerId: myId
      }));
    }
  });
}