
let currentProfile = 'standard';

const profiles = {
    standard: { 
        contrast: false, 
        large: false, 
        reducedMotion: false, 
        voiceSpeed: 0.9, 
        gestureHint: true 
    },
    autism: { 
        contrast: true, 
        large: false, 
        reducedMotion: true, 
        voiceSpeed: 0.7, 
        gestureHint: true, 
        colors: 'high' 
    },
    tdah: { 
        contrast: false, 
        large: true, 
        reducedMotion: false, 
        voiceSpeed: 1.0, 
        gestureHint: true, 
        gamify: true 
    },
    motor: { 
        contrast: false, 
        large: true, 
        reducedMotion: false, 
        voiceSpeed: 0.8, 
        gestureHint: true, 
        gesturePrimary: true 
    },
    visual: { 
        contrast: true, 
        large: true, 
        reducedMotion: true, 
        voiceSpeed: 0.8, 
        gestureHint: true, 
        audioDescribe: true 
    }
};

function setProfile(type, btn) {
    currentProfile = type;
    document.querySelectorAll('.profile-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const p = profiles[type];
    const app = document.getElementById('resp-app');
    
    app.classList.toggle('high-contrast', p.contrast);
    app.classList.toggle('large-buttons', p.large);
    app.classList.toggle('reduced-motion', p.reducedMotion);
    
    localStorage.setItem('resp_profile', type);
    
    const names = { 
        standard: 'Estándar', 
        autism: 'Autismo', 
        tdah: 'TDAH', 
        motor: 'Motor', 
        visual: 'Visual' 
    };
    speak(`Perfil ${names[type]} activado`, p.voiceSpeed);
}

let rLevel = 1;
let rPaused = false;
let rVoiceOn = true;
let rInterval = null;
let rBreathInt = null;
let rCdTimer = null;
let rElapsed = 0;
let rCycles = 0;
let rPhaseIdx = 0;
let rPhSec = 0;
let rVol = 0.35;
let rTheme = 'calm';
const SESSION_SEC = 600;

let gestureEnabled = false;
let gestureActive = false;
let hands = null;
let camera = null;
let gestureCount = 0;
let lastGestureTime = 0;
let gestureAccuracy = { inhale: 0, hold: 0, exhale: 0, total: 0 };

const RCfg = {
    1: { 
        name: '🌱 Explorador', 
        in: 4, 
        hold: 4, 
        out: 4,  
        msgs: ['Inhala profundo...', 'Sostén el aire...', 'Exhala suavemente...'] 
    },
    2: { 
        name: '🔥 Aventurero', 
        in: 5, 
        hold: 5, 
        out: 6,  
        msgs: ['Respira con fuerza...', 'Aguanta...', 'Libera el aire...'] 
    },
    3: { 
        name: '⭐ Maestro',    
        in: 6, 
        hold: 6, 
        out: 8,  
        msgs: ['Inhala, maestro...', 'Controla tu energía...', 'Exhala con maestría...'] 
    },
    4: { 
        name: '🌙 Sueño',     
        in: 4, 
        hold: 7, 
        out: 8,  
        msgs: ['Inhala calma...', 'Mantén la paz...', 'Exhala el estrés...'] 
    }
};

const TColor = {
    calm: { 
        bg: 'linear-gradient(135deg, #0f0c29, #302b63)', 
        arc: '#6C63FF', 
        glow: 'rgba(108,99,255,0.3)' 
    },
    forest: { 
        bg: 'linear-gradient(135deg, #0d2b0d, #1a4a1a)', 
        arc: '#43E97B', 
        glow: 'rgba(67,233,123,0.3)' 
    },
    ocean: { 
        bg: 'linear-gradient(135deg, #0d1b2b, #0d2b4a)', 
        arc: '#4facfe', 
        glow: 'rgba(79,172,254,0.3)' 
    },
    rain: { 
        bg: 'linear-gradient(135deg, #141414, #1e1e1e)', 
        arc: '#a8b2d8', 
        glow: 'rgba(168,178,216,0.3)' 
    },
    space: { 
        bg: 'linear-gradient(135deg, #0a0015, #1a0030)', 
        arc: '#B06EFF', 
        glow: 'rgba(176,110,255,0.3)' 
    },
    sleep: { 
        bg: 'linear-gradient(135deg, #050510, #10103a)', 
        arc: '#6495ED', 
        glow: 'rgba(100,149,237,0.3)' 
    }
};

let audioCtx = null;
let noiseGain = null;
let noiseSource = null;
let filterNode = null;

function ensureAudio() {
    if (audioCtx) return;
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const bufLen = 2 * audioCtx.sampleRate;
        const buf = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) d[i] = Math.random() * 2 - 1;

        noiseSource = audioCtx.createBufferSource();
        noiseSource.buffer = buf;
        noiseSource.loop = true;

        filterNode = audioCtx.createBiquadFilter();
        filterNode.type = 'lowpass';
        filterNode.frequency.value = applyThemeFilter(rTheme);

        noiseGain = audioCtx.createGain();
        noiseGain.gain.value = 0;

        noiseSource.connect(filterNode);
        filterNode.connect(noiseGain);
        noiseGain.connect(audioCtx.destination);
        noiseSource.start();
    } catch(e) { 
        console.warn('Audio init failed:', e); 
    }
}

function applyThemeFilter(th) {
    const map = { 
        calm: 600, 
        forest: 800, 
        ocean: 300, 
        rain: 3000, 
        space: 1400, 
        sleep: 200 
    };
    return map[th] || 600;
}

function startAmbient() {
    ensureAudio();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    filterNode.frequency.value = applyThemeFilter(rTheme);
    noiseGain.gain.setTargetAtTime(rVol * 0.12, audioCtx.currentTime, 0.5);
}

function stopAmbient() {
    if (noiseGain && audioCtx) {
        noiseGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.5);
    }
}

// ── VOCES (TTS) ──
function speak(txt, rate = 0.9, pitch = 1.0) {
    if (!rVoiceOn) return;
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(txt);
        u.lang = 'es-ES';
        u.rate = rate;
        u.pitch = pitch;
        window.speechSynthesis.speak(u);
    }
}

function toggleRVoice() {
    rVoiceOn = !rVoiceOn;
    const btn = document.getElementById('rVoiceBtn');
    btn.textContent = rVoiceOn ? '🗣️ Voz: ON' : '🗣️ Voz: OFF';
    btn.classList.toggle('off', !rVoiceOn);
    if (!rVoiceOn && window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
}

async function initGesture() {
    const video = document.getElementById('gestureVideo');
    const status = document.getElementById('gestureStatus');
    
    hands = new Hands({locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }});
    
    hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });
    
    hands.onResults(onGestureResults);
    
    camera = new Camera(video, {
        onFrame: async () => {
            await hands.send({image: video});
        },
        width: 320,
        height: 240
    });
    
    status.textContent = 'Cámara lista';
}

function onGestureResults(results) {
    const canvas = document.getElementById('gestureCanvas');
    const ctx = canvas.getContext('2d');
    const status = document.getElementById('gestureStatus');
    
    canvas.width = 320;
    canvas.height = 240;
    
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        
        drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
            color: '#00c8ff', 
            lineWidth: 2
        });
        drawLandmarks(ctx, landmarks, {
            color: '#FF6584', 
            lineWidth: 1, 
            radius: 3
        });
        
        detectBreathGesture(landmarks);
        status.textContent = '✋ Mano detectada';
    } else {
        status.textContent = 'Esperando mano...';
        document.getElementById('gestureIndicator').classList.remove('active');
    }
    
    ctx.restore();
}

function detectBreathGesture(landmarks) {
    if (!gestureEnabled || rPaused) return;
    
    const now = Date.now();
    if (now - lastGestureTime < 1000) return;
    
    const wristY = landmarks[0].y;
    const middleTipY = landmarks[12].y;
    const handHeight = wristY - middleTipY;
    
    const phase = ['Inhala', 'Sostén', 'Exhala'][rPhaseIdx];
    const indicator = document.getElementById('gestureIndicator');
    
    if (phase === 'Inhala' && handHeight > 0.1) {
        indicator.className = 'gesture-indicator active inhale';
        gestureAccuracy.inhale++;
        checkGestureMatch();
    } else if (phase === 'Exhala' && handHeight < -0.1) {
        indicator.className = 'gesture-indicator active exhale';
        gestureAccuracy.exhale++;
        checkGestureMatch();
    } else if (phase === 'Sostén' && Math.abs(handHeight) < 0.05) {
        indicator.classList.remove('inhale', 'exhale');
        indicator.classList.add('active');
        gestureAccuracy.hold++;
    }
}

function checkGestureMatch() {
    const now = Date.now();
    if (now - lastGestureTime > 2000) {
        gestureCount++;
        lastGestureTime = now;
        document.getElementById('rGestures').textContent = gestureCount;
        
        if (gestureCount % 3 === 0) {
            speak('¡Excelente ritmo! Sigue así', profiles[currentProfile].voiceSpeed);
        }
    }
}

function toggleGesture() {
    gestureEnabled = !gestureEnabled;
    const btn = document.getElementById('rGestureBtn');
    const container = document.getElementById('gestureContainer');
    const stat = document.getElementById('gestureStat');
    
    btn.textContent = gestureEnabled ? '✋ Gestos: ON' : '✋ Gestos: OFF';
    btn.classList.toggle('off', !gestureEnabled);
    
    if (gestureEnabled) {
        container.classList.remove('hidden');
        stat.style.display = 'flex';
        if (!hands) initGesture();
        if (camera) camera.start();
        speak('Control por gestos activado. Levanta la mano para inhalar, baja para exhalar');
    } else {
        container.classList.add('hidden');
        stat.style.display = 'none';
        if (camera) camera.stop();
        document.getElementById('gestureIndicator').classList.remove('active');
    }
}

function showRScreen(id) {
    document.querySelectorAll('.rscreen').forEach(s => s.classList.remove('active'));
    document.getElementById('scr-' + id).classList.add('active');
    
    if (id !== 'ex' && gestureEnabled) {
        toggleGesture();
    }
}

function startEx(level) {
    rLevel = level;
    rElapsed = 0; 
    rCycles = 0; 
    rPhaseIdx = 0; 
    rPhSec = 0; 
    rPaused = false;
    gestureCount = 0;
    gestureAccuracy = { inhale: 0, hold: 0, exhale: 0, total: 0 };
    
    const cfg = RCfg[level];
    const p = profiles[currentProfile];

    document.getElementById('rLvlName').textContent = cfg.name;
    document.getElementById('rCycles').textContent = '0';
    document.getElementById('rGestures').textContent = '0';
    document.getElementById('rProgBar').style.width = '0%';
    document.getElementById('rPauseBtn').textContent = '⏸️ Pausar';
    document.getElementById('rPhase').textContent = 'Prepárate';
    document.getElementById('rCount').textContent = '3';
    document.getElementById('rMsg').textContent = '🌟 Respira y conecta con tu interior 🌟';
    updateRTimer(SESSION_SEC);

    showRScreen('ex');
    startAmbient();
    
    if (p.gesturePrimary && !gestureEnabled) {
        toggleGesture();
    }
    
    speak('Prepárate. Comenzamos en tres.');

    let n = 3;
    rCdTimer = setInterval(() => {
        if (rPaused) return;
        n--;
        if (n <= 0) {
            clearInterval(rCdTimer); 
            rCdTimer = null;
            document.getElementById('rCount').textContent = cfg.in;
            document.getElementById('rPhase').textContent = phaseName(0);
            document.getElementById('rMsg').textContent = cfg.msgs[0];
            speak(phaseName(0));
            rInterval = setInterval(tickSession, 1000);
            rBreathInt = setInterval(tickBreath, 1000);
            drawOrb(0, 0);
        } else {
            document.getElementById('rCount').textContent = n;
            speak(n.toString());
        }
    }, 1000);
}

function phaseName(i) { 
    return ['Inhala', 'Sostén', 'Exhala'][i]; 
}

function tickSession() {
    if (rPaused) return;
    rElapsed++;
    const rem = SESSION_SEC - rElapsed;
    if (rem <= 0) { 
        stopEx(); 
        return; 
    }
    updateRTimer(rem);
    document.getElementById('rProgBar').style.width = (rElapsed / SESSION_SEC * 100) + '%';
}

function tickBreath() {
    if (rPaused) return;
    const cfg = RCfg[rLevel];
    const dur = [cfg.in, cfg.hold, cfg.out];
    rPhSec++;
    
    if (rPhSec >= dur[rPhaseIdx]) {
        rPhSec = 0;
        rPhaseIdx = (rPhaseIdx + 1) % 3;
        if (rPhaseIdx === 0) { 
            rCycles++; 
            document.getElementById('rCycles').textContent = rCycles;
            if (profiles[currentProfile].gamify && rCycles % 5 === 0) {
                speak(`¡${rCycles} ciclos completados! ¡Superlogro!`);
            }
        }
        document.getElementById('rPhase').textContent = phaseName(rPhaseIdx);
        document.getElementById('rMsg').textContent = cfg.msgs[rPhaseIdx];
        speak(phaseName(rPhaseIdx));
    }
    
    const prog = rPhSec / dur[rPhaseIdx];
    const rem = dur[rPhaseIdx] - rPhSec;
    document.getElementById('rCount').textContent = rem;
    drawOrb(prog, rPhaseIdx);
}

function updateRTimer(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    document.getElementById('rTimer').textContent = 
        `${m}:${s.toString().padStart(2, '0')}`;
}

function drawOrb(prog, phase) {
    const canvas = document.getElementById('rCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    
    ctx.clearRect(0, 0, W, H);

    const tc = TColor[rTheme];
    const col = tc.arc;

    const outerR = 110 + prog * 18;
    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, outerR);
    grd.addColorStop(0, col + '44');
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.beginPath(); 
    ctx.arc(cx, cy, outerR, 0, Math.PI * 2); 
    ctx.fill();

    ctx.beginPath(); 
    ctx.arc(cx, cy, 95, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.09)'; 
    ctx.lineWidth = 13; 
    ctx.stroke();

    if (prog > 0) {
        ctx.beginPath(); 
        ctx.arc(cx, cy, 95, -Math.PI / 2, -Math.PI / 2 + prog * Math.PI * 2);
        ctx.strokeStyle = col; 
        ctx.lineWidth = 13; 
        ctx.lineCap = 'round'; 
        ctx.stroke();
    }

    const innerR = 48 + prog * 16;
    const ig = ctx.createRadialGradient(cx, cy, 0, cx, cy, innerR);
    ig.addColorStop(0, col + 'dd');
    ig.addColorStop(1, col + '44');
    ctx.fillStyle = ig;
    ctx.beginPath(); 
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2); 
    ctx.fill();
}

function toggleRPause() {
    rPaused = !rPaused;
    document.getElementById('rPauseBtn').textContent = 
        rPaused ? '▶️ Reanudar' : '⏸️ Pausar';
    if (rPaused) {
        stopAmbient();
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        if (camera) camera.pause();
    } else {
        startAmbient();
        speak(phaseName(rPhaseIdx));
        if (camera) camera.start();
    }
}

function stopEx() {
    clearInterval(rInterval); 
    clearInterval(rBreathInt); 
    clearInterval(rCdTimer);
    rInterval = rBreathInt = rCdTimer = null;
    stopAmbient();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (camera) camera.stop();

    document.getElementById('resDur').textContent = 
        Math.floor(rElapsed / 60) + 'm ' + rElapsed % 60 + 's';
    document.getElementById('resCyc').textContent = rCycles;
    document.getElementById('resLvl').textContent = RCfg[rLevel].name;
    
    if (gestureCount > 0) {
        document.getElementById('gestureResCard').style.display = 'block';
        document.getElementById('resGestures').textContent = gestureCount + ' ✓';
    } else {
        document.getElementById('gestureResCard').style.display = 'none';
    }
    
    showRScreen('res');
    speak('¡Excelente! Sesión completada. Tu respiración está más tranquila ahora.');
}

function setTheme(th, el) {
    rTheme = th;
    document.querySelectorAll('.th-orb').forEach(b => {
        b.classList.toggle('active', b.dataset.th === th);
    });
    document.getElementById('resp-app').style.background = TColor[th].bg;
    if (filterNode && audioCtx) {
        filterNode.frequency.setTargetAtTime(
            applyThemeFilter(th), 
            audioCtx.currentTime, 
            0.5
        );
    }
}

function setVol(v) {
    rVol = v / 100;
    document.getElementById('rVolPct').textContent = v + '%';
    if (noiseGain && audioCtx && !rPaused) {
        noiseGain.gain.setTargetAtTime(rVol * 0.12, audioCtx.currentTime, 0.3);
    }
}

window.addEventListener('load', () => {
    document.getElementById('resp-app').style.background = TColor['calm'].bg;
    
    const saved = localStorage.getItem('resp_profile');
    if (saved && profiles[saved]) {
        const btn = document.querySelector(`.profile-btn.${saved}`);
        if (btn) setProfile(saved, btn);
    }
    
    const gCanvas = document.getElementById('gestureCanvas');
    if (gCanvas) {
        gCanvas.width = 320;
        gCanvas.height = 240;
    }
});