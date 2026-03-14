
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const livesEl = document.getElementById('lives-display');
const feedbackEl = document.getElementById('feedback-msg');
const micStatus = document.getElementById('mic-status');


const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const winScreen = document.getElementById('win-screen');


function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();


let gameRunning = false;
let score = 0;
let lives = 10;
let level = 1;
let gameSpeed = 3;
let isGameOver = false;

const player = {
    x: 0, y: 0, 
    width: 40, height: 40,
    speed: 6,
    color: '#00d2d3',
    vx: 0, vy: 0
};

let obstacles = [];
let stars = [];
const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };

// --- SISTEMA DE AUDIO ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const Sound = {
    playTone: (freq, type, duration) => {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    },
    collect: () => Sound.playTone(880, 'sine', 0.1), // Sonido agudo
    hit: () => {
        Sound.playTone(150, 'sawtooth', 0.3); // Sonido grave
        Sound.playTone(100, 'sawtooth', 0.3);
    },
    win: () => {
        [523, 659, 783, 1046].forEach((f, i) => setTimeout(() => Sound.playTone(f, 'square', 0.2), i * 150));
    }
};

const Voice = {
    speak: (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); 
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'es-ES';
            utterance.rate = 1.1;
            window.speechSynthesis.speak(utterance);
        }
    }
};

// --- NIVELES Y VIDAS ---
function updateLivesDisplay() {
    livesEl.innerHTML = '❤️'.repeat(lives);
}

function checkLevelProgression() {
    let prevLevel = level;
    
    if (score >= 100) {
        level = 4; // Ganó
    } else if (score >= 50) {
        level = 3;
    } else if (score >= 20) {
        level = 2;
    } else {
        level = 1;
    }

    
    if (level > prevLevel) {
        gameSpeed += 2; // Aumentar dificultad
        Voice.speak(`¡Subiendo al nivel ${level}!`);
        showFeedback(`¡NIVEL ${level}!`);
        Sound.win(); // Pequeña fanfarria
    }

    
    if (level === 4) {
        gameRunning = false;
        Sound.win();
        Voice.speak("¡Felicidades, ganaste el juego!");
        winScreen.classList.remove('hidden');
    }

    levelEl.innerText = level;
}

function takeDamage() {
    lives--;
    updateLivesDisplay();
    Sound.hit();
    canvas.style.filter = "brightness(0.5) sepia(1) hue-rotate(-50deg) saturate(3)";
    setTimeout(() => canvas.style.filter = "none", 200);

    if (lives <= 0) {
        gameRunning = false;
        Voice.speak("Game Over. Inténtalo de nuevo.");
        gameOverScreen.classList.remove('hidden');
    }
}



window.addEventListener('keydown', e => { if(keys.hasOwnProperty(e.code)) keys[e.code] = true; });
window.addEventListener('keyup', e => { if(keys.hasOwnProperty(e.code)) keys[e.code] = false; });

// Móvil
const touchBtns = document.querySelectorAll('.ctrl-btn');
touchBtns.forEach(btn => {
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const dir = btn.getAttribute('data-dir');
        if(dir === 'up') keys.ArrowUp = true;
        if(dir === 'down') keys.ArrowDown = true;
        if(dir === 'left') keys.ArrowLeft = true;
        if(dir === 'right') keys.ArrowRight = true;
    });
    btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        const dir = btn.getAttribute('data-dir');
        if(dir === 'up') keys.ArrowUp = false;
        if(dir === 'down') keys.ArrowDown = false;
        if(dir === 'left') keys.ArrowLeft = false;
        if(dir === 'right') keys.ArrowRight = false;
    });
});

// Voz
let recognition;
function initVoiceControl() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = true; recognition.lang = 'es-ES'; recognition.interimResults = false;
        
        recognition.onstart = () => micStatus.classList.add('listening');
        recognition.onend = () => { if(gameRunning) recognition.start(); };
        
        recognition.onresult = (event) => {
            const cmd = event.results[event.results.length-1][0].transcript.trim().toLowerCase();
            const impulse = 50;
            
            if (cmd.includes('arriba')) player.y -= impulse;
            if (cmd.includes('abajo')) player.y += impulse;
            if (cmd.includes('derecha') || cmd.includes('adelante')) player.x += impulse;
            if (cmd.includes('izquierda') || cmd.includes('atras')) player.x -= impulse;
            
            keepPlayerInBounds();
        };
        recognition.start();
    }
}

function startGame() {
    startScreen.classList.add('hidden');
    gameRunning = true;
    score = 0; lives = 10; level = 1; gameSpeed = 3;
    player.x = canvas.width / 2; player.y = canvas.height / 2;
    obstacles = []; stars = [];
    
    updateLivesDisplay();
    scoreEl.innerText = "0";
    levelEl.innerText = "1";
    
    Voice.speak("¡Juego iniciado! Recoge las estrellas.");
    
    
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    initVoiceControl();
    requestAnimationFrame(gameLoop);
}

function update() {
    // Movimiento Teclado
    if (keys.ArrowUp) player.y -= player.speed;
    if (keys.ArrowDown) player.y += player.speed;
    if (keys.ArrowLeft) player.x -= player.speed;
    if (keys.ArrowRight) player.x += player.speed;

    keepPlayerInBounds();

    
    if (Math.random() < 0.03) {
        stars.push({
            x: canvas.width, y: Math.random() * canvas.height, size: 10, color: '#ffdd59'
        });
    }
    // Obstáculos
    if (Math.random() < 0.02) {
        obstacles.push({
            x: canvas.width, y: Math.random() * (canvas.height - 30), width: 30, height: 30, speed: gameSpeed
        });
    }

    
    for (let i = 0; i < stars.length; i++) {
        let s = stars[i];
        s.x -= gameSpeed;
        
        let dx = (player.x + player.width/2) - s.x;
        let dy = (player.y + player.height/2) - s.y;
        if (Math.sqrt(dx*dx + dy*dy) < player.width) {
            score++;
            scoreEl.innerText = score;
            Sound.collect();
            checkLevelProgression();
            stars.splice(i, 1); i--;
        } else if (s.x < -20) { stars.splice(i, 1); i--; }
    }

    
    for (let i = 0; i < obstacles.length; i++) {
        let obs = obstacles[i];
        obs.x -= obs.speed;

        if (
            player.x < obs.x + obs.width && player.x + player.width > obs.x &&
            player.y < obs.y + obs.height && player.y + player.height > obs.y
        ) {
            takeDamage();
            obstacles.splice(i, 1); i--;
        } else if (obs.x < -50) { obstacles.splice(i, 1); i--; }
    }
}

function keepPlayerInBounds() {
    if (player.x < 0) player.x = 0;
    if (player.y < 0) player.y = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Jugador
    ctx.fillStyle = player.color;
    ctx.shadowBlur = 10; ctx.shadowColor = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.shadowBlur = 0;

    // Estrellas
    ctx.fillStyle = '#ffdd59';
    stars.forEach(s => {
        ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI*2); ctx.fill();
    });

    // Obstáculos
    ctx.fillStyle = '#ff4757';
    obstacles.forEach(o => ctx.fillRect(o.x, o.y, o.width, o.height));
}

function gameLoop() {
    if (!gameRunning) return;
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function showFeedback(text) {
    feedbackEl.innerText = text;
    feedbackEl.style.opacity = 1;
    setTimeout(() => feedbackEl.style.opacity = 0, 2000);
}

document.getElementById('start-btn').addEventListener('click', startGame);