import { useState, useEffect, useRef } from 'react';
import '../../styles/camilla.css';

function CamillaGame() {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('intro'); // intro, playing, levelComplete, gameOver, victory
  const [score, setScore] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [energy, setEnergy] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  
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
  
  // Level configurations (score-based progression: 300 points per level)
  const levels = [
    {
      name: 'Warm-Up Party',
      description: 'Time to start the party!',
      scoreThreshold: 0,
      itemSpeed: 0.6,
      spawnRate: 800,
      energyDecay: 0.15
    },
    {
      name: 'Getting Pumped',
      description: 'Energy is rising!',
      scoreThreshold: 300,
      itemSpeed: 0.85,
      spawnRate: 700,
      energyDecay: 0.2
    },
    {
      name: 'Party Mode',
      description: 'This is getting fun!',
      scoreThreshold: 600,
      itemSpeed: 1.1,
      spawnRate: 600,
      energyDecay: 0.25
    },
    {
      name: 'All-Nighter',
      description: 'Keep going!',
      scoreThreshold: 900,
      itemSpeed: 1.35,
      spawnRate: 500,
      energyDecay: 0.3
    },
    {
      name: 'Legendary',
      description: 'Maximum party mode!',
      scoreThreshold: 1200,
      itemSpeed: 1.6,
      spawnRate: 450,
      energyDecay: 0.35
    }
  ];
  
  // Item types
  const powerUps = [
    { name: 'monster1', energy: 25, points: 50, image: 'monster1.png', size: 90, isMonster: true },
    { name: 'monster2', energy: 25, points: 50, image: 'monster2.png', size: 90, isMonster: true },
    { name: 'monster3', energy: 25, points: 50, image: 'monster3.png', size: 90, isMonster: true },
    { name: 'hamster1', energy: 20, points: 40, image: 'hamster1.png', size: 60, isMonster: false },
    { name: 'hamster2', energy: 20, points: 40, image: 'hamster2.png', size: 60, isMonster: false }
  ];
  
  const sleepyItems = [
    { name: 'bed', energy: -20, points: -30, emoji: '🛏️', size: 60, isMonster: false },
    { name: 'pillow', energy: -15, points: -20, emoji: '🛌', size: 60, isMonster: false },
    { name: 'pills', energy: -15, points: -20, emoji: '💊', size: 60, isMonster: false },
    { name: 'zzz', energy: -10, points: -15, emoji: '💤', size: 60, isMonster: false }
  ];
  
  // Preload images
  useEffect(() => {
    const imagesToLoad = [
      { key: 'player', src: 'camilla.png' },
      { key: 'background', src: 'Camilla_background.jpeg' },
      { key: 'monster1', src: 'monster1.png' },
      { key: 'monster2', src: 'monster2.png' },
      { key: 'monster3', src: 'monster3.png' },
      { key: 'hamster1', src: 'hamster1.png' },
      { key: 'hamster2', src: 'hamster2.png' }
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
    audio.playbackRate = 1.0; // Normal speed initially
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
  
  // Check for level up based on score
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    // Check if we should level up
    const nextLevelIndex = currentLevel + 1;
    if (nextLevelIndex < levels.length && score >= levels[nextLevelIndex].scoreThreshold) {
      // Level up!
      setCurrentLevel(nextLevelIndex);
      setShowLevelUp(true);
      
      // Speed up music
      if (audioRef.current) {
        audioRef.current.playbackRate = 1.0 + ((nextLevelIndex + 1) * 0.1);
      }
      
      // Restore some energy as bonus
      setEnergy(e => Math.min(100, e + 25));
      
      // Hide level up message after 2.5 seconds
      setTimeout(() => {
        setShowLevelUp(false);
      }, 2500);
    }
  }, [score, currentLevel, gameState]);
  
  // Main game loop
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const level = levels[currentLevel];
    let lastSpawnTime = 0; // Start at 0 so first item spawns immediately
    
    const spawnItem = (currentTime) => {
      if (currentTime - lastSpawnTime < level.spawnRate) return;
      
      lastSpawnTime = currentTime;
      const isPowerUp = Math.random() < 0.5;
      const itemList = isPowerUp ? powerUps : sleepyItems;
      const itemType = itemList[Math.floor(Math.random() * itemList.length)];
      
      const newItem = {
        id: currentTime + Math.random(),
        type: itemType,
        x: Math.random() * 0.85 + 0.075, // 0.075 to 0.925
        y: -0.1,
        isPowerUp,
        collected: false
      };
      
      itemsRef.current.push(newItem);
      console.log('Spawned item:', newItem.type.name || newItem.type.emoji, 'Size:', newItem.type.size, 'Total items:', itemsRef.current.length);
    };
    
    const updateGame = (timestamp) => {
      const deltaTime = timestamp - lastUpdateTime.current;
      if (deltaTime < 16) {
        gameLoopRef.current = requestAnimationFrame(updateGame);
        return;
      }
      
      lastUpdateTime.current = timestamp;
      const deltaSeconds = deltaTime / 1000;
      
      // Clear canvas and draw gradient background
      ctx.fillStyle = 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(0.5, '#16213e');
      gradient.addColorStop(1, '#0f3460');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw background image centered without stretching
      if (imagesRef.current.background) {
        ctx.globalAlpha = 0.25;
        const bgImg = imagesRef.current.background;
        const scale = Math.min(canvas.width / bgImg.width, canvas.height / bgImg.height) * 0.8;
        const bgWidth = bgImg.width * scale;
        const bgHeight = bgImg.height * scale;
        const bgX = (canvas.width - bgWidth) / 2;
        const bgY = (canvas.height - bgHeight) / 2;
        ctx.drawImage(bgImg, bgX, bgY, bgWidth, bgHeight);
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
      spawnItem(timestamp);
      
      // Update and draw items
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
        
        // Dynamic collision based on item size
        const itemRadius = item.type.size / 2;
        const collisionDistance = 40 + itemRadius; // player radius + item radius
        
        if (distance < collisionDistance) {
          // Collision!
          item.collected = true;
          
          // Update score and energy
          setScore(s => Math.max(0, s + item.type.points));
          setEnergy(e => Math.min(100, Math.max(0, e + item.type.energy)));
          
          // Create particles (more for monsters!)
          const particleCount = item.type.isMonster ? 30 : 15;
          createParticles(item.x * canvas.width, item.y * canvas.height, item.isPowerUp, particleCount);
          
          return false;
        }
        
        // Draw item
        const itemSize = item.type.size;
        const img = imagesRef.current[item.type.name];
        
        if (img) {
          // Draw image maintaining aspect ratio
          const imgAspect = img.width / img.height;
          let drawWidth, drawHeight;
          
          if (imgAspect > 1) {
            // Wider than tall
            drawWidth = itemSize;
            drawHeight = itemSize / imgAspect;
          } else {
            // Taller than wide
            drawHeight = itemSize;
            drawWidth = itemSize * imgAspect;
          }
          
          const ix = item.x * canvas.width - drawWidth / 2;
          const iy = item.y * canvas.height - drawHeight / 2;
          
          ctx.drawImage(img, ix, iy, drawWidth, drawHeight);
        } else if (item.type.emoji) {
          // Draw emoji fallback for items without images
          ctx.save();
          ctx.font = `${itemSize}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(item.type.emoji, item.x * canvas.width, item.y * canvas.height);
          ctx.restore();
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
      
      // Check game over (no more time-based level completion)
      if (energy <= 0) {
        setGameState('gameOver');
        return;
      }
      
      // Check victory (completed all levels)
      if (currentLevel >= levels.length - 1 && score >= 1500) {
        setGameState('victory');
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
  
  const createParticles = (x, y, isPowerUp, count = 15) => {
    const colors = isPowerUp 
      ? ['#FFD700', '#FFA500', '#FF69B4', '#00FF00', '#FF1493', '#00FFFF'] 
      : ['#4169E1', '#6A5ACD', '#8B008B', '#483D8B'];
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = count > 15 ? 3 : 2; // Faster particles for bigger explosions
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * (speed + Math.random() * 3),
        vy: Math.sin(angle) * (speed + Math.random() * 3),
        life: 1,
        size: count > 15 ? 4 + Math.random() * 4 : 3 + Math.random() * 3, // Bigger particles for monsters
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  };
  
  const startGame = () => {
    console.log('Starting Camilla game!');
    setGameState('playing');
    setScore(0);
    setCurrentLevel(0);
    setEnergy(100);
    playerPosRef.current = { x: 0.5, y: 0.85 };
    itemsRef.current = [];
    particlesRef.current = [];
    
    console.log('Power-ups:', powerUps);
    console.log('Sleepy items:', sleepyItems);
    
    if (audioRef.current && !isMuted) {
      audioRef.current.playbackRate = 1.0; // Reset to normal speed at start
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };
  
  // Removed nextLevel function - level progression is automatic based on score
  
  const restartGame = () => {
    setGameState('intro');
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.playbackRate = 1.0; // Reset speed
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
          <div className="hud-item">
            <span className="hud-label">Next Level:</span>
            <span className="hud-value">
              {currentLevel < levels.length - 1 ? levels[currentLevel + 1].scoreThreshold : 'MAX'}
            </span>
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
      
      {/* Level Up Flare */}
      {showLevelUp && (
        <div className="level-up-flare">
          <div className="level-up-content">
            <div className="level-up-flash"></div>
            <h1 className="level-up-title">🎉 LEVEL UP! 🎉</h1>
            <h2 className="level-up-name">{levels[currentLevel].name}</h2>
            <p className="level-up-description">{levels[currentLevel].description}</p>
            <div className="level-up-bonus">+25 Energy Bonus!</div>
          </div>
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
              <p style={{color: '#FFD700', fontSize: '1.1rem', margin: '15px 0'}}>
                ⭐ Reach 300 points to level up! ⭐
              </p>
              <p className="controls-hint">Use ← → or A D to move</p>
            </div>
            <button className="game-btn game-btn-primary" onClick={startGame}>
              🚀 Let's Party!
            </button>
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

