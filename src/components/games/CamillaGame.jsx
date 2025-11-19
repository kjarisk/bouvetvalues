import { useState, useEffect, useRef } from 'react';
import '../../styles/camilla.css';

function CamillaGame() {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('intro'); // intro, playing, levelComplete, gameOver, victory
  const [score, setScore] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [energy, setEnergy] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  
  // Game refs
  const gameLoopRef = useRef(null);
  const lastUpdateTime = useRef(0);
  const playerPosRef = useRef({ x: 0.5, y: 0.85 }); // normalized 0-1
  const keysPressed = useRef({});
  const itemsRef = useRef([]);
  const particlesRef = useRef([]);
  const imagesRef = useRef({});
  const audioRef = useRef(null);
  const energyDecayTimer = useRef(0);
  
  // Level configurations
  const levels = [
    {
      name: 'Warm-Up Party',
      description: 'Time to start the party!',
      duration: 30,
      itemSpeed: 1.5,
      spawnRate: 1200,
      energyDecay: 0.15
    },
    {
      name: 'Getting Pumped',
      description: 'Energy is rising!',
      duration: 35,
      itemSpeed: 2,
      spawnRate: 1000,
      energyDecay: 0.2
    },
    {
      name: 'Party Mode',
      description: 'This is getting fun!',
      duration: 40,
      itemSpeed: 2.5,
      spawnRate: 850,
      energyDecay: 0.25
    },
    {
      name: 'All-Nighter',
      description: 'Keep going!',
      duration: 45,
      itemSpeed: 3,
      spawnRate: 700,
      energyDecay: 0.3
    },
    {
      name: 'Legendary',
      description: 'Maximum party mode!',
      duration: 50,
      itemSpeed: 3.5,
      spawnRate: 600,
      energyDecay: 0.35
    }
  ];
  
  // Item types
  const powerUps = [
    { name: 'monster1', energy: 25, points: 50, image: 'monster1.jpeg' },
    { name: 'monster2', energy: 25, points: 50, image: 'monster2.jpeg' },
    { name: 'monster3', energy: 25, points: 50, image: 'monster3.jpeg' },
    { name: 'hamster1', energy: 20, points: 40, image: 'hamster1.jpeg' },
    { name: 'hamster2', energy: 20, points: 40, image: 'hamster2.jpeg' }
  ];
  
  const sleepyItems = [
    { name: 'bed', energy: -20, points: -30, image: 'sleep-bed.png' },
    { name: 'pillow', energy: -15, points: -20, image: 'sleep-pillow.png' },
    { name: 'pills', energy: -15, points: -20, image: 'sleep-pills.png' },
    { name: 'zzz', energy: -10, points: -15, image: 'sleep-zzz.png' }
  ];
  
  // Preload images
  useEffect(() => {
    const imagesToLoad = [
      { key: 'player', src: 'camilla.png' },
      { key: 'background', src: 'Camilla_background.jpeg' },
      { key: 'monster1', src: 'monster1.jpeg' },
      { key: 'monster2', src: 'monster2.jpeg' },
      { key: 'monster3', src: 'monster3.jpeg' },
      { key: 'hamster1', src: 'hamster1.jpeg' },
      { key: 'hamster2', src: 'hamster2.jpeg' },
      ...sleepyItems.map(item => ({ key: item.name, src: item.image }))
    ];
    
    let loadedCount = 0;
    const totalImages = imagesToLoad.length;
    
    imagesToLoad.forEach(({ key, src }) => {
      const img = new Image();
      img.onload = () => {
        imagesRef.current[key] = img;
        loadedCount++;
        if (loadedCount === totalImages) {
          console.log('All images loaded!');
        }
      };
      img.onerror = () => {
        console.warn(`Failed to load image: ${src}`);
        loadedCount++;
      };
      img.src = `${import.meta.env.BASE_URL}${src}`;
    });
    
    // Setup audio
    const audio = new Audio(`${import.meta.env.BASE_URL}camilla-music.mp3`);
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);
  
  // Toggle mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);
  
  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowLeft', 'ArrowRight', 'a', 'd', 'A', 'D'].includes(e.key)) {
        e.preventDefault();
        keysPressed.current[e.key.toLowerCase()] = true;
      }
    };
    
    const handleKeyUp = (e) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  // Main game loop
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const level = levels[currentLevel];
    let levelStartTime = Date.now();
    let lastSpawnTime = Date.now();
    
    const spawnItem = () => {
      const now = Date.now();
      if (now - lastSpawnTime < level.spawnRate) return;
      
      lastSpawnTime = now;
      const isPowerUp = Math.random() < 0.5;
      const itemList = isPowerUp ? powerUps : sleepyItems;
      const itemType = itemList[Math.floor(Math.random() * itemList.length)];
      
      itemsRef.current.push({
        id: now + Math.random(),
        type: itemType,
        x: Math.random() * 0.85 + 0.075, // 0.075 to 0.925
        y: -0.1,
        isPowerUp,
        collected: false
      });
    };
    
    const updateGame = (timestamp) => {
      const deltaTime = timestamp - lastUpdateTime.current;
      if (deltaTime < 16) {
        gameLoopRef.current = requestAnimationFrame(updateGame);
        return;
      }
      
      lastUpdateTime.current = timestamp;
      const deltaSeconds = deltaTime / 1000;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw faded background
      if (imagesRef.current.background) {
        ctx.globalAlpha = 0.2;
        ctx.drawImage(imagesRef.current.background, 0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;
      }
      
      // Update player position
      const moveSpeed = 0.6 * deltaSeconds;
      if (keysPressed.current['arrowleft'] || keysPressed.current['a']) {
        playerPosRef.current.x = Math.max(0.05, playerPosRef.current.x - moveSpeed);
      }
      if (keysPressed.current['arrowright'] || keysPressed.current['d']) {
        playerPosRef.current.x = Math.min(0.95, playerPosRef.current.x + moveSpeed);
      }
      
      // Draw player with bubble-head circle
      if (imagesRef.current.player) {
        const playerSize = 80;
        const px = playerPosRef.current.x * canvas.width;
        const py = playerPosRef.current.y * canvas.height;
        
        // Draw glowing circle border (like Jordnaer game)
        ctx.save();
        
        // Outer glow
        ctx.shadowColor = 'rgba(255, 230, 109, 0.8)';
        ctx.shadowBlur = 20;
        ctx.strokeStyle = '#FFE66D';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(px, py, playerSize / 2, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner highlight
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(px, py, playerSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        
        // Clip to circle for image
        ctx.beginPath();
        ctx.arc(px, py, (playerSize / 2) - 4, 0, Math.PI * 2);
        ctx.clip();
        
        // Draw player image
        ctx.drawImage(
          imagesRef.current.player,
          px - playerSize / 2,
          py - playerSize / 2,
          playerSize,
          playerSize
        );
        
        ctx.restore();
      }
      
      // Spawn items
      spawnItem();
      
      // Update and draw items
      const itemSize = 60;
      itemsRef.current = itemsRef.current.filter(item => {
        if (item.collected) return false;
        
        // Update position
        item.y += level.itemSpeed * deltaSeconds;
        
        // Remove if off screen
        if (item.y > 1.1) return false;
        
        // Check collision (circular hitbox)
        const itemCenterX = item.x;
        const itemCenterY = item.y;
        const playerCenterX = playerPosRef.current.x;
        const playerCenterY = playerPosRef.current.y;
        
        const distance = Math.sqrt(
          Math.pow((itemCenterX - playerCenterX) * canvas.width, 2) +
          Math.pow((itemCenterY - playerCenterY) * canvas.height, 2)
        );
        
        // Player radius is 40, item radius is 30, so collision at ~60-70 pixels
        if (distance < 65) {
          // Collision!
          item.collected = true;
          
          // Update score and energy
          setScore(s => Math.max(0, s + item.type.points));
          setEnergy(e => Math.min(100, Math.max(0, e + item.type.energy)));
          
          // Create particles
          createParticles(item.x * canvas.width, item.y * canvas.height, item.isPowerUp);
          
          return false;
        }
        
        // Draw item
        const img = imagesRef.current[item.type.name];
        if (img) {
          const ix = item.x * canvas.width - itemSize / 2;
          const iy = item.y * canvas.height - itemSize / 2;
          ctx.drawImage(img, ix, iy, itemSize, itemSize);
        }
        
        return true;
      });
      
      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.life -= deltaSeconds * 2;
        if (particle.life <= 0) return false;
        
        particle.x += particle.vx * deltaSeconds * 100;
        particle.y += particle.vy * deltaSeconds * 100;
        
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        
        return true;
      });
      
      // Decay energy over time
      energyDecayTimer.current += deltaSeconds;
      if (energyDecayTimer.current >= 1) {
        energyDecayTimer.current = 0;
        setEnergy(e => Math.max(0, e - level.energyDecay));
      }
      
      // Check level completion
      const levelTime = (Date.now() - levelStartTime) / 1000;
      if (levelTime >= level.duration) {
        setGameState('levelComplete');
        return;
      }
      
      // Check game over
      if (energy <= 0) {
        setGameState('gameOver');
        return;
      }
      
      gameLoopRef.current = requestAnimationFrame(updateGame);
    };
    
    lastUpdateTime.current = performance.now();
    gameLoopRef.current = requestAnimationFrame(updateGame);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, currentLevel, energy]);
  
  const createParticles = (x, y, isPowerUp) => {
    const colors = isPowerUp 
      ? ['#FFD700', '#FFA500', '#FF69B4', '#00FF00'] 
      : ['#4169E1', '#6A5ACD', '#8B008B', '#483D8B'];
    
    for (let i = 0; i < 15; i++) {
      const angle = (Math.PI * 2 * i) / 15;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * (2 + Math.random() * 2),
        vy: Math.sin(angle) * (2 + Math.random() * 2),
        life: 1,
        size: 3 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  };
  
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setCurrentLevel(0);
    setEnergy(100);
    playerPosRef.current = { x: 0.5, y: 0.85 };
    itemsRef.current = [];
    particlesRef.current = [];
    
    if (audioRef.current && !isMuted) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };
  
  const nextLevel = () => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel(c => c + 1);
      setGameState('playing');
      // Bonus points for completing level
      setScore(s => s + 500);
      // Restore some energy
      setEnergy(e => Math.min(100, e + 30));
    } else {
      setGameState('victory');
    }
  };
  
  const restartGame = () => {
    setGameState('intro');
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };
  
  // Initialize canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resize = () => {
      const container = canvas.parentElement;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);
  
  return (
    <div className="camilla-game-container">
      <canvas ref={canvasRef} className="game-canvas" />
      
      {/* HUD */}
      {gameState === 'playing' && (
        <div className="game-hud">
          <div className="hud-item">
            <span className="hud-label">Score:</span>
            <span className="hud-value">{score}</span>
          </div>
          <div className="hud-item">
            <span className="hud-label">Level:</span>
            <span className="hud-value">{currentLevel + 1} / {levels.length}</span>
          </div>
          <div className="hud-item energy-bar-container">
            <span className="hud-label">Energy:</span>
            <div className="energy-bar">
              <div 
                className="energy-fill" 
                style={{ 
                  width: `${energy}%`,
                  backgroundColor: energy > 50 ? '#2ECC71' : energy > 25 ? '#F39C12' : '#E74C3C'
                }}
              />
            </div>
            <span className="hud-value">{Math.floor(energy)}%</span>
          </div>
          <button className="mute-btn" onClick={() => setIsMuted(!isMuted)}>
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>
      )}
      
      {/* Intro Screen */}
      {gameState === 'intro' && (
        <div className="game-overlay">
          <div className="overlay-content">
            <h1 className="game-title">Who is Camilla? 🎉</h1>
            <p className="game-subtitle">She's the life of the party!</p>
            <div className="game-instructions">
              <p>Help Camilla stay energized and party all night long!</p>
              <div className="instructions-grid">
                <div className="instruction-item good">
                  <span className="instruction-icon">⚡</span>
                  <span>Collect Monster drinks & cute hamsters for energy!</span>
                </div>
                <div className="instruction-item bad">
                  <span className="instruction-icon">😴</span>
                  <span>Avoid beds, pillows & sleepy stuff!</span>
                </div>
              </div>
              <p className="controls-hint">Use ← → or A D to move</p>
            </div>
            <button className="game-btn game-btn-primary" onClick={startGame}>
              🚀 Let's Party!
            </button>
          </div>
        </div>
      )}
      
      {/* Level Complete */}
      {gameState === 'levelComplete' && (
        <div className="game-overlay">
          <div className="overlay-content">
            <h2 className="level-title">🎊 Level Complete!</h2>
            <p className="level-subtitle">{levels[currentLevel].name}</p>
            <div className="level-stats">
              <div className="stat">Score: {score}</div>
              <div className="stat">Energy: {Math.floor(energy)}%</div>
              <div className="stat">Bonus: +500 points!</div>
            </div>
            {currentLevel < levels.length - 1 ? (
              <>
                <p className="next-level-info">
                  Next: {levels[currentLevel + 1].name}
                </p>
                <button className="game-btn game-btn-primary" onClick={nextLevel}>
                  🎯 Continue Party!
                </button>
              </>
            ) : (
              <button className="game-btn game-btn-primary" onClick={nextLevel}>
                🏆 Final Level!
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Game Over */}
      {gameState === 'gameOver' && (
        <div className="game-overlay">
          <div className="overlay-content">
            <h2 className="game-title">😴 Party's Over!</h2>
            <p className="game-subtitle">Camilla ran out of energy...</p>
            <div className="final-stats">
              <div className="stat">Final Score: {score}</div>
              <div className="stat">Level Reached: {currentLevel + 1} / {levels.length}</div>
            </div>
            <button className="game-btn game-btn-primary" onClick={restartGame}>
              🔄 Try Again
            </button>
          </div>
        </div>
      )}
      
      {/* Victory */}
      {gameState === 'victory' && (
        <div className="game-overlay">
          <div className="overlay-content victory-screen">
            <h1 className="game-title">🎉 LEGENDARY! 🎉</h1>
            <p className="game-subtitle">Camilla partied all night!</p>
            <p className="victory-message">You're a true party champion!</p>
            <div className="final-stats">
              <div className="stat mega-stat">Total Score: {score}</div>
              <div className="stat">All {levels.length} levels completed!</div>
            </div>
            <button className="game-btn game-btn-primary" onClick={restartGame}>
              🎊 Party Again!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CamillaGame;

