/* ========================================
   GUESS THE NUMBER - JAVASCRIPT LOGIC
   All game mechanics and functionality
   ======================================== */

const game = {
    // Game State Variables
    secretNumber: null,
    attempts: 0,
    maxAttempts: 10,
    hintsUsed: 0,
    maxHints: 3,
    difficulty: null,
    range: 50,

    // Player Statistics
    stats: {
        totalGames: 0,
        gamesWon: 0,
        bestScore: Infinity,
        totalHints: 0,
        totalAttempts: 0
    },

    /* ========================================
       INITIALIZATION & STORAGE
       ======================================== */

    // Initialize game on page load
    init() {
        this.loadStats();
        this.updateStatsDisplay();
    },

    // Load stats from browser storage
    loadStats() {
        const saved = localStorage.getItem('guessGameStats');
        if (saved) {
            this.stats = JSON.parse(saved);
        }
    },

    // Save stats to browser storage
    saveStats() {
        localStorage.setItem('guessGameStats', JSON.stringify(this.stats));
    },

    // Update the statistics display
    updateStatsDisplay() {
        document.getElementById('totalGames').textContent = this.stats.totalGames;
        document.getElementById('gamesWon').textContent = this.stats.gamesWon;
        document.getElementById('bestScore').textContent = 
            this.stats.bestScore === Infinity ? '-' : this.stats.bestScore;
        
        // Calculate win rate percentage
        const winRate = this.stats.totalGames === 0 ? 0 : 
            Math.round((this.stats.gamesWon / this.stats.totalGames) * 100);
        document.getElementById('winRate').textContent = winRate + '%';
        
        document.getElementById('totalHints').textContent = this.stats.totalHints;
        
        // Calculate average attempts
        const avgAttempts = this.stats.totalGames === 0 ? '-' : 
            (this.stats.totalAttempts / this.stats.totalGames).toFixed(1);
        document.getElementById('avgAttempts').textContent = avgAttempts;
    },

    /* ========================================
       DIFFICULTY SELECTION
       ======================================== */

    // Player selects difficulty level
    selectDifficulty(level) {
        this.difficulty = level;

        // Define difficulty settings
        const difficulties = {
            easy: { range: 50, attempts: 10, hints: 3 },
            medium: { range: 100, attempts: 7, hints: 2 },
            hard: { range: 200, attempts: 5, hints: 1 }
        };

        // Apply difficulty settings
        const settings = difficulties[level];
        this.range = settings.range;
        this.maxAttempts = settings.attempts;
        this.maxHints = settings.hints;
        this.attempts = 0;
        this.hintsUsed = 0;

        // Generate random secret number
        this.secretNumber = Math.floor(Math.random() * this.range) + 1;

        // Show game section
        this.showSection('gameSection');
        this.updateGameInfo();
        this.clearMessage();
        document.getElementById('guessInput').focus();
    },

    /* ========================================
       UI SECTION MANAGEMENT
       ======================================== */

    // Switch between different game sections
    showSection(sectionId) {
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById(sectionId).classList.add('active');
    },

    // Update game information display
    updateGameInfo() {
        const attemptsLeft = this.maxAttempts - this.attempts;
        const hintsLeft = this.maxHints - this.hintsUsed;
        
        document.getElementById('gameInfo').innerHTML = `
            🎯 Guess a number between <strong>1</strong> and <strong>${this.range}</strong><br>
            Attempts left: <strong>${attemptsLeft}</strong> | Hints left: <strong>${hintsLeft}</strong>
        `;
        
        // Update progress bar
        const progress = ((this.attempts / this.maxAttempts) * 100);
        document.getElementById('progressFill').style.width = Math.min(progress, 100) + '%';
    },

    /* ========================================
       GUESS PROCESSING
       ======================================== */

    // Process player's guess
    makeGuess() {
        const input = document.getElementById('guessInput');
        const guess = parseInt(input.value);

        // Validate input
        if (!input.value) {
            this.showMessage('Please enter a number!', 'incorrect');
            return;
        }

        if (isNaN(guess) || guess < 1 || guess > this.range) {
            this.showMessage(`Please enter a number between 1 and ${this.range}!`, 'incorrect');
            return;
        }

        this.attempts++;
        input.value = '';

        // Check if guess is correct
        if (guess === this.secretNumber) {
            this.win();
        } else if (guess < this.secretNumber) {
            this.showMessage('📈 Too low! Try a higher number.', 'incorrect');
            this.updateGameInfo();
        } else {
            this.showMessage('📉 Too high! Try a lower number.', 'incorrect');
            this.updateGameInfo();
        }

        // Check if out of attempts
        if (this.attempts >= this.maxAttempts && guess !== this.secretNumber) {
            setTimeout(() => this.lose(), 1500);
        }
    },

    /* ========================================
       HINT SYSTEM
       ======================================== */

    // Provide hint to player
    getHint() {
        if (this.hintsUsed >= this.maxHints) {
            this.showMessage(`❌ No more hints! You've used all ${this.maxHints}.`, 'incorrect');
            return;
        }

        // Define hint messages
        const hints = [
            `💡 The number is ${this.secretNumber % 2 === 0 ? 'even' : 'odd'}`,
            `💡 The number is ${this.secretNumber < this.range / 2 ? 'less than' : 'greater than'} ${Math.floor(this.range / 2)}`,
            `💡 The number is between ${Math.max(1, this.secretNumber - 10)} and ${Math.min(this.range, this.secretNumber + 10)}`
        ];

        this.hintsUsed++;
        this.showMessage(hints[this.hintsUsed - 1], 'hint');
        this.updateGameInfo();
    },

    /* ========================================
       MESSAGES & FEEDBACK
       ======================================== */

    // Display message to player
    showMessage(text, type) {
        const msg = document.getElementById('message');
        msg.textContent = text;
        msg.className = `message show ${type}`;
    },

    // Clear message display
    clearMessage() {
        document.getElementById('message').classList.remove('show');
    },

    /* ========================================
       GAME END STATES
       ======================================== */

    // Handle winning
    win() {
        // Update statistics
        this.stats.totalGames++;
        this.stats.gamesWon++;
        this.stats.totalHints += this.hintsUsed;
        this.stats.totalAttempts += this.attempts;

        // Update best score
        if (this.attempts < this.stats.bestScore) {
            this.stats.bestScore = this.attempts;
        }

        this.saveStats();

        // Show result screen
        setTimeout(() => {
            this.showSection('resultSection');
            document.getElementById('resultEmoji').textContent = '🎉';
            document.getElementById('resultTitle').textContent = 'YOU WON!';
            document.getElementById('resultDetails').innerHTML = `
                <strong>🎯 Secret Number:</strong> ${this.secretNumber}<br>
                <strong>📊 Attempts:</strong> ${this.attempts}/${this.maxAttempts}<br>
                <strong>💡 Hints Used:</strong> ${this.hintsUsed}/${this.maxHints}<br>
                ${this.attempts <= 3 ? '<strong style="color: #22c55e;">⭐ Excellent score!</strong>' : ''}
            `;
        }, 500);
    },

    // Handle losing
    lose() {
        // Update statistics
        this.stats.totalGames++;
        this.stats.totalHints += this.hintsUsed;
        this.stats.totalAttempts += this.attempts;
        this.saveStats();

        // Show result screen
        this.showSection('resultSection');
        document.getElementById('resultEmoji').textContent = '😢';
        document.getElementById('resultTitle').textContent = 'GAME OVER!';
        document.getElementById('resultDetails').innerHTML = `
            <strong>🎯 The Number Was:</strong> ${this.secretNumber}<br>
            <strong>📊 Your Attempts:</strong> ${this.attempts}/${this.maxAttempts}<br>
            <strong>💡 Hints Used:</strong> ${this.hintsUsed}/${this.maxHints}<br>
            Better luck next time! 💪
        `;
    },

    // Handle player quitting
    quit() {
        if (confirm('Are you sure you want to quit this game?')) {
            // Update statistics
            this.stats.totalGames++;
            this.stats.totalHints += this.hintsUsed;
            this.stats.totalAttempts += this.attempts;
            this.saveStats();

            // Show result screen
            this.showSection('resultSection');
            document.getElementById('resultEmoji').textContent = '👋';
            document.getElementById('resultTitle').textContent = 'YOU QUIT!';
            document.getElementById('resultDetails').innerHTML = `
                <strong>🎯 The Number Was:</strong> ${this.secretNumber}<br>
                <strong>📊 Attempts Made:</strong> ${this.attempts}/${this.maxAttempts}
            `;
        }
    },

    /* ========================================
       REPLAY & RESET
       ======================================== */

    // Play another game
    playAgain() {
        this.updateStatsDisplay();
        this.showSection('difficultySection');
    },

    // Reset all statistics
    resetStats() {
        if (confirm('Are you sure? This will clear all your statistics!')) {
            this.stats = {
                totalGames: 0,
                gamesWon: 0,
                bestScore: Infinity,
                totalHints: 0,
                totalAttempts: 0
            };
            this.saveStats();
            this.updateStatsDisplay();
            alert('✅ Stats reset!');
        }
    }
};

/* ========================================
   PAGE INITIALIZATION
   ======================================== */

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    game.init();

    // Allow Enter key to submit guess
    document.getElementById('guessInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') game.makeGuess();
    });
});