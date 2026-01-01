const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let activeLevel = 'kolay';
let gameRunning = false;
let bullets = [];

const levelData = {
    kolay: { hp: 4200, react: '300ms', acc: '%60', icon: '🌱', color: '#00f2ff' },
    orta: { hp: 5000, react: '200ms', acc: '%75', icon: '🔥', color: '#ffaa00' },
    zor: { hp: 6000, react: '100ms', acc: '%90', icon: '💀', color: '#ff4400' },
    efsane: { hp: 8000, react: '50ms', acc: '%99', icon: '👑', color: '#aa00ff' }
};

const player = { x: canvas.width/2, y: canvas.height - 100, hp: 5600, speed: 6 };
const bot = { x: canvas.width/2, y: 150, hp: 4200, speed: 4, lastShot: 0 };

function changeLevel(lvl) {
    activeLevel = lvl;
    const data = levelData[lvl];
    document.getElementById('level-name').innerText = lvl.toUpperCase();
    document.getElementById('level-icon').innerText = data.icon;
    document.getElementById('stat-hp').innerText = data.hp;
    document.getElementById('stat-react').innerText = data.react;
    document.getElementById('stat-acc').innerText = data.acc;
    document.getElementById('start-btn').innerText = lvl.toUpperCase() + 'I BAŞLAT';
    document.getElementById('start-btn').style.backgroundColor = data.color;
}

function startGame() {
    document.getElementById('menu').classList.add('hidden');
    gameRunning = true;
    bot.hp = levelData[activeLevel].hp;
    animate();
}

// Colt'un 6'lı burst atışı
function shootBurst(from, targetX, targetY) {
    let count = 0;
    let interval = setInterval(() => {
        const angle = Math.atan2(targetY - from.y, targetX - from.x);
        bullets.push({
            x: from.x, y: from.y,
            vx: Math.cos(angle) * 15,
            vy: Math.sin(angle) * 15,
            owner: from === player ? 'player' : 'bot'
        });
        count++;
        if (count >= 6) clearInterval(interval);
    }, 80); // Mermiler arası milisaniye
}

window.addEventListener('mousedown', (e) => {
    if(gameRunning) shootBurst(player, e.clientX, e.clientY);
});

function animate() {
    if(!gameRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Aim Line (Görseldeki beyaz çubuk)
    if (gameRunning) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.lineWidth = 20;
        ctx.moveTo(player.x, player.y);
        ctx.lineTo(player.x, 0); // Düz yukarı aim
        ctx.stroke();
    }

    // Karakterler
    ctx.fillStyle = "#00f2ff"; // Oyuncu
    ctx.beginPath(); ctx.arc(player.x, player.y, 25, 0, Math.PI*2); ctx.fill();
    
    ctx.fillStyle = "#ff4444"; // Bot
    ctx.beginPath(); ctx.arc(bot.x, bot.y, 25, 0, Math.PI*2); ctx.fill();

    // Basit Bot AI (Sağa sola dodge)
    bot.x += bot.speed;
    if(bot.x > canvas.width - 50 || bot.x < 50) bot.speed *= -1;

    // Mermi işlemleri
    bullets.forEach((b, i) => {
        b.x += b.vx; b.y += b.vy;
        ctx.fillStyle = "yellow";
        ctx.fillRect(b.x, b.y, 6, 15);

        // Çarpışma
        if(b.owner === 'player' && Math.hypot(b.x-bot.x, b.y-bot.y) < 30) {
            bot.hp -= 200; bullets.splice(i, 1);
        }
    });

    document.getElementById('player-hp-val').innerText = player.hp;
    if(bot.hp <= 0) { alert("Kazandın!"); location.reload(); }

    requestAnimationFrame(animate);
}
