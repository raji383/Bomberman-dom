import { freamwork } from "../../framework/index.js";
import { render } from "../../framework/render.js";

export function connectToServer(name) {
    try {
        const ws = new WebSocket('ws://localhost:8080/ws');

        ws.onopen = () => {
            console.log('Connected to server', name);
            ws.send(JSON.stringify({ type: 'join', nickname: name }));
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('Server message:', data.type, data);
                if (data.type === 'players') {
                    try {
                        freamwork.setState({ players: data.count, playersList: data.players, playerName: data.players });
                        freamwork.state.playerName.push(name);
                        render()
                    } catch (e) {
                        console.warn('Failed to set framework state for players', e);
                    }

                }
            } catch (err) {
                console.warn('Failed to parse WS message', err);
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
