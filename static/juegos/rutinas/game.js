
let rutinaTipo     = "";
let paso           = 0;
let puntos         = 0;
let racha          = 0;
let maxRacha       = 0;
let puntosEnRutina = 0;
let rutinasCompletadas = 0;
let registros = [];
let bloqueado = false;

const rutinas = {
    manana: [
        { t: "¡Buenos días! Es hora de levantarse", c: "🛏️", o: ["🛏️", "🍞", "📺"] },
        { t: "¡Muy bien! Ahora arregla tu cama",    c: "🛏️", o: ["🛏️", "🎮", "📺"] },
        { t: "Ve al baño",                           c: "🚽", o: ["🚽", "🍞", "📺"] },
        { t: "Cepilla tus dientes muy bien",         c: "🦷", o: ["🦷", "🍔", "📺"] },
        { t: "Es momento de vestirse",               c: "👕", o: ["👕", "🛌", "📺"] },
        { t: "A desayunar algo rico",                c: "🍞", o: ["🍞", "📺", "🧸"] },
        { t: "Ponte tus zapatos favoritos",          c: "👟", o: ["👟", "🍎", "📺"] },
        { t: "Prepara tu mochila",                   c: "🎒", o: ["🎒", "📺", "🧸"] },
        { t: "Peina tu cabello",                     c: "🪮", o: ["🪮", "📺", "🛌"] },
        { t: "¡Listo para salir!",                   c: "🚪", o: ["🚪", "📺", "🛏️"] }
    ],
    tarde: [
        { t: "Es hora de almorzar",                  c: "🍽️", o: ["🍽️", "📺", "🎮"] },
        { t: "Lava tus manos con jabón",             c: "👐", o: ["👐", "🍞", "📺"] },
        { t: "Haz tus deberes con calma",            c: "📘", o: ["📘", "📺", "🧸"] },
        { t: "Lee un poco tu libro favorito",        c: "📖", o: ["📖", "📺", "🎮"] },
        { t: "Tiempo de jugar tranquilo",            c: "🧩", o: ["🧩", "📺", "🛌"] },
        { t: "Guarda tus juguetes en su lugar",      c: "🧸", o: ["🧸", "📺", "🍞"] },
        { t: "Toma un poco de agua",                 c: "🥤", o: ["🥤", "🍞", "📺"] },
        { t: "Momento de descansar un rato",         c: "😌", o: ["😌", "📺", "🎮"] },
        { t: "¡Vamos a dibujar algo!",               c: "🎨", o: ["🎨", "📺", "🛌"] },
        { t: "Una merienda saludable",               c: "🧁", o: ["🧁", "📺", "🍞"] }
    ],
    noche: [
        { t: "Es momento de cenar",                  c: "🍲", o: ["🍲", "📺", "🎮"] },
        { t: "Cepilla tus dientes antes de dormir",  c: "🪥", o: ["🪥", "🍔", "📺"] },
        { t: "Ponte tu pijama cómoda",               c: "👕", o: ["👕", "🛏️", "📺"] },
        { t: "Ordena tu cuarto para mañana",         c: "🧺", o: ["🧺", "📺", "🛌"] },
        { t: "Lee un cuento mágico",                 c: "📚", o: ["📚", "📺", "🎮"] },
        { t: "Apaga las luces",                      c: "🔦", o: ["🔦", "📺", "🎮"] },
        { t: "¡A la cama!",                          c: "🛌", o: ["🛌", "📺", "🎮"] },
        { t: "Abraza a tu peluche",                  c: "🐻", o: ["🐻", "📺", "🍞"] },
        { t: "Cierra tus ojitos",                    c: "😌", o: ["😌", "📺", "🎮"] },
        { t: "¡Dulces sueños!",                      c: "🌙", o: ["🌙", "📺", "🎮"] }
    ]
};




function mezclar(arr) {
    return arr.slice().sort(() => Math.random() - 0.5);
}

function mostrar(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    const target = document.getElementById("screen-" + id) || document.getElementById(id);
    if (target) target.classList.add("active");

    updateTopBar(id);
}

function updateTopBar(screenId) {
    const barMap = { inicio: 5, menu: 15, rutina: 50, emociones: 90, registro: 100 };
    const pct = barMap[screenId] || 0;
    document.getElementById("topProgressBar").style.width = pct + "%";
}

function showToast(msg, type = "success", duration = 2300) {
    const wrap = document.getElementById("toastWrap");
    const el   = document.createElement("div");
    el.className = `toast-item ${type}`;
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(() => el.remove(), duration);
}


document.addEventListener("DOMContentLoaded", () => {
    createParticles(['☀️','🌙','🪥','🚿','🥣','🏫','🛏️','🧸','🧩','🎨','⭐','🌈','🎵','💤']);
    mostrar("menu");
    actualizarMenu();
});


function actualizarMenu() {
    document.getElementById("puntosMenu").textContent = puntos;
    document.getElementById("rachaMenu").textContent  = racha;
    document.getElementById("completadasMenu").textContent = rutinasCompletadas;
}


function iniciarRutina(tipo) {
    rutinaTipo     = tipo;
    paso           = 0;
    puntosEnRutina = 0;
    bloqueado      = false;

    actualizarStepBar();
    mostrar("rutina");
    mostrarPaso();
}

function actualizarStepBar() {
    const total = rutinas[rutinaTipo].length;
    const pct   = (paso / total) * 100;
    document.getElementById("stepFill").style.width = pct + "%";
    document.getElementById("pasoNum").textContent  = paso + 1;
    document.getElementById("pasoTotal").textContent = total;
    document.getElementById("streakVal").textContent = racha;
}

function mostrarPaso() {
    const p      = rutinas[rutinaTipo][paso];
    const total  = rutinas[rutinaTipo].length;

    document.getElementById("tituloPaso").textContent = p.t;
    document.getElementById("instrEmoji").textContent = p.c;

    actualizarStepBar();

    const opciones = document.getElementById("opciones");
    opciones.innerHTML = "";

    mezclar([...p.o]).forEach((op, i) => {
        const card = document.createElement("div");
        card.className = "choice-card animate-up";
        card.style.animationDelay = (i * 0.08) + "s";
        card.textContent = op;
        card.addEventListener("click", () => verificar(op, card));
        opciones.appendChild(card);
    });

    speak(p.t);
}

function verificar(op, cardEl) {
    if (bloqueado) return;
    const p = rutinas[rutinaTipo][paso];

    if (op === p.c) {
        bloqueado = true;
        cardEl.classList.add("correct");

        puntos        += 10;
        puntosEnRutina += 10;
        racha         += 1;
        if (racha > maxRacha) maxRacha = racha;

        document.getElementById("streakVal").textContent = racha;

        const msgs = ["¡Excelente! 🌟", "¡Muy bien! 🎉", "¡Perfecto! ⭐", "¡Genial! 🚀", "¡Increíble! 💪"];
        showToast(msgs[Math.floor(Math.random() * msgs.length)], "success");
        speak("¡Muy bien!");

        paso++;
        actualizarStepBar();

        if (paso < rutinas[rutinaTipo].length) {
            setTimeout(() => {
                bloqueado = false;
                mostrarPaso();
            }, 900);
        } else {
            rutinasCompletadas++;
            actualizarMenu();
            document.getElementById("puntosGanados").textContent = puntosEnRutina;
            setTimeout(() => {
                mostrar("emociones");
                dispararConfetti();
                speak("¡Fantástico! ¡Lo lograste todo!");
            }, 900);
        }
    } else {
        
        cardEl.classList.add("wrong");
        racha = 0;
        document.getElementById("streakVal").textContent = 0;

        showToast("¡Inténtalo de nuevo! 💪", "error");
        speak("Intenta con otro");

        setTimeout(() => cardEl.classList.remove("wrong"), 500);
    }
}


function emocion(sentimiento, emoji) {
    registros.push({
        rutina:    rutinaTipo,
        emocion:   sentimiento,
        emoji:     emoji,
        puntos:    puntosEnRutina,
        fecha:     formatFecha()
    });

    mostrar("menu");
    actualizarMenu();
    showToast("¡Registrado! " + emoji, "info");
    speak("¡Lo lograste! Te sientes " + sentimiento + ". Qué buen trabajo.");
}

function formatFecha() {
    const d = new Date();
    const date = d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
    const time = d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    return date + " · " + time;
}


function verRegistro() {
    const totalPts = registros.reduce((a, r) => a + (r.puntos || 0), 0);
    document.getElementById("rsTotalRutinas").textContent = registros.length;
    document.getElementById("rsTotalPuntos").textContent  = totalPts;
    document.getElementById("rsMaxRacha").textContent      = maxRacha;

    const container = document.getElementById("datosRegistro");

    if (registros.length === 0) {
        container.innerHTML = `<div class="registro-empty">
            <div style="font-size:3rem;margin-bottom:12px">📭</div>
            Aún no hay rutinas completadas.<br>¡Anímate a intentarlo!
        </div>`;
    } else {
        const iconMap = { manana: "🌞", tarde: "🌤️", noche: "🌙" };
        container.innerHTML = registros.slice().reverse().map(r => `
            <div class="registro-item">
                <div class="registro-item-icon">${iconMap[r.rutina] || "📋"}</div>
                <div class="registro-item-info">
                    <div class="registro-item-date">📅 ${r.fecha}</div>
                    <div class="registro-item-tags">
                        <span class="tag">Rutina de ${r.rutina}</span>
                        <span class="tag">${r.emocion}</span>
                        <span class="tag">⭐ ${r.puntos} pts</span>
                    </div>
                </div>
            </div>
        `).join("");
    }

    mostrar("registro");
}


function createParticles(emojis) {
    const container = document.getElementById("particles");
    for (let i = 0; i < 18; i++) {
        const p = document.createElement("div");
        p.className = "particle";
        p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        p.style.left          = Math.random() * 100 + "vw";
        p.style.animationDuration  = (12 + Math.random() * 18) + "s";
        p.style.animationDelay     = (Math.random() * 15) + "s";
        p.style.fontSize      = (1 + Math.random() * 1.5) + "rem";
        container.appendChild(p);
    }
}


function dispararConfetti() {
    const canvas = document.getElementById("confettiCanvas");
    const ctx    = canvas.getContext("2d");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const piezas = [];
    const colores = ["#6bcf9c","#f59e0b","#6366f1","#ff6b6b","#4cd5c5","#fbc2eb","#ffe082"];

    for (let i = 0; i < 120; i++) {
        piezas.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            r: 5 + Math.random() * 8,
            d: Math.random() * 120,
            color: colores[Math.floor(Math.random() * colores.length)],
            vx: (Math.random() - 0.5) * 3,
            vy: 2 + Math.random() * 4,
            angle: 0,
            va: (Math.random() - 0.5) * 0.3
        });
    }

    let frames = 0;

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        piezas.forEach(p => {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
            ctx.restore();

            p.x    += p.vx;
            p.y    += p.vy;
            p.angle+= p.va;

            if (p.y > canvas.height + 20) {
                p.y = -20;
                p.x = Math.random() * canvas.width;
            }
        });

        frames++;
        if (frames < 180) {
            requestAnimationFrame(draw);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    draw();
}


function speak(text, rate = 1.0, pitch = 1.2) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang  = "es-ES";
    u.rate  = rate;
    u.pitch = pitch;
    u.volume = 0.85;
    window.speechSynthesis.speak(u);
}


window.addEventListener("resize", () => {
    const canvas = document.getElementById("confettiCanvas");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
});
