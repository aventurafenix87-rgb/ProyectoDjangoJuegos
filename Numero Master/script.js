// estado del juego
let currentAnswer = 0;
let currentOperation = '+';
let score = 0;
let level = 1;
let operations = ['+', '-', '*', '/'];
let difficulty = 1;
let maxNumber = 10;
let gameStarted = false;
const MAX_LEVEL = 10;

// DOM
let questionEl, feedbackEl, scoreEl, levelEl, optionsGrid, correctSound, levelUpSound, resetBtn;


function initGame() {
    // Obtener elementos del DOM
    questionEl = document.getElementById('question');
    feedbackEl = document.getElementById('feedback');
    scoreEl = document.getElementById('score');
    levelEl = document.getElementById('level');
    optionsGrid = document.getElementById('numOptions');
    correctSound = document.getElementById('correctSound');
    levelUpSound = document.getElementById('levelUpSound');
    resetBtn = document.getElementById('reset-btn');
    
    
    if (!allElementsExist()) {
        console.error('Error: Faltan elementos del DOM');
        return;
    }

    
    resetBtn.addEventListener('click', resetGame);
    
    
    window.speechSynthesis = window.speechSynthesis || {};
    
    console.log('Numero Master init - Versión estable');
    
    
    nextQuestion();
    
    document.addEventListener('touchstart', function(){}, {passive: true});
}

function allElementsExist() {
    return questionEl && feedbackEl && scoreEl && 
           levelEl && optionsGrid && correctSound && 
           levelUpSound && resetBtn;
}


function resetGame() {
    try {
        
        currentAnswer = 0;
        currentOperation = '+';
        score = 0;
        level = 1;
        difficulty = 1;
        maxNumber = 10;
        
        
        updateStats();
        
        optionsGrid.innerHTML = '';
        
        feedbackEl.className = 'feedback';
        feedbackEl.textContent = '';
        
        // Vibración para móviles
        if (navigator.vibrate) {
            navigator.vibrate(100);
        }
        
        // Mensaje de voz
        speak("¡Juego reiniciado! Volvemos al nivel 1");
        
        // Generar nueva pregunta
        nextQuestion();
        
        gameStarted = true;
    } catch(err) {
        console.error('Error al reiniciar el juego:', err);
        alert('Hubo un error al reiniciar el juego. Por favor, intenta de nuevo.');
    }
}

// Generar pregunta
function nextQuestion() {
    try {
        // Aumentar dificultad cada 5 niveles
        if (level % 5 === 0 && difficulty < 3) {
            difficulty++;
            maxNumber = 10 * difficulty;
        }

        
        if (difficulty >= 3) {
            currentOperation = operations[Math.floor(Math.random() * operations.length)];
        } else {
            let availableOps = difficulty >= 2 ? operations.slice(0, 3) : operations.slice(0, 2);
            currentOperation = availableOps[Math.floor(Math.random() * availableOps.length)];
        }

        let n1, n2;
        
        switch(currentOperation) {
            case '+':
                n1 = Math.floor(Math.random() * maxNumber) + 1;
                n2 = Math.floor(Math.random() * maxNumber) + 1;
                currentAnswer = n1 + n2;
                break;
            case '-':
                n1 = Math.floor(Math.random() * maxNumber) + 1;
                n2 = Math.floor(Math.random() * n1) + 1;
                currentAnswer = n1 - n2;
                break;
            case '*':
                n1 = Math.floor(Math.random() * (maxNumber / 2)) + 1;
                n2 = Math.floor(Math.random() * (maxNumber / 2)) + 1;
                currentAnswer = n1 * n2;
                break;
            case '/':
                n2 = Math.floor(Math.random() * (maxNumber / 2)) + 1;
                currentAnswer = Math.floor(Math.random() * (maxNumber / 2)) + 1;
                n1 = n2 * currentAnswer;
                break;
        }

        
        if (questionEl) questionEl.textContent = `${n1} ${currentOperation} ${n2}`;

        
        generateOptions(currentAnswer);
        
        
        const operationText = {
            '+': 'más',
            '-': 'menos',
            '*': 'por',
            '/': 'dividido entre'
        };
        speak(`¿Cuánto es ${n1} ${operationText[currentOperation]} ${n2}?`);
        
    } catch(err) {
        console.error('Error en nextQuestion:', err);
    }
}

function generateOptions(correct) {
    try {
        optionsGrid.innerHTML = '';
        let options = [correct];
        
        while(options.length < 4) {
            let r;
            switch(currentOperation) {
                case '+':
                    r = correct + Math.floor(Math.random() * 5) + 1;
                    break;
                case '-':
                    r = correct - Math.floor(Math.random() * 5) - 1;
                    if (r <= 0) r = correct + Math.floor(Math.random() * 5) + 1;
                    break;
                case '*':
                    r = correct + Math.floor(Math.random() * 10) + 1;
                    if (r % 2 === 0 && r !== correct) r = correct + 1;
                    break;
                case '/':
                    r = correct + Math.floor(Math.random() * 3) + 1;
                    if (r <= 0) r = correct + 1;
                    break;
                default:
                    r = correct + Math.floor(Math.random() * 10) + 1;
            }
            
            if(!options.includes(r) && r > 0) options.push(r);
        }
        
        
        options.sort(() => Math.random() - 0.5);

        
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'math-btn';
            btn.textContent = opt;
            btn.onclick = () => checkAnswer(opt);
            optionsGrid.appendChild(btn);
        });
        
    } catch(err) {
        console.error('Error en generateOptions:', err);
    }
}

function checkAnswer(selected) {
    try {
        const buttons = document.querySelectorAll('.math-btn');
        buttons.forEach(btn => {
            btn.disabled = true;
            if (parseInt(btn.textContent) === currentAnswer) {
                btn.classList.add('correct');
            } else if (parseInt(btn.textContent) === selected) {
                btn.classList.add('incorrect');
                
                
                if (navigator.vibrate) {
                    navigator.vibrate(300);
                }
            }
        });

        if(selected === currentAnswer) {
            showFeedback('¡Excelente! 💎', true);
            score += 10 * level;
            level++;
            
            if (level <= MAX_LEVEL) {
                levelUpSound.play();
                createMagicParticles(['🌟', '🎉', '✨']);
                updateStats();
                setTimeout(() => {
                    resetButtons();
                    nextQuestion();
                }, 2000);
            } else {
                // nivel máximo
                levelEl.textContent = "MAX";
                feedbackEl.innerHTML = "¡Felicidades! ¡Lo lograste! 🏆";
                speak("¡Felicidades! ¡Has alcanzado el nivel máximo!");
                
                if (navigator.vibrate) {
                    navigator.vibrate([300, 100, 300]);
                }
            }
        } else {
            showFeedback('Sigue intentando 💪', false);
            setTimeout(() => {
                resetButtons();
            }, 1500);
        }
    } catch(err) {
        console.error('checkAnswer error', err);
    }
}


function resetButtons() {
    const buttons = document.querySelectorAll('.math-btn');
    buttons.forEach(btn => {
        btn.disabled = false;
        btn.className = 'math-btn';
    });
}


function showFeedback(message, isCorrect) {
    feedbackEl.textContent = message;
    feedbackEl.className = 'feedback show';
    
    if (isCorrect) {
        speak(message);
    }
    
    setTimeout(() => {
        feedbackEl.className = 'feedback';
    }, 2000);
}


function updateStats() {
    scoreEl.textContent = score;
    levelEl.textContent = level;
}


function createMagicParticles(symbols) {
    if (!symbols || symbols.length === 0) return;
    
    const particleCount = 15;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        
        
        const rect = questionEl.getBoundingClientRect();
        const x = rect.left + Math.random() * rect.width;
        const y = rect.top + Math.random() * rect.height;
        
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        
        const duration = 1.5 + Math.random() * 1.5;
        const size = 0.5 + Math.random() * 1.5;
        const rotation = Math.random() * 360;
        
        particle.style.animationDuration = `${duration}s`;
        particle.style.fontSize = `${size}rem`;
        particle.style.transform = `rotate(${rotation}deg)`;
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, duration * 1000);
    }
}

function speak(text) {
    if (window.speechSynthesis && window.speechSynthesis.speak) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        window.speechSynthesis.speak(utterance);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    if (document.readyState === 'complete') {
        initGame();
    } else {
        window.addEventListener('load', initGame);
    }
}
