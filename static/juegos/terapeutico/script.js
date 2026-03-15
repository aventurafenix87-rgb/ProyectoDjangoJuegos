
const ctxAudio = new (window.AudioContext || window.webkitAudioContext)();

function sonidoAcierto() {
    try {
        const osc = ctxAudio.createOscillator();
        const g = ctxAudio.createGain();
        osc.connect(g); g.connect(ctxAudio.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctxAudio.currentTime);
        osc.frequency.setValueAtTime(660, ctxAudio.currentTime + 0.1);
        osc.frequency.setValueAtTime(880, ctxAudio.currentTime + 0.2);
        g.gain.setValueAtTime(0.3, ctxAudio.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, ctxAudio.currentTime + 0.6);
        osc.start(); osc.stop(ctxAudio.currentTime + 0.6);
    } catch(e) {}
}

function sonidoError() {
    try {
        const osc = ctxAudio.createOscillator();
        const g = ctxAudio.createGain();
        osc.connect(g); g.connect(ctxAudio.destination);
        osc.frequency.value = 200; osc.type = 'sawtooth';
        g.gain.setValueAtTime(0.2, ctxAudio.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, ctxAudio.currentTime + 0.35);
        osc.start(); osc.stop(ctxAudio.currentTime + 0.35);
    } catch(e) {}
}

function sonidoClick() {
    try {
        const osc = ctxAudio.createOscillator();
        const g = ctxAudio.createGain();
        osc.connect(g); g.connect(ctxAudio.destination);
        osc.frequency.value = 500; osc.type = 'sine';
        g.gain.setValueAtTime(0.1, ctxAudio.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, ctxAudio.currentTime + 0.1);
        osc.start(); osc.stop(ctxAudio.currentTime + 0.1);
    } catch(e) {}
}

function sonidoFin() {
    try {
        const notas = [523, 659, 784, 1047];
        notas.forEach((f, i) => {
            const osc = ctxAudio.createOscillator();
            const g = ctxAudio.createGain();
            osc.connect(g); g.connect(ctxAudio.destination);
            osc.type = 'sine'; osc.frequency.value = f;
            g.gain.setValueAtTime(0.0, ctxAudio.currentTime + i * 0.15);
            g.gain.linearRampToValueAtTime(0.3, ctxAudio.currentTime + i * 0.15 + 0.05);
            g.gain.exponentialRampToValueAtTime(0.01, ctxAudio.currentTime + i * 0.15 + 0.4);
            osc.start(ctxAudio.currentTime + i * 0.15);
            osc.stop(ctxAudio.currentTime + i * 0.15 + 0.4);
        });
    } catch(e) {}
}

let ultimaVoz = null, vocesDisponibles = [], vozCompletada = false;
if (window.speechSynthesis) {
    speechSynthesis.onvoiceschanged = () => { vocesDisponibles = window.speechSynthesis.getVoices(); };
    vocesDisponibles = window.speechSynthesis.getVoices();
}
function vozGuia(texto, esFinalizacion = false) {
    if (!window.speechSynthesis) return;
    if (esFinalizacion && vozCompletada) return;
    if (ultimaVoz) window.speechSynthesis.cancel();
    setTimeout(() => {
        const v = new SpeechSynthesisUtterance(texto);
        v.lang = "es-ES"; v.rate = 0.88;
        const pref = vocesDisponibles.find(vv => vv.lang === "es-ES");
        if (pref) v.voice = pref;
        ultimaVoz = v;
        window.speechSynthesis.speak(v);
        if (esFinalizacion) vozCompletada = true;
        v.onend = () => {
            ultimaVoz = null;
            if (esFinalizacion) setTimeout(() => { vozCompletada = false; }, 1000);
        };
    }, 100);
}

function createMagicParticles(emojis) {
    const container = document.getElementById('particles');
    const total = 18;
    for (let i = 0; i < total; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.innerText = emojis[Math.floor(Math.random() * emojis.length)];
        p.style.left = Math.random() * 100 + 'vw';
        p.style.animationDuration = (6 + Math.random() * 12) + 's';
        p.style.animationDelay = (Math.random() * 14) + 's';
        p.style.fontSize = (1.2 + Math.random() * 1.5) + 'rem';
        container.appendChild(p);
    }
}

const buenos = ["🌟 ¡Excelente!", "👏 ¡Muy bien!", "😊 ¡Lo lograste!", "💪 ¡Sigue así!", "🎉 ¡Increíble!", "🦋 ¡Fantástico!"];
const suavesMsg = ["🤍 Intenta otra vez", "🌈 No pasa nada", "💭 Casi lo logras", "😊 Puedes hacerlo"];
const areas = ["colores", "emociones", "rutina", "mate", "motricidad", "memoria"];
const iconosArea = { colores: "🎨", emociones: "🎭", rutina: "🏠", mate: "🔢", motricidad: "🖐️", memoria: "🧠" };

let perfilActual = {
    nombre: "",
    edad: "",
    diag: "",
    estrellas: 0,
    progreso: { colores: 0, emociones: 0, rutina: 0, mate: 0, motricidad: 0, memoria: 0 }
};

let modulo = "", acciones = 0, tiempo = 0, reloj = null;
const TOTAL = 8;

let toastTimeout = null;
function mostrarToast(msg) {
    const t = document.getElementById('toast-refuerzo');
    t.innerText = msg;
    t.classList.remove('hidden');
    void t.offsetWidth;
    t.classList.add('show');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        t.classList.remove('show');
        setTimeout(() => t.classList.add('hidden'), 350);
    }, 1800);
}


function mostrar(id) {
    const el = document.getElementById(id);
    el.classList.remove('hidden');
    void el.offsetWidth;
    el.classList.add('animate__in');
    setTimeout(() => el.classList.remove('animate__in'), 500);
}
function ocultar(id) { document.getElementById(id).classList.add('hidden'); }

function actualizarMenuProgreso() {
    let total = 0;
    areas.forEach(a => {
        const p = perfilActual.progreso[a] || 0;
        total += p;
        const fillEl = document.getElementById('fill-' + a);
        const pctEl  = document.getElementById('pct-' + a);
        if (fillEl) fillEl.style.width = p + '%';
        if (pctEl)  pctEl.innerText = p + '%';
    });
    const avg = Math.round(total / areas.length);
    document.getElementById('pct-global').innerText = avg + '%';
    document.getElementById('barra-global').style.width = avg + '%';
}

function iniciar() {
    acciones = 0; tiempo = 0; vozCompletada = false;
    ocultar('inicio'); mostrar('juego');

    document.getElementById('modulo-badge-juego') || (document.getElementById('modulo-badge').id = 'modulo-badge-juego');
    document.getElementById('modulo-badge-juego').innerText = iconosArea[modulo] + ' ' + modulo.charAt(0).toUpperCase() + modulo.slice(1);

    actualizarBarraModulo();
    reloj = setInterval(() => {
        tiempo++;
        document.getElementById('timer-clinic').innerText = "⏱️ " + tiempo + " s";
    }, 1000);
    cargar();
}

function porcentaje() { return Math.min(Math.round((acciones / TOTAL) * 100), 100); }

function actualizarBarraModulo() {
    const barra = document.getElementById('barra-modulo');
    if (barra) barra.style.width = porcentaje() + '%';
    const est = document.getElementById('estrellas-juego');
    if (est) est.innerText = '⭐ ' + perfilActual.estrellas;
}

function cargar() {
    const zona = document.getElementById('zona');
    const refuerzo = document.getElementById('refuerzo');
    zona.innerHTML = "";
    refuerzo.innerText = "";
    refuerzo.className = "refuerzo text-center";
    actualizarBarraModulo();

    if (modulo === "colores")    simple(["🔴", "🟢", "🔵"], "Atención completada 🎨");
    if (modulo === "emociones")  simple(["😊", "😢", "😡"], "Emociones completadas 🎭");
    if (modulo === "rutina")     rutinaAvanzada();
    if (modulo === "mate")       matematica();
    if (modulo === "motricidad") motricidadMejorada();
    if (modulo === "memoria")    memoriaVisual();
}

function mostrarFin(msg) {
    sonidoFin();
    vozGuia("¡Excelente! Has completado el nivel", true);
    document.getElementById('zona').innerHTML = `
        <div class="finModulo">
            <span class="fireworks">🎊</span>
            <div>${msg}</div>
            <div style="font-size:1rem; color:#4b5563; margin-top:10px;">
                Completado en <strong>${tiempo}s</strong> · ⭐ ${perfilActual.estrellas} estrellas totales
            </div>
            <button class="btn-rejugar" onclick="acciones=0;cargar()">🔁 Jugar de nuevo</button>
        </div>`;
    document.getElementById('instruccion').innerText = "";
    perfilActual.progreso[modulo] = 100;
    actualizarBarraModulo();
}

function onAcierto(btn) {
    sonidoAcierto();
    acciones++;
    perfilActual.estrellas++;
    if (btn) btn.classList.add('pulse-acierto');
    const msg = buenos[Math.floor(Math.random() * buenos.length)];
    const ref = document.getElementById('refuerzo');
    ref.innerText = msg;
    ref.className = "refuerzo text-center acierto";
    mostrarToast(msg);
    setTimeout(cargar, 1800);
}

function onError(btn) {
    sonidoError();
    if (btn) { btn.classList.add('shake'); setTimeout(() => btn.classList.remove('shake'), 400); }
    const msg = suavesMsg[Math.floor(Math.random() * suavesMsg.length)];
    const ref = document.getElementById('refuerzo');
    ref.innerText = msg;
    ref.className = "refuerzo text-center error";
}

function simple(lista, finMsg) {
    if (porcentaje() === 100) { mostrarFin(finMsg); return; }
    let obj = lista[Math.floor(Math.random() * lista.length)];
    document.getElementById('instruccion').innerText = "👉 Toca " + obj + "  (" + porcentaje() + "%)";
    vozGuia("Toca " + obj);
    const shuffled = [...lista].sort(() => Math.random() - 0.5);
    shuffled.forEach(x => {
        const b = document.createElement("button");
        b.className = "botonJuego";
        b.innerText = x;
        b.onclick = () => {
            sonidoClick();
            if (x === obj) onAcierto(b);
            else onError(b);
        };
        document.getElementById('zona').appendChild(b);
    });
}

function motricidadMejorada() {
    if (porcentaje() === 100) { mostrarFin("🖐️ Motricidad completada"); return; }
    const figuras = ["🔴", "⭐", "🟦", "🔺", "🌸", "🍀"];
    let f = figuras[Math.floor(Math.random() * figuras.length)];
    document.getElementById('instruccion').innerText = "👉 Arrastra " + f + " al recuadro (" + porcentaje() + "%)";
    vozGuia("Arrastra " + f + " al recuadro");

    const d = document.createElement("div");
    d.className = "botonJuego"; d.innerText = f; d.draggable = true;
    d.style.cursor = "grab";
    d.ondragstart = e => { sonidoClick(); e.dataTransfer.setData("text/plain", f); d.style.opacity = "0.5"; };
    d.ondragend = () => { d.style.opacity = "1"; };

    let touchDragging = false;
    d.addEventListener('touchstart', () => { touchDragging = true; sonidoClick(); }, { passive: true });

    const drop = document.createElement("div");
    drop.className = "drop";
    drop.innerHTML = `<div style="font-size:3rem">${f}</div><div class="textoMomento">Suéltame aquí</div>`;
    drop.ondragover = e => { e.preventDefault(); drop.classList.add('dragover'); };
    drop.ondragleave = () => drop.classList.remove('dragover');
    drop.ondrop = e => {
        e.preventDefault();
        drop.classList.remove('dragover');
        onAcierto(null);
    };
    
    drop.addEventListener('touchend', e => {
        if (!touchDragging) return;
        touchDragging = false;
        const touch = e.changedTouches[0];
        const el = document.elementFromPoint(touch.clientX, touch.clientY);
        if (el && drop.contains(el)) onAcierto(null);
        else onError(d);
    });

    document.getElementById('zona').appendChild(d);
    document.getElementById('zona').appendChild(drop);
}


const rutinas_data = [
    { obj: "🪥", mom: "🌅", txt: "Mañana",   voz: "El cepillo de dientes va en la mañana" },
    { obj: "🚿", mom: "🌅", txt: "Mañana",   voz: "La ducha va en la mañana" },
    { obj: "🍽️", mom: "☀️",  txt: "Mediodía", voz: "La comida va al mediodía" },
    { obj: "🛏️", mom: "🌙", txt: "Noche",    voz: "La cama va en la noche" },
    { obj: "📚", mom: "☀️",  txt: "Mediodía", voz: "Los libros van al mediodía" },
    { obj: "🌙", mom: "🌙", txt: "Noche",    voz: "Dormir va en la noche" },
];

function rutinaAvanzada() {
    if (porcentaje() === 100) { mostrarFin("🏠 Rutina completada"); return; }
    let r = rutinas_data[Math.floor(Math.random() * rutinas_data.length)];
    
    const otros = rutinas_data.filter(x => x.mom !== r.mom);
    const selOtros = otros.sort(() => Math.random() - 0.5).slice(0, 2);
    const opciones = [r, ...selOtros].sort(() => Math.random() - 0.5);

    document.getElementById('instruccion').innerText = "👉 ¿Cuándo hacemos " + r.obj + "? (" + porcentaje() + "%)";
    vozGuia(r.voz);

    
    const d = document.createElement("div");
    d.className = "botonJuego"; d.innerText = r.obj; d.draggable = true;
    d.style.cssText = "width:100px;height:100px;font-size:3rem;cursor:grab;";
    d.ondragstart = e => { sonidoClick(); e.dataTransfer.setData("text/plain", r.mom); d.style.opacity = "0.5"; };
    d.ondragend = () => { d.style.opacity = "1"; };
    document.getElementById('zona').appendChild(d);

    
    opciones.forEach(op => {
        const drop = document.createElement("div");
        drop.className = "drop";
        drop.style.cssText = "cursor:pointer;";
        drop.innerHTML = `<div style="font-size:2.5rem">${op.mom}</div><div class="textoMomento">${op.txt}</div>`;
        drop.ondragover = e => { e.preventDefault(); drop.classList.add('dragover'); };
        drop.ondragleave = () => drop.classList.remove('dragover');
        drop.ondrop = e => {
            e.preventDefault();
            drop.classList.remove('dragover');
            if (op.mom === r.mom) onAcierto(null);
            else onError(drop);
        };
        
        drop.onclick = () => {
            if (op.mom === r.mom) onAcierto(null);
            else onError(drop);
        };
        document.getElementById('zona').appendChild(drop);
    });
}


function matematica() {
    if (porcentaje() === 100) { mostrarFin("🔢 Matemática completada"); return; }
    const maxN = Math.min(3 + Math.floor(acciones / 3), 6); // dificultad progresiva
    let n = Math.floor(Math.random() * maxN) + 1;
    document.getElementById('instruccion').innerText = "🍎 ¿Cuántas manzanas hay? (" + porcentaje() + "%)";
    vozGuia("¿Cuántas manzanas hay?");

    
    const tray = document.createElement("div");
    tray.className = "manzanas-tray w-100 text-center";
    for (let i = 0; i < n; i++) {
        const span = document.createElement("span");
        span.className = "manzana-item";
        span.innerText = "🍎";
        span.style.animationDelay = (i * 0.1) + 's';
        tray.appendChild(span);
        tray.appendChild(document.createTextNode(" "));
    }
    document.getElementById('zona').appendChild(tray);

    
    const opcionesN = new Set([n]);
    while (opcionesN.size < 3) opcionesN.add(Math.max(1, n + Math.floor(Math.random() * 3) - 1));
    [...opcionesN].sort(() => Math.random() - 0.5).forEach(x => {
        const b = document.createElement("button");
        b.className = "botonJuego";
        b.innerText = x;
        b.style.fontSize = "2.2rem";
        b.onclick = () => {
            sonidoClick();
            if (x === n) onAcierto(b);
            else onError(b);
        };
        document.getElementById('zona').appendChild(b);
    });
}


const memoriaFigs = ["🐶", "🐱", "🐭", "🐰", "🦊", "🐻", "🐼", "🐨"];
let memoriaSecuencia = [], memoriaVuelta = 0, memoriaEsperando = false;

function memoriaVisual() {
    if (porcentaje() === 100) { mostrarFin("🧠 Memoria Visual completada"); return; }
    const n = Math.min(3 + Math.floor(acciones / 3), 5); 
    const figs = [...memoriaFigs].sort(() => Math.random() - 0.5).slice(0, n);
    const obj = figs[Math.floor(Math.random() * figs.length)];

    document.getElementById('instruccion').innerText = "👉 Busca a " + obj + " (" + porcentaje() + "%)";
    vozGuia("Busca a " + obj);

    figs.sort(() => Math.random() - 0.5).forEach(f => {
        const outer = document.createElement("div");
        outer.className = "flip-card-outer";
        outer.innerHTML = `
            <div class="flip-card-inner">
                <div class="flip-front">?</div>
                <div class="flip-back">${f}</div>
            </div>`;
        outer.onclick = () => {
            sonidoClick();
            outer.classList.add('flipped');
            setTimeout(() => {
                if (f === obj) onAcierto(null);
                else { onError(outer); setTimeout(() => outer.classList.remove('flipped'), 800); }
            }, 400);
        };
        document.getElementById('zona').appendChild(outer);
    });
}


function verPanel() {
    ocultar('inicio'); mostrar('panel');
    document.getElementById('panel-nombre-info').innerText = "⭐ " + perfilActual.estrellas + " estrellas acumuladas";
    renderTarjetas();
    renderChart();
    renderResumen();
}

function renderTarjetas() {
    const cont = document.getElementById('tarjetas-progreso');
    cont.innerHTML = '';
    areas.forEach(a => {
        const p = perfilActual.progreso[a] || 0;
        const nivel = p < 34 ? 'bajo' : p < 67 ? 'medio' : 'alto';
        cont.innerHTML += `
            <div class="col-6 col-md-4">
                <div class="tarjeta-prog">
                    <div class="t-icon">${iconosArea[a]}</div>
                    <div class="t-nombre">${a.charAt(0).toUpperCase() + a.slice(1)}</div>
                    <div class="t-valor ${nivel}">${p}%</div>
                    <div class="t-barra"><div class="t-fill ${nivel}" style="width:${p}%"></div></div>
                </div>
            </div>`;
    });
}

function renderChart() {
    const canvas = document.getElementById('graf');
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, W, H);

    
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    [0, 25, 50, 75, 100].forEach(v => {
        const y = 40 + (1 - v / 100) * 220;
        ctx.beginPath(); ctx.moveTo(60, y); ctx.lineTo(W - 20, y); ctx.stroke();
        ctx.fillStyle = '#94a3b8'; ctx.font = 'bold 12px Nunito, Arial';
        ctx.textAlign = 'right'; ctx.fillText(v + '%', 52, y + 4);
    });

    const barW = 65, gap = (W - 80 - areas.length * barW) / (areas.length - 1);
    const colores = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#c77dff', '#f97316'];

    areas.forEach((a, i) => {
        const p = perfilActual.progreso[a] || 0;
        const h = (p / 100) * 220;
        const x = 68 + i * (barW + gap);
        const y = 40 + (220 - h);

        
        ctx.shadowColor = colores[i] + '55';
        ctx.shadowBlur = 10;

        
        const grad = ctx.createLinearGradient(x, y, x, y + h);
        grad.addColorStop(0, colores[i]);
        grad.addColorStop(1, colores[i] + '88');
        ctx.fillStyle = grad;
        roundRect(ctx, x, y, barW, h, 10);
        ctx.fill();

        ctx.shadowBlur = 0;

        
        ctx.font = '22px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(iconosArea[a], x + barW / 2, H - 16);

        
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 13px Nunito, Arial';
        ctx.fillText(p + '%', x + barW / 2, y - 8);
    });
}

function roundRect(ctx, x, y, w, h, r) {
    if (h <= 0) return;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function renderResumen() {
    const total = areas.reduce((s, a) => s + (perfilActual.progreso[a] || 0), 0);
    const avg = Math.round(total / areas.length);
    const mejor = areas.reduce((a, b) => (perfilActual.progreso[a] || 0) >= (perfilActual.progreso[b] || 0) ? a : b);
    const menor = areas.reduce((a, b) => (perfilActual.progreso[a] || 0) <= (perfilActual.progreso[b] || 0) ? a : b);
    document.getElementById('resumen-clinico').innerHTML = `
        <strong>📋 Resumen de progreso</strong><br>
        • Progreso promedio: <strong>${avg}%</strong><br>
        • Mejor área: <strong>${iconosArea[mejor]} ${mejor}</strong> (${perfilActual.progreso[mejor] || 0}%)<br>
        • Área a reforzar: <strong>${iconosArea[menor]} ${menor}</strong> (${perfilActual.progreso[menor] || 0}%)<br>
        • Estrellas acumuladas: <strong>⭐ ${perfilActual.estrellas}</strong>
    `;
}

function salirJuego() {
    clearInterval(reloj);
    perfilActual.progreso[modulo] = porcentaje();
    ocultar('juego'); mostrar('inicio');
    actualizarMenuProgreso();
}

function volver() {
    ocultar('panel'); mostrar('inicio');
    actualizarMenuProgreso();
}

window.onload = () => {
    createMagicParticles(['🏥', '💊', '😊', '🛡️', '☀️', '🌈', '💖', '⭐', '🎈', '🦋', '🌸']);
    actualizarMenuProgreso();
    vozGuia("¡Bienvenido! ¿A qué quieres jugar?");
};
