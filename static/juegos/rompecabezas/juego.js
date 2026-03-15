document.addEventListener('DOMContentLoaded', () => {
    const tablero = document.getElementById('tablero');
    const fondoPista = document.getElementById('tablero-fondo');
    const nivelDisplay = document.getElementById('nivel-indicador');
    const statusVoz = document.getElementById('status-voz');
    
    // Audio
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const melodíaVictoria = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // Escala mayor ascendente

    //Niveles
    const niveles = {
        1: { filas: 3, cols: 3, total: 9 },    // Fácil
        2: { filas: 3, cols: 6, total: 18 },   // Medio
        3: { filas: 6, cols: 6, total: 36 }    // Difícil
    };

    let currentLevel = 1;
    let piezaSeleccionada = null;
    let currentImgUrl = '';

    
    function tocarSonido(frecuencia, tipo = 'sine', duracion = 0.1) {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const ganancia = audioCtx.createGain();
        osc.type = tipo;
        osc.frequency.value = frecuencia;
        osc.connect(ganancia);
        ganancia.connect(audioCtx.destination);
        osc.start();
        ganancia.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duracion);
        osc.stop(audioCtx.currentTime + duracion);
    }

    function cargarNivel(nivel) {
        
        if (nivel < 1) nivel = 1;
        if (nivel > 3) nivel = 3;
        currentLevel = nivel;

        const config = niveles[currentLevel];
        nivelDisplay.textContent = `Nivel ${currentLevel} (${config.total} piezas)`;
        tablero.innerHTML = ''; 
        
        
        tablero.style.gridTemplateColumns = `repeat(${config.cols}, var(--pieza-size))`;
        tablero.style.gridTemplateRows = `repeat(${config.filas}, var(--pieza-size))`;

        
        const computedStyle = getComputedStyle(document.documentElement);
        const piezaSize = parseInt(computedStyle.getPropertyValue('--pieza-size')) || 90;
        
        const totalWidth = config.cols * piezaSize;
        const totalHeight = config.filas * piezaSize;

        
        const seed = `nivel${currentLevel}_img${Math.floor(Math.random()*1000)}`;
        currentImgUrl = `https://picsum.photos/seed/${seed}/${totalWidth}/${totalHeight}`;

        fondoPista.style.width = `${totalWidth}px`;
        fondoPista.style.height = `${totalHeight}px`;
        fondoPista.style.backgroundImage = `url(${currentImgUrl})`;

        let posiciones = Array.from({length: config.total}, (_, i) => i);
        posiciones.sort(() => Math.random() - 0.5);

        posiciones.forEach((posOriginal, index) => {
            const pieza = document.createElement('div');
            pieza.classList.add('pieza');
            pieza.dataset.id = posOriginal;

            const fila = Math.floor(posOriginal / config.cols);
            const col = posOriginal % config.cols;

            pieza.style.backgroundImage = `url(${currentImgUrl})`;
            pieza.style.backgroundSize = `${totalWidth}px ${totalHeight}px`;
            pieza.style.backgroundPosition = `-${col * piezaSize}px -${fila * piezaSize}px`;

            pieza.addEventListener('click', () => manejarClick(pieza));
            
            tablero.appendChild(pieza);
        });

        statusVoz.textContent = `Nivel ${currentLevel} listo. ¡Di Ayuda si necesitas!`;
    }

    function manejarClick(pieza) {
        if (!piezaSeleccionada) {
            piezaSeleccionada = pieza;
            pieza.classList.add('seleccionada');
            tocarSonido(300, 'triangle', 0.05);
        } else {
            if (piezaSeleccionada !== pieza) {
                intercambiarPiezas(piezaSeleccionada, pieza);
                piezaSeleccionada.classList.remove('seleccionada');
                piezaSeleccionada = null;
                verificarVictoria();
            } else {
                piezaSeleccionada.classList.remove('seleccionada');
                piezaSeleccionada = null;
            }
        }
    }

    function intercambiarPiezas(nodeA, nodeB) {
        const parent = nodeA.parentNode;
        const siblingA = nodeA.nextSibling === nodeB ? nodeA : nodeA.nextSibling;
        
        nodeB.parentNode.insertBefore(nodeA, nodeB);
        parent.insertBefore(nodeB, siblingA);
        
        tocarSonido(400, 'sine', 0.1);
    }

    function verificarVictoria() {
        const piezas = document.querySelectorAll('.pieza');
        let correctas = 0;

        piezas.forEach((pieza, index) => {
            if (parseInt(pieza.dataset.id) === index) {
                correctas++;
                pieza.classList.add('correcta');
            } else {
                pieza.classList.remove('correcta');
            }
        });

        if (correctas === niveles[currentLevel].total) {
            statusVoz.textContent = "¡EXCELENTE! Nivel completado.";
            tocarMelodiaVictoria();
            
            setTimeout(() => {
                if (currentLevel < 3) {
                    alert("¡Felicidades! Pasando al siguiente nivel...");
                    cambiarNivel(1);
                } else {
                    alert("¡ERES UN CAMPEÓN! Has terminado todos los niveles.");
                }
            }, 2000);
        }
    }

    function activarPista() {
        tablero.classList.add('mostrar-pista');
        fondoPista.style.opacity = '1'; 
        
        tocarSonido(600, 'sine', 0.3); 

        setTimeout(() => {
            tablero.classList.remove('mostrar-pista');
            fondoPista.style.opacity = '0';
        }, 3000);
    }

    // --- CONTROLES ---
    function cambiarNivel(direccion) {
        cargarNivel(currentLevel + direccion);
    }

    document.getElementById('btn-reiniciar').addEventListener('click', () => cargarNivel(currentLevel));
    document.getElementById('btn-anterior').addEventListener('click', () => cambiarNivel(-1));
    document.getElementById('btn-siguiente').addEventListener('click', () => cambiarNivel(1));
    document.getElementById('btn-ayuda').addEventListener('click', activarPista);

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.lang = 'es-ES';
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            const last = event.results.length - 1;
            const texto = event.results[last][0].transcript.trim().toLowerCase();
            console.log("Voz:", texto);

            if (texto.includes('reiniciar') || texto.includes('otra vez')) {
                cargarNivel(currentLevel);
            } 
            else if (texto.includes('ayuda') || texto.includes('pista') || texto.includes('no sé')) {
                activarPista();
            }
            else if (texto.includes('siguiente') || texto.includes('adelante')) {
                cambiarNivel(1);
            }
            else if (texto.includes('anterior') || texto.includes('atrás')) {
                cambiarNivel(-1);
            }
            else if (texto.includes('nivel 1')) cargarNivel(1);
            else if (texto.includes('nivel 2')) cargarNivel(2);
            else if (texto.includes('nivel 3')) cargarNivel(3);
        };

        recognition.start();
    }
    cargarNivel(1);
});