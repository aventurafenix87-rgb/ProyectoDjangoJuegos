
/**
 * Universal Theme Manager for Arcade Mágico
 * Handles saving and applying Day/Night mode across all games.
 */

function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
    } else {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
    }
    // Update all toggle buttons on the page
    const themeIcons = document.querySelectorAll('.theme-icon');
    themeIcons.forEach(icon => {
        icon.textContent = theme === 'dark' ? '🌙' : '☀️';
    });
}

function toggleTheme() {
    const currentTheme = localStorage.getItem('arcadeTheme') === 'dark' ? 'light' : 'dark';
    localStorage.setItem('arcadeTheme', currentTheme);
    applyTheme(currentTheme);
}

// Initialize theme on load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('arcadeTheme') || 'dark'; // Default to dark as per landing page
    applyTheme(savedTheme);
});
