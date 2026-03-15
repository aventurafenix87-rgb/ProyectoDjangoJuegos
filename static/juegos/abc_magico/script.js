
const alphabet = [
    { letter: 'A', word: 'Avión', emoji: '✈️', color: '#FF6B6B' },
    { letter: 'B', word: 'Barco', emoji: '⛵', color: '#4ECDC4' },
    { letter: 'C', word: 'Casa', emoji: '🏠', color: '#45B7D1' },
    { letter: 'D', word: 'Dado', emoji: '🎲', color: '#96CEB4' },
    { letter: 'E', word: 'Elefante', emoji: '🐘', color: '#FFEAA7' },
    { letter: 'F', word: 'Flor', emoji: '🌸', color: '#DDA0DD' },
    { letter: 'G', word: 'Gato', emoji: '🐱', color: '#98D8C8' },
    { letter: 'H', word: 'Helado', emoji: '🍦', color: '#F7DC6F' },
    { letter: 'I', word: 'Iglesia', emoji: '⛪', color: '#BB8FCE' },
    { letter: 'J', word: 'Jirafa', emoji: '🦒', color: '#82E0AA' },
    { letter: 'K', word: 'Koala', emoji: '🐨', color: '#85C1E9' },
    { letter: 'L', word: 'Luna', emoji: '🌙', color: '#F8B500' },
    { letter: 'M', word: 'Manzana', emoji: '🍎', color: '#FF6F61' },
    { letter: 'N', word: 'Nube', emoji: '☁️', color: '#6B5B95' },
    { letter: 'Ñ', word: 'Ñu', emoji: '🦌', color: '#88B04B' },
    { letter: 'O', word: 'Oso', emoji: '🐻', color: '#F7CAC9' },
    { letter: 'P', word: 'Pelota', emoji: '⚽', color: '#92A8D1' },
    { letter: 'Q', word: 'Queso', emoji: '🧀', color: '#955251' },
    { letter: 'R', word: 'Ratón', emoji: '🐭', color: '#B565A7' },
    { letter: 'S', word: 'Sol', emoji: '☀️', color: '#009B77' },
    { letter: 'T', word: 'Tren', emoji: '🚂', color: '#DD4124' },
    { letter: 'U', word: 'Uva', emoji: '🍇', color: '#D65076' },
    { letter: 'V', word: 'Vaca', emoji: '🐮', color: '#45B8AC' },
    { letter: 'W', word: 'Wifi', emoji: '📶', color: '#9B59B6' },
    { letter: 'X', word: 'Xilófono', emoji: '🎹', color: '#E74C3C' },
    { letter: 'Y', word: 'Yate', emoji: '🛥️', color: '#3498DB' },
    { letter: 'Z', word: 'Zorro', emoji: '🦊', color: '#E67E22' }
];


let state = {
    level: 1,
    stars: 0,
    streak: 0,
    sounds: 0,
    completed: [],
    soundEnabled: true,
    gameMode: 'explore', 
    currentTarget: null,
    attempts: 0,
    maxAttempts: 3,
    correctAnswers: 0,
    totalQuestions: 0
};


document.addEventListener('DOMContentLoaded', () => {
    loadState();
    generateAlphabetGrid();
    updateStats();
    hideLoadingScreen();
});


function hideLoadingScreen() {
    const loading = document.querySelector('.loading-screen');
    if (loading) {
        loading.style.display = 'none';
    }
}


function loadState() {
    try {
        const saved = localStorage.getItem('abcMagicoState');
        if (saved) {
            state = { ...state, ...JSON.parse(saved) };
        }
    } catch (error) {
        console.error('Error cargando estado:', error);
    }
}

function saveState() {
    try {
        localStorage.setItem('abcMagicoState', JSON.stringify(state));
    } catch (error) {
        console.error('Error guardando estado:', error);
    }
}


function updateStats() {
    document.getElementById('levelValue').textContent = state.level;
    document.getElementById('starsValue').textContent = state.stars;
    document.getElementById('streakValue').textContent = state.streak;
    document.getElementById('correctValue').textContent = `${state.correctAnswers}/${state.totalQuestions}`;
    
    const progress = state.totalQuestions > 0 
        ? (state.correctAnswers / state.totalQuestions) * 100 
        : (state.completed.length / alphabet.length) * 100;
    
    const progressFill = document.getElementById('progressFill');
    progressFill.style.width = `${Math.min(progress, 100)}%`;
    progressFill.textContent = `${Math.round(Math.min(progress, 100))}%`;
}


function generateAlphabetGrid() {
    const grid = document.getElementById('alphabetGrid');
    if (!grid) return;
    
    grid.innerHTML = '';

    alphabet.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = `letter-card ${state.completed.includes(index) ? 'completed' : ''}`;
        card.style.borderColor = item.color;
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `Letra ${item.letter}, palabra ${item.word}`);
        
        card.innerHTML = `
            <span class="letter">${item.letter}</span>
            <span class="word">${item.word} ${item.emoji}</span>
        `;
        
        card.addEventListener('click', () => selectLetter(index, item));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectLetter(index, item);
            }
        });
        
        grid.appendChild(card);
    });
}


function selectLetter(index, item) {
    if (state.soundEnabled) {
        speakLetter(item.letter, item.word);
        showSoundWave();
    }

    if (!state.completed.includes(index)) {
        state.completed.push(index);
        state.stars += 1;
        state.sounds = Math.min(state.sounds + 1, 3);
        
        const cards = document.querySelectorAll('.letter-card');
        if (cards[index]) {
            cards[index].classList.add('completed');
        }
        
        saveState();
        updateStats();

        if (state.completed.length === alphabet.length) {
            setTimeout(showCelebration, 500);
        }
    }
}


function toggleGameMode() {
    const exploreMode = document.getElementById('exploreMode');
    const searchMode = document.getElementById('searchMode');
    const modeBtn = document.getElementById('modeBtn');
    
    if (state.gameMode === 'explore') {
        state.gameMode = 'search';
        exploreMode.classList.remove('active');
        searchMode.classList.add('active');
        modeBtn.textContent = '📖';
        modeBtn.title = 'Volver a Exploración';
        initializeSearchRound();
    } else {
        state.gameMode = 'explore';
        searchMode.classList.remove('active');
        exploreMode.classList.add('active');
        modeBtn.textContent = '🎮';
        modeBtn.title = 'Ir a Buscar la Letra';
    }
    
    saveState();
}


function initializeSearchRound() {
    // Seleccionar letra
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    state.currentTarget = alphabet[randomIndex];
    
    
    document.getElementById('targetLetter').textContent = state.currentTarget.letter;
    document.getElementById('targetWord').textContent = state.currentTarget.word;
    document.getElementById('targetImage').textContent = state.currentTarget.emoji;
    document.getElementById('searchLetter').textContent = state.currentTarget.letter;
    
    
    state.attempts = 0;
    updateAttemptCounter();
    
    
    document.getElementById('targetContainer').style.display = 'block';
    document.getElementById('searchContainer').style.display = 'none';
    
    
    if (state.soundEnabled) {
        setTimeout(() => {
            speakLetter(state.currentTarget.letter, state.currentTarget.word);
        }, 500);
    }
}

function startSearch() {
    
    document.getElementById('targetContainer').style.display = 'none';
    document.getElementById('searchContainer').style.display = 'block';
    
    
    generateOptions();
    
    
    if (state.soundEnabled) {
        setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance(`¿Dónde está la ${state.currentTarget.letter}?`);
            utterance.lang = 'es-ES';
            speechSynthesis.speak(utterance);
        }, 500);
    }
}

function generateOptions() {
    const optionsGrid = document.getElementById('optionsGrid');
    optionsGrid.innerHTML = '';
    

    const numOptions = Math.min(3 + state.level, 8);
    
    
    let options = [state.currentTarget];
    while (options.length < numOptions) {
        const randomIndex = Math.floor(Math.random() * alphabet.length);
        const randomItem = alphabet[randomIndex];
        if (!options.includes(randomItem)) {
            options.push(randomItem);
        }
    }
    
    
    options = options.sort(() => Math.random() - 0.5);
    

    options.forEach((item) => {
        const card = document.createElement('div');
        card.className = 'option-card';
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('data-letter', item.letter);
        
        card.innerHTML = `
            <span class="option-letter">${item.letter}</span>
        `;
        
        card.addEventListener('click', () => checkAnswer(item, card));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                checkAnswer(item, card);
            }
        });
        
        optionsGrid.appendChild(card);
    });
}

function checkAnswer(selectedItem, cardElement) {
    state.totalQuestions++;
    
    if (selectedItem.letter === state.currentTarget.letter) {
        
        cardElement.classList.add('correct');
        state.correctAnswers++;
        state.stars += 3;
        state.streak++;
        
        if (state.soundEnabled) {
            speakLetter(selectedItem.letter, selectedItem.word);
            showSoundWave();
        }
        
        setTimeout(() => {
            showCelebration();
        }, 500);
    } else {
        
        cardElement.classList.add('incorrect');
        state.attempts++;
        updateAttemptCounter();
        
        if (state.soundEnabled) {
            const utterance = new SpeechSynthesisUtterance('Intenta de nuevo');
            utterance.lang = 'es-ES';
            speechSynthesis.speak(utterance);
        }
        
        
        if (state.attempts >= 2) {
            showHint();
        }
        
        
        if (state.attempts >= state.maxAttempts) {
            setTimeout(() => {
                revealCorrectAnswer();
            }, 1000);
        }
    }
    
    saveState();
    updateStats();
}

function updateAttemptCounter() {
    document.getElementById('attemptValue').textContent = state.attempts + 1;
}

function showHint() {
    const hintModal = document.getElementById('hintModal');
    document.getElementById('hintLetter').textContent = state.currentTarget.letter;
    hintModal.style.display = 'block';
    
    if (state.soundEnabled) {
        const utterance = new SpeechSynthesisUtterance(`Pista: Busca la letra ${state.currentTarget.letter}`);
        utterance.lang = 'es-ES';
        speechSynthesis.speak(utterance);
    }
    
    setTimeout(() => {
        hintModal.style.display = 'none';
    }, 3000);
}

function revealCorrectAnswer() {
    const cards = document.querySelectorAll('.option-card');
    cards.forEach(card => {
        if (card.getAttribute('data-letter') === state.currentTarget.letter) {
            card.classList.add('correct');
            if (state.soundEnabled) {
                speakLetter(state.currentTarget.letter, state.currentTarget.word);
            }
        }
    });
    
    setTimeout(() => {
        showCelebration(false);
    }, 1000);
}

function nextRound() {
    closeModal();
    initializeSearchRound();
}


function speakLetter(letter, word) {
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(`${letter} como ${word}`);
        utterance.lang = 'es-ES';
        utterance.rate = 0.8;
        utterance.pitch = 1.1;
        speechSynthesis.speak(utterance);
    }
}

function showSoundWave() {
    const wave = document.getElementById('soundWave');
    wave.classList.add('active');
    setTimeout(() => wave.classList.remove('active'), 1000);
}


function showCelebration(fullStars = true) {
    const modal = document.getElementById('celebrationModal');
    const starsElement = document.getElementById('celebrationStars');
    
    starsElement.textContent = fullStars ? '⭐⭐⭐' : '⭐⭐';
    
    modal.style.display = 'flex';
    createConfetti();
    createBalloons();
    
    if (state.soundEnabled) {
        const utterance = new SpeechSynthesisUtterance('¡Felicidades! Lo Lograste');
        utterance.lang = 'es-ES';
        utterance.rate = 0.9;
        speechSynthesis.speak(utterance);
    }
}

function createConfetti() {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
    
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 4000);
        }, i * 30);
    }
}

function createBalloons() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7'];
    
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            const balloon = document.createElement('div');
            balloon.className = 'balloon';
            balloon.style.left = (Math.random() * 80 + 10) + 'vw';
            balloon.style.bottom = '-100px';
            balloon.style.background = `radial-gradient(circle at 30% 30%, ${colors[i % colors.length]}, #333)`;
            balloon.style.animationDuration = (Math.random() * 2 + 3) + 's';
            document.body.appendChild(balloon);
            
            setTimeout(() => balloon.remove(), 6000);
        }, i * 200);
    }
}

function closeModal() {
    document.getElementById('celebrationModal').style.display = 'none';
}


function toggleSound() {
    state.soundEnabled = !state.soundEnabled;
    const btn = document.getElementById('soundBtn');
    btn.textContent = state.soundEnabled ? '🔊' : '🔇';
    saveState();
}

function toggleContrast() {
    document.body.classList.toggle('high-contrast');
}

function resetProgress() {
    if (confirm('¿Estás seguro de que quieres reiniciar todo el progreso?')) {
        instantReset();
    }
}

function instantReset() {
    console.log('Reiniciando juego instantáneamente...');
    localStorage.removeItem('abcMagicoState');
    localStorage.clear(); // Limpiar todo por si acaso
    state = { 
        level: 1, 
        stars: 0, 
        streak: 0, 
        sounds: 0, 
        completed: [], 
        soundEnabled: true,
        gameMode: 'explore',
        correctAnswers: 0,
        totalQuestions: 0
    };
    saveState();
    location.reload(true); // Recarga forzada
}


document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        document.getElementById('hintModal').style.display = 'none';
    }
});


console.log('%c🎨 ABC Mágico - Cargado Exitosamente', 
    'background: #667eea; color: white; padding: 10px; border-radius: 5px; font-size: 14px;');
console.log('Estado actual:', state);