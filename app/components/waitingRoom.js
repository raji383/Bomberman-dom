import { createElement } from "../../framework/createjsx.js";
import { connectToServer } from "../web/webSocket.js";
export default function WaitingRoom() {
    // start timers after component mount
    setTimeout(() => {
        if (window.__waitingTimersStarted) return;
        window.__waitingTimersStarted = true;

        let countdown = 10;

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
                }, 500);
            }
        }, 1000);

        // players simulation
        let players = 3;
        setInterval(() => {
            const currentPlayersElement = document.getElementById('currentPlayers');
            const progressFill = document.getElementById('progressFill');
            if (currentPlayersElement && players < 4 && Math.random() > 0.5) {
                players++;
                currentPlayersElement.textContent = players;
                if (progressFill) progressFill.style.width = (players / 4) * 100 + '%';
            }
        }, 3000);

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
                            { tag: "div", attrs: { class: "status-badge" }, children: ["✓ أنت جاهز"] }
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
                                    { tag: "div", attrs: { class: "info-label" }, children: ["👥 عدد اللاعبين"] },
                                    {
                                        tag: "div",
                                        attrs: { class: "info-value players-count" },
                                        children: [
                                            { tag: "span", attrs: { id: "currentPlayers" }, children: ["3"] },
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
                                    { tag: "div", attrs: { class: "info-label" }, children: ["⏰ بدء اللعبة خلال"] },
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
                            { tag: "div", attrs: { class: "progress-fill", id: "progressFill", style: "width: 0%" }, children: [] }
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