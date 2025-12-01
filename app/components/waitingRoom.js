import { createElement } from "../../framework/createjsx.js";
import { connectToServer } from "../web/webSocket.js";
import { freamwork } from "../../framework/index.js";
export default function WaitingRoom() {
    // start timers after component mount

    setTimeout(() => {
        if (window.__waitingTimersStarted) return;
        window.__waitingTimersStarted = true;

        let countdown = 10;
        console.log(freamwork.state);

        const countdownTimer = setInterval(() => {
            const countdownElement = document.getElementById('countdown');
            const progressFill = document.getElementById('progressFill');
            if (countdownElement) countdown--;
            if (countdownElement) countdownElement.textContent = countdown;

            // update progress bar
            if (progressFill) {
                const progress = ((10 - countdown) / 10) * 100;
                progressFill.style.width = Math.max(0, Math.min(100, progress)) + '%';
            }

            if (countdown <= 0) {
                clearInterval(countdownTimer);
                if (countdownElement) {
                    countdownElement.textContent = 'Start!';
                    countdownElement.style.color = '#4cd137';
                }
                setTimeout(() => {
                    alert('🎮 The game is starting now!');
                            console.log(freamwork.state);

                }, 500);
            }
        }, 1000);

        // player count is managed by the server; UI will update from freamwork.state when broadcasts arrive

        // tips rotation
        const tips = [
            'Use bombs to destroy crates and find power-ups!',
            'Beware of getting trapped by your own bombs!',
            'Collect speed items to outrun your opponents!',
            'Increasing bomb power makes explosions larger!',
            'Use walls as cover from enemy explosions!'
        ];

        let tipIndex = 0;
        setInterval(() => {
            const tipElement = document.getElementById('tipText');
            if (!tipElement) return;
            tipIndex = (tipIndex + 1) % tips.length;
            tipElement.style.opacity = '0';
            setTimeout(() => {
                tipElement.textContent = tips[tipIndex];
                tipElement.style.opacity = '1';
            }, 300);
        }, 5000);
        const t = document.getElementById('tipText');
        if (t) t.style.transition = 'opacity 0.3s';
    }, 0);

    // compute players and progress from framework state so re-renders show correct values
    const playersCount = typeof freamwork.state.players === 'number'
        ? freamwork.state.players
        : (Array.isArray(freamwork.state.playerName) ? freamwork.state.playerName.length : 0);
    const maxPlayers = freamwork.state.maxPlayers || 4;
    const progressWidth = `${Math.max(0, Math.min(100, (playersCount / maxPlayers) * 100))}%`;

    return createElement({
        tag: "div",
        attrs: { class: "container" },
        children: [
            {
                tag: "div",
                attrs: { class: "header" },
                children: [
                    { tag: "div", attrs: { class: "title" }, children: ["💣 BOMBERMAN"] },
                    { tag: "div", attrs: { class: "subtitle" }, children: ["Waiting Room"] }
                ]
            },
            {
                tag: "div",
                attrs: { class: "main-content" },
                children: [
                    {
                        tag: "div",
                        attrs: { class: "character-section" },
                        children: [
                            {
                                tag: "div",
                                attrs: { class: "character" },
                                children: [
                                    {
                                        tag: "div",
                                        attrs: { class: "head" },
                                        children: [
                                            {
                                                tag: "div",
                                                attrs: { class: "eyes" },
                                                children: [
                                                    { tag: "div", attrs: { class: "eye" }, children: [] },
                                                    { tag: "div", attrs: { class: "eye" }, children: [] }
                                                ]
                                            },
                                            { tag: "div", attrs: { class: "mouth" }, children: [] }
                                        ]
                                    },
                                ]
                            },
                            { tag: "div", attrs: { class: "status-badge" }, children: ["✓ You are ready"] }
                        ]
                    },
                    {
                        tag: "div",
                        attrs: { class: "info-section" },
                        children: [
                            {
                                tag: "div",
                                attrs: { class: "info-card" },
                                children: [
                                    { tag: "div", attrs: { class: "info-label" }, children: ["👥 Players"] },
                                    {
                                        tag: "div",
                                        attrs: { class: "info-value players-count" },
                                        children: [
                                            { tag: "span", attrs: { id: "currentPlayers" }, children: [String(playersCount)] },
                                            " / ",
                                            { tag: "span", attrs: { id: "maxPlayers" }, children: ["4"] }
                                        ]
                                    }
                                ]
                            },
                            {
                                tag: "div",
                                attrs: { class: "info-card" },
                                children: [
                                    { tag: "div", attrs: { class: "info-label" }, children: ["⏰ Game starts in"] },
                                    { tag: "div", attrs: { class: "info-value countdown", id: "countdown" }, children: ["10"] }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                tag: "div",
                attrs: { class: "progress-section" },
                children: [
                    {
                        tag: "div",
                        attrs: { class: "progress-bar" },
                            children: [
                                { tag: "div", attrs: { class: "progress-fill", id: "progressFill", style: `width: ${progressWidth}` }, children: [] }
                            ]
                    },
                    {
                        tag: "div",
                        attrs: { class: "waiting-dots" },
                        children: ["Waiting for players", { tag: "span", children: ["."] }, { tag: "span", children: ["."] }, { tag: "span", children: ["."] }]
                    }
                ]
            },
            {
                tag: "div",
                attrs: { class: "tips" },
                children: [
                    { tag: "div", attrs: { class: "tips-title" }, children: ["💡 Game Tip"] },
                    { tag: "div", attrs: { class: "tips-text", id: "tipText" }, children: ["Use bombs to destroy crates and find power-ups!"] }
                ]
            }
        ]
    }
    );
}