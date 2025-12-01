import { freamwork } from "../../framework/index.js";

export function connectToServer(name) {
    try {
        const ws = new WebSocket('ws://localhost:3000');

        ws.onopen = () => {
            console.log('Connected to server', name);
            ws.send(JSON.stringify({ type: 'join', nickname: name }));
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('Server message:', data.type, data);

                // handle players update broadcast from server
                if (data.type === 'players') {
                    // update framework state (players count and list)
                    try {
                        freamwork.setState({ players: data.count, playersList: data.players, playerName: data.players });
                    } catch (e) {
                        console.warn('Failed to set framework state for players', e);
                    }

                    // update DOM if present
                    const el = document.getElementById('currentPlayers');
                    const progress = document.getElementById('progressFill');
                    if (el) el.textContent = String(data.count);
                    if (progress && typeof data.count === 'number') {
                        progress.style.width = (data.count / (data.max || 4)) * 100 + '%';
                    }
                    return;
                }

                if (data.type === 'joined') {
                    console.log('You joined as', data.nickname);
                    return;
                }
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
