
let audioCtx = null;

function getAudioCtx() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
}


const FREQUENCIES = {
    green:  261.63,  // C4
    red:    329.63,  // E4
    yellow: 392.00,  // G4
    blue:   523.25,  // C5
    error:  110.00
};

function playTone(color, duration = 0.5) {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;

    
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter   = ctx.createBiquadFilter();
    const reverb    = ctx.createConvolver();

    const isError = color === 'error';

    osc1.type = isError ? 'sawtooth' : 'sine';
    osc2.type = isError ? 'square'   : 'triangle';

    const freq = FREQUENCIES[color];
    osc1.frequency.value = freq;
    osc2.frequency.value = freq * (isError ? 0.5 : 1.008);

    filter.type            = 'lowpass';
    filter.frequency.value = isError ? 350 : 2200;
    filter.Q.value         = isError ? 4   : 1;

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.22, now + 0.05);
    gainNode.gain.setValueAtTime(0.18, now + duration * 0.4);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
}

function playSuccessJingle() {
    
    const ctx = getAudioCtx();
    const notes = [261.63, 329.63, 392.00, 523.25];
    notes.forEach((freq, i) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        const now  = ctx.currentTime + i * 0.1;
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
    });
}

const COLORS = ['green', 'red', 'yellow', 'blue'];

const COLOR_EMOJIS = {
    green:  '🟢',
    red:    '🔴',
    yellow: '🟡',
    blue:   '🔵'
};

const KEYBOARD_MAP = {
    'q': 'green',  'a': 'green',
    'e': 'red',    'd': 'red',
    'z': 'yellow', 'x': 'yellow',
    'c': 'blue',   'v': 'blue'
};

let state = {
    sequence:       [],
    playerSequence: [],
    level:          1,
    highscore:      0,
    speed:          900,
    isActive:       false,
    isPlaying:      false  
};

function loadHighscore() {
    state.highscore = parseInt(localStorage.getItem('simon_highscore') || '0', 10);
    updateHighscoreUI();
}

function saveHighscore(val) {
    state.highscore = Math.max(state.highscore, val);
    localStorage.setItem('simon_highscore', state.highscore);
    updateHighscoreUI();
}

function updateHighscoreUI() {
    document.getElementById('hud-highscore').textContent = state.highscore;
    document.getElementById('highscore-go').textContent  = state.highscore;
}

function showStart() {
    document.getElementById('start-overlay').classList.remove('d-none');
    document.getElementById('gameover-overlay').classList.add('d-none');
    document.getElementById('game-header').classList.add('d-none');
    document.getElementById('game-main').classList.add('d-none');
    loadHighscore();
}

function showGame() {
    document.getElementById('start-overlay').classList.add('d-none');
    document.getElementById('gameover-overlay').classList.add('d-none');
    document.getElementById('game-header').classList.remove('d-none');
    document.getElementById('game-main').classList.remove('d-none');
}

function showGameOver() {
    const wasRecord = state.level - 1 > state.highscore;
    saveHighscore(state.level - 1);

    document.getElementById('final-level').textContent = state.level - 1;
    document.getElementById('highscore-go').textContent = state.highscore;

    const badge = document.getElementById('new-record-badge');
    if (wasRecord && state.level - 1 > 0) {
        badge.classList.remove('d-none');
    } else {
        badge.classList.add('d-none');
    }

    document.getElementById('gameover-overlay').classList.remove('d-none');
    document.getElementById('game-header').classList.add('d-none');
    document.getElementById('game-main').classList.add('d-none');
}


function startGame() {
    getAudioCtx();

    state.sequence       = [];
    state.playerSequence = [];
    state.level          = 1;
    state.speed          = 900;
    state.isActive       = false;
    state.isPlaying      = false;

    showGame();
    updateHUD('¡Atento!', 1);
    setStatus('¡Listo!', '');

    setTimeout(playRound, 800);
}

function playRound() {
    blockInput(true);
    state.playerSequence = [];

    state.sequence.push(COLORS[Math.floor(Math.random() * COLORS.length)]);

    state.speed = Math.max(280, 900 - (state.level - 1) * 45);

    updateHUD('Observa...', state.level);
    setStatus('Observando...', 'observa');
    updateProgressDots(0);

    setSequenceBar(0);

    let i = 0;
    const gap = state.speed + 80;

    const interval = setInterval(() => {
        flashPad(state.sequence[i], true);
        i++;
        setSequenceBar((i / state.sequence.length) * 100);

        if (i >= state.sequence.length) {
            clearInterval(interval);
            setTimeout(() => {
                blockInput(false);
                updateHUD('¡Tu turno!', state.level);
                setStatus('¡Tu turno!', 'turno');
            }, gap);
        }
    }, gap);
}

function flashPad(color, isSimon) {
    const pad = document.getElementById(`pad-${color}`);
    const cls = isSimon ? 'playing' : 'active';
    pad.classList.add(cls);
    playTone(color, state.speed / 1000 * 0.8);
    lightHint(color);

    const duration = isSimon ? state.speed * 0.65 : 200;
    setTimeout(() => {
        pad.classList.remove(cls);
        unlightHint(color);
    }, duration);
}

function handleInput(color) {
    if (!state.isActive) return;

    flashPad(color, false);

    state.playerSequence.push(color);
    const idx = state.playerSequence.length - 1;

    updateProgressDots(idx + 1);

    if (state.playerSequence[idx] !== state.sequence[idx]) {
        triggerGameOver();
        return;
    }

    if (state.playerSequence.length === state.sequence.length) {
        blockInput(true);
        setStatus('¡Genial!', 'genial');
        updateHUD('¡Genial! 🎉', state.level);

        playSuccessJingle();
        animateLevelUp();

        state.level++;
        updateHUD('¡Atento!', state.level);

        setTimeout(playRound, 1200);
    }
}

function triggerGameOver() {
    blockInput(true);
    state.isActive = false;

    playTone('error', 1.2);
    setStatus('¡Error!', 'error');
    updateHUD('¡Ups! 💀', state.level);

    document.body.classList.add('flash-red');
    setTimeout(() => document.body.classList.remove('flash-red'), 700);

    setTimeout(showGameOver, 1500);
}

function updateHUD(msg, level) {
    document.getElementById('hub-msg').textContent   = msg;
    document.getElementById('hub-level').textContent = level;
    document.getElementById('hud-level').textContent = level;
}

function setStatus(text, type) {
    const pill = document.getElementById('status-pill');
    document.getElementById('status-text').textContent = text;
    pill.className = 'status-pill';
    if (type) pill.classList.add(type);
}

function setSequenceBar(pct) {
    document.getElementById('sequence-bar').style.width = pct + '%';
}

function updateProgressDots(filled) {
    const container = document.getElementById('progress-dots');
    const total     = state.sequence.length;
    container.innerHTML = '';

    for (let i = 0; i < total; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        if (i < filled) {
            const correctColor = state.playerSequence[i] === state.sequence[i];
            dot.classList.add(correctColor ? 'correct' : 'wrong');
        }
        container.appendChild(dot);
    }
}

function animateLevelUp() {
    const el = document.getElementById('hub-level');
    el.classList.remove('level-up');
    void el.offsetWidth; // reflow para reiniciar animación
    el.classList.add('level-up');
    setTimeout(() => el.classList.remove('level-up'), 500);
}

function lightHint(color) {
    const el = document.getElementById(`hint-${color}`);
    if (el) el.classList.add('lit');
}
function unlightHint(color) {
    const el = document.getElementById(`hint-${color}`);
    if (el) el.classList.remove('lit');
}

function blockInput(block) {
    const layer = document.getElementById('block-layer');
    layer.style.display = block ? 'block' : 'none';
    state.isActive = !block;
}

function showToast(msg, bg = 'bg-secondary') {
    const toastEl = document.getElementById('game-toast');
    document.getElementById('toast-msg').textContent = msg;
    toastEl.className = `toast align-items-center border-0 text-white ${bg}`;
    const toast = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 2000 });
    toast.show();
}

function createParticles(containerId) {
    const emojis    = ['🎵', '🎶', '🎹', '🎸', '🎷', '🎺', '🥁', '🎼'];
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    for (let i = 0; i < 18; i++) {
        const p = document.createElement('div');
        p.className   = 'particle';
        p.textContent = emojis[Math.floor(Math.random() * emojis.length)];

        const left     = Math.random() * 100;
        const delay    = Math.random() * 12;
        const duration = 8 + Math.random() * 10;
        const size     = 0.8 + Math.random() * 1.2;

        p.style.cssText = `
            left: ${left}%;
            animation-delay: ${delay}s;
            animation-duration: ${duration}s;
            font-size: ${size}rem;
        `;
        container.appendChild(p);
    }
}

document.addEventListener('keydown', (e) => {
    const color = KEYBOARD_MAP[e.key.toLowerCase()];
    if (color) handleInput(color);

    if ((e.key === 'Enter' || e.key === ' ') && 
        !document.getElementById('start-overlay').classList.contains('d-none')) {
        startGame();
    }
    if ((e.key === 'Enter' || e.key === ' ') &&
        !document.getElementById('gameover-overlay').classList.contains('d-none')) {
        startGame();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadHighscore();
    createParticles('particles-start');
});
