/* 
   FILENAME: snake.js
   DESCRIPTION: SNAKE_CMD.EXE - Memory Leak Edition
   TRIGGER: Taper "sudo" ou "snake" au clavier
*/

const GlitchSnake = {
    canvas: null,
    ctx: null,
    interval: null,
    frame: 0,
    grid: 20,
    cols: 0, rows: 0,
    
    // Gameplay
    snake: [],
    velocity: { x: 1, y: 0 },
    nextVelocity: { x: 1, y: 0 },
    food: null,
    obstacles: [], 
    score: 0,
    itemsEaten: 0, // Compteur pour la difficulté progressive
    
    // Trigger
    inputBuffer: '',
    isRunning: false,

    // Hex characters pour le corps
    chars: ['0', '1', 'X', 'A', 'F', 'B', '9', 'C'],

    init: function() {
        window.addEventListener('keydown', (e) => this.handleGlobalInput(e));
        window.addEventListener('resize', () => {
            if(this.isRunning) this.resizeCanvas();
        });
    },

    handleGlobalInput: function(e) {
        if (this.isRunning) {
            this.handleGameKey(e);
            return;
        }
        // Cheat Codes: "snake" ou "sudo"
        this.inputBuffer += e.key.toLowerCase();
        if (this.inputBuffer.length > 10) this.inputBuffer = this.inputBuffer.slice(-10);
        
        if (this.inputBuffer.endsWith('snake') || this.inputBuffer.endsWith('sudo')) {
            this.bootSystem();
        }
    },

    bootSystem: function() {
        if (!document.getElementById('cyber-snake-overlay')) this.injectDOM();
        
        const overlay = document.getElementById('cyber-snake-overlay');
        overlay.style.display = 'flex';
        this.canvas = document.getElementById('cyber-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.resizeCanvas();
        this.resetGame();
        this.isRunning = true;
        
        // Vitesse du jeu (80ms = assez rapide)
        this.interval = setInterval(() => this.loop(), 80);
    },

    injectDOM: function() {
        const div = document.createElement('div');
        div.id = 'cyber-snake-overlay';
        div.innerHTML = `
            <div class="crt-lines"></div>
            <div class="cyber-container">
                <div class="hud-top">
                    <span class="blink">>> SYSTEM_BREACH_DETECTED</span>
                    <span id="cyber-score">RAM: 0 MB</span>
                </div>
                <canvas id="cyber-canvas"></canvas>
                <div class="hud-bot">
                    [ARROWS] NAVIGATE | [ESC] ABORT
                </div>
            </div>
        `;
        document.body.appendChild(div);
    },

    resizeCanvas: function() {
        const container = document.querySelector('.cyber-container');
        // Calcul pour que le canvas tombe pile sur la grille
        const w = Math.floor((window.innerWidth * 0.8) / this.grid) * this.grid;
        const h = Math.floor((window.innerHeight * 0.7) / this.grid) * this.grid;
        this.canvas.width = w;
        this.canvas.height = h;
        this.cols = w / this.grid;
        this.rows = h / this.grid;
    },

    resetGame: function() {
        this.snake = [
            {x: 5, y: 5, char: '0'},
            {x: 4, y: 5, char: 'x'},
            {x: 3, y: 5, char: 'F'}
        ];
        this.velocity = { x: 1, y: 0 };
        this.nextVelocity = { x: 1, y: 0 };
        this.score = 0;
        this.itemsEaten = 0; // Reset du compteur de difficulté
        this.obstacles = [];
        this.spawnFood();
        this.updateHUD();
    },

    handleGameKey: function(e) {
        // Empêche le scroll avec les flèches
        if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
            e.preventDefault();
        }

        switch(e.key) {
            case 'ArrowLeft': if(this.velocity.x !== 1) this.nextVelocity = {x: -1, y: 0}; break;
            case 'ArrowRight': if(this.velocity.x !== -1) this.nextVelocity = {x: 1, y: 0}; break;
            case 'ArrowUp': if(this.velocity.y !== 1) this.nextVelocity = {x: 0, y: -1}; break;
            case 'ArrowDown': if(this.velocity.y !== -1) this.nextVelocity = {x: 0, y: 1}; break;
            case 'Escape': this.quit(); break;
        }
    },

    spawnFood: function() {
        let valid = false;
        let attempts = 0;
        while (!valid && attempts < 50) {
            this.food = {
                x: Math.floor(Math.random() * this.cols),
                y: Math.floor(Math.random() * this.rows),
                type: Math.random() > 0.8 ? 'CRITICAL' : 'DATA'
            };
            
            // Vérif collision snake & obstacles
            const onSnake = this.snake.some(s => s.x === this.food.x && s.y === this.food.y);
            const onObstacle = this.obstacles.some(o => o.x === this.food.x && o.y === this.food.y);
            
            if (!onSnake && !onObstacle) valid = true;
            attempts++;
        }
    },

    // === NOUVELLE FONCTION : Corruption Mémoire ===
    spawnObstacle: function() {
        let valid = false;
        let attempts = 0;
        
        while(!valid && attempts < 20) {
            const ox = Math.floor(Math.random() * this.cols);
            const oy = Math.floor(Math.random() * this.rows);
            valid = true;

            // Ne pas spawner sur le serpent
            if (this.snake.some(s => s.x === ox && s.y === oy)) valid = false;
            // Ne pas spawner sur la nourriture
            if (this.food && this.food.x === ox && this.food.y === oy) valid = false;
            // Ne pas spawner sur un obstacle existant
            if (this.obstacles.some(o => o.x === ox && o.y === oy)) valid = false;
            // Ne pas spawner juste devant la tête (pour laisser une chance)
            const head = this.snake[0];
            if (Math.abs(head.x - ox) < 2 && Math.abs(head.y - oy) < 2) valid = false;

            if(valid) {
                this.obstacles.push({x: ox, y: oy});
            }
            attempts++;
        }
    },

    loop: function() {
        this.velocity = this.nextVelocity;
        this.frame++;

        let head = { 
            x: this.snake[0].x + this.velocity.x, 
            y: this.snake[0].y + this.velocity.y,
            char: this.chars[Math.floor(Math.random() * this.chars.length)]
        };

        // Wrapping
        if (head.x < 0) head.x = this.cols - 1;
        if (head.x >= this.cols) head.x = 0;
        if (head.y < 0) head.y = this.rows - 1;
        if (head.y >= this.rows) head.y = 0;

        // GAME OVER
        if (this.snake.some(s => s.x === head.x && s.y === head.y) || 
            this.obstacles.some(o => o.x === head.x && o.y === head.y)) {
            this.gameOver();
            return;
        }

        this.snake.unshift(head);

        // MANGER
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += (this.food.type === 'CRITICAL' ? 50 : 10);
            this.itemsEaten++; // +1 item mangé
            this.updateHUD();
            this.triggerGlitch();
            
            // === LOGIQUE PROGRESSIVE ===
            let errorCount = 1; // Par défaut : 1 erreur
            if (this.itemsEaten >= 10) errorCount = 2;
            if (this.itemsEaten >= 20) errorCount = 3; // Max 3

            // Boucle pour faire apparaître les erreurs
            for(let i = 0; i < errorCount; i++) {
                this.spawnObstacle();
            }

            this.spawnFood();
        } else {
            this.snake.pop();
        }

        this.draw();
    },

    draw: function() {
        this.ctx.fillStyle = 'rgba(0, 10, 0, 0.25)'; // Trail
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Obstacles (ERRORS)
        this.obstacles.forEach(o => {
            // Clignotement rouge/sombre pour faire peur
            this.ctx.fillStyle = this.frame % 4 === 0 ? '#ff0000' : '#880000';
            this.ctx.fillRect(o.x * this.grid, o.y * this.grid, this.grid - 2, this.grid - 2);
            
            // Petit texte "ERR"
            this.ctx.font = '10px monospace';
            this.ctx.fillStyle = 'black';
            this.ctx.fillText('ERR', o.x * this.grid + 1, o.y * this.grid + 14);
        });

        // Snake
        this.ctx.font = 'bold 16px monospace';
        this.snake.forEach((s, index) => {
            if (index === 0) this.ctx.fillStyle = '#fff';
            else this.ctx.fillStyle = index % 2 === 0 ? '#00ff41' : '#008F11'; 
            this.ctx.fillText(s.char, s.x * this.grid + 4, s.y * this.grid + 15);
        });

        // Food
        this.ctx.fillStyle = this.food.type === 'CRITICAL' ? '#ff00ff' : '#ffff00';
        const icon = this.food.type === 'CRITICAL' ? '☣' : '💾';
        this.ctx.fillText(icon, this.food.x * this.grid + 4, this.food.y * this.grid + 15);
    },

    triggerGlitch: function() {
        const canvas = document.getElementById('cyber-canvas');
        canvas.style.filter = 'invert(1) hue-rotate(180deg) contrast(2)';
        canvas.style.transform = `translate(${Math.random()*6-3}px, ${Math.random()*6-3}px)`;
        setTimeout(() => {
            canvas.style.filter = 'none';
            canvas.style.transform = 'none';
        }, 80);
    },

    updateHUD: function() {
        // Affiche la corruption en % basé sur les obstacles
        const corruption = Math.min(100, Math.floor((this.obstacles.length / (this.cols * this.rows)) * 1000));
        document.getElementById('cyber-score').innerText = `RAM: ${this.score}MB | CORRUPTION: ${corruption}%`;
    },

    gameOver: function() {
        clearInterval(this.interval);
        this.ctx.fillStyle = 'rgba(200, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '30px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText("FATAL ERROR", this.canvas.width/2, this.canvas.height/2 - 20);
        
        this.ctx.font = '16px monospace';
        this.ctx.fillText(`MEMORY DUMPED: ${this.score} MB`, this.canvas.width/2, this.canvas.height/2 + 20);
        this.ctx.fillText("[ESC] REBOOT SYSTEM", this.canvas.width/2, this.canvas.height/2 + 50);
    },

    quit: function() {
        clearInterval(this.interval);
        this.isRunning = false;
        document.getElementById('cyber-snake-overlay').style.display = 'none';
    }
};

window.onload = () => {
    if(window.App) window.App.init();
    GlitchSnake.init();
    console.log("%c [ROOT] HIDDEN PROTOCOL READY (Try 'sudo')", "color: #00ff41; background: #000");
};
