import { useState, useEffect, useRef } from 'react';
import { addScore } from '../../utils/leaderboard';
import '../../styles/jordnaer.css';

function JordnaerGame({ onBack, onScoreChange, multiplayerMode = false, currentPlayer }) {
  const [gameState, setGameState] = useState('ready'); // ready, playing, gameOver
  const [score, setScore] = useState(0);
  const [playerName, setPlayerName] = useState('');
  const [playerPos, setPlayerPos] = useState(50); // percentage from left
  const [fallingItems, setFallingItems] = useState([]);
  const [playerVelocity, setPlayerVelocity] = useState(2); // falling speed
  const [buzzwordHits, setBuzzwordHits] = useState(0); // Track bad hits
  const [goodStreak, setGoodStreak] = useState(0); // Track consecutive good items
  const [streakPopup, setStreakPopup] = useState(''); // Streak celebration message
  const [motivationPopup, setMotivationPopup] = useState(''); // Motivation message
  const [hitEffects, setHitEffects] = useState([]); // Visual effects when collecting items
  const [collectEffects, setCollectEffects] = useState([]); // Score popup effects
  const animationRef = useRef(null);
  const keysPressed = useRef({});

  // Update multiplayer score
  useEffect(() => {
    if (multiplayerMode && onScoreChange) {
      onScoreChange(score);
    }
  }, [score, multiplayerMode, onScoreChange]);

  const buzzwords = ['Synergy', 'Blockchain', 'AI-Powered', 'Disruptive', 'Paradigm Shift', 'Digital Transformation', 'Leverage', 'Touch Base', 'Circle Back'];
  const goodItems = ['Customer Needs', 'Real Solutions', 'User Feedback', 'Practical Ideas', 'Working Code', 'User Testing', 'Code Review'];
  
  const streakMessages = [
    '🔥 ON FIRE!',
    '⚡ AMAZING!',
    '🌟 SUPERB!',
    '💫 FANTASTIC!',
    '🎯 PERFECT!'
  ];

  const motivationMessages = [
    'Keep going! 💪',
    'You got this! 🚀',
    'Stay focused! 👀',
    'Nice moves! 🎮',
    'Crushing it! ⭐'
  ];

  useEffect(() => {
    if (gameState === 'playing') {
      const gameLoop = setInterval(() => {
        // Spawn new items
        if (Math.random() < 0.15) {
          const isBuzzword = Math.random() < 0.6;
          const items = isBuzzword ? buzzwords : goodItems;
          const newItem = {
            id: Date.now() + Math.random(),
            text: items[Math.floor(Math.random() * items.length)],
            x: Math.random() * 85 + 5,
            y: -10,
            isBuzzword,
            speed: (1 + Math.random() * 1.5) * 0.9  // 10% slower
          };
          setFallingItems(prev => [...prev, newItem]);
        }

        // Update items positions
        setFallingItems(prev => {
          return prev
            .map(item => ({ ...item, y: item.y + item.speed }))
            .filter(item => item.y < 110);
        });

        // Check collisions (bigger hitbox for bubble head)
        setFallingItems(prev => {
          const remaining = prev.filter(item => {
            const itemBottom = item.y;
            if (itemBottom > 85 && itemBottom < 95) { // Bigger vertical window
              const itemCenter = item.x + 5;
              // Bigger hitbox for the bubble head
              if (Math.abs(itemCenter - playerPos) < 7) {
                // Create hit effect (explosion at collision point)
                const hitEffectId = Date.now() + Math.random();
                const hitEffect = {
                  id: hitEffectId,
                  x: item.x,
                  y: itemBottom,
                  isBuzzword: item.isBuzzword
                };
                setHitEffects(effects => [...effects, hitEffect]);
                setTimeout(() => {
                  setHitEffects(effects => effects.filter(e => e.id !== hitEffectId));
                }, 800);
                
                // Create collect effect (score popup at player)
                const collectEffectId = Date.now() + Math.random() + 0.1;
                const collectEffect = {
                  id: collectEffectId,
                  x: playerPos,
                  y: 10,
                  isBuzzword: item.isBuzzword
                };
                setCollectEffects(effects => [...effects, collectEffect]);
                setTimeout(() => {
                  setCollectEffects(effects => effects.filter(e => e.id !== collectEffectId));
                }, 1000);
                
                if (item.isBuzzword) {
                  setScore(s => Math.max(0, s - 10));
                  setBuzzwordHits(h => h + 1);
                  setGoodStreak(0);
                  
                  // Check for game over (5 buzzwords)
                  if (buzzwordHits >= 4) {
                    setTimeout(() => setGameState('gameOver'), 100);
                  }
                } else {
                  setScore(s => s + 20);
                  const newStreak = goodStreak + 1;
                  setGoodStreak(newStreak);
                  
                  // Show streak popup at 5 in a row
                  if (newStreak === 5) {
                    const msg = streakMessages[Math.floor(Math.random() * streakMessages.length)];
                    setStreakPopup(msg);
                    setTimeout(() => setStreakPopup(''), 2000);
                    setScore(s => s + 50); // Bonus!
                  }
                }
                return false;
              }
            }
            return true;
          });
          return remaining;
        });
      }, 50);

      return () => clearInterval(gameLoop);
    }
  }, [gameState, playerPos]);

  useEffect(() => {
    if (gameState === 'playing') {
      const handleKeyDown = (e) => {
        keysPressed.current[e.key] = true;
      };
      const handleKeyUp = (e) => {
        keysPressed.current[e.key] = false;
      };

      const movePlayer = () => {
        setPlayerPos(pos => {
          let newPos = pos;
          if (keysPressed.current['ArrowLeft'] || keysPressed.current['a']) {
            newPos = Math.max(5, pos - 1); // Slower movement (was -2)
          }
          if (keysPressed.current['ArrowRight'] || keysPressed.current['d']) {
            newPos = Math.min(95, pos + 1); // Slower movement (was +2)
          }
          return newPos;
        });
        animationRef.current = requestAnimationFrame(movePlayer);
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      animationRef.current = requestAnimationFrame(movePlayer);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [gameState]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setPlayerPos(50);
    setFallingItems([]);
    setPlayerVelocity(2);
    setBuzzwordHits(0);
    setGoodStreak(0);
    setStreakPopup('');
    setMotivationPopup('');
    setCollectEffects([]);
    setHitEffects([]);
    
    // Show motivation messages periodically
    const motivationInterval = setInterval(() => {
      if (gameState === 'playing') {
        const msg = motivationMessages[Math.floor(Math.random() * motivationMessages.length)];
        setMotivationPopup(msg);
        setTimeout(() => setMotivationPopup(''), 2000);
      }
    }, 10000);
    
    // Auto end after 60 seconds
    const gameTimer = setTimeout(() => {
      setGameState('gameOver');
      clearInterval(motivationInterval);
    }, 60000);
    
    // Cleanup
    return () => {
      clearTimeout(gameTimer);
      clearInterval(motivationInterval);
    };
  };

  const saveScore = () => {
    if (multiplayerMode) {
      // In multiplayer, score is already tracked
      onBack();
    } else if (playerName.trim()) {
      addScore(playerName.trim(), score, 'jordnaer');
      onBack();
    }
  };

  return (
    <div className="game-container jordnaer-game">
      <div className="game-header">
        <div className="game-score">
          Score: {score} | Streak: {goodStreak} 🔥 | Bad: {buzzwordHits}/5 ⚠️
        </div>
        <div className="game-controls">
          <button className="btn btn-secondary" onClick={onBack}>
            {multiplayerMode ? 'Back to Lobby' : 'Back to Games'}
          </button>
        </div>
      </div>

      <div className="game-area">
        {/* Animated background clouds */}
        <div className="sky-background">
          <div className="cloud cloud-1">☁️</div>
          <div className="cloud cloud-2">☁️</div>
          <div className="cloud cloud-3">☁️</div>
          <div className="cloud cloud-4">☁️</div>
          <div className="sun">☀️</div>
          <div className="birds">🦅</div>
          <div className="birds birds-2">🦅</div>
        </div>
        {gameState === 'ready' && (
          <div className="game-over-modal">
            <h2>Jordnær 🌍</h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--accent)' }}>
              Fall from the sky and stay grounded!
            </p>
            <div style={{ textAlign: 'left', margin: '1rem 0' }}>
              <p>📄 <strong>Read carefully!</strong> Items look the same</p>
              <p>✅ Collect <strong>REAL SOLUTIONS</strong> (+20 pts)</p>
              <p>🚫 Avoid <strong>CORPORATE BUZZWORDS</strong> (-10 pts)</p>
              <p>🔥 Get <strong>5 good items</strong> in a row for bonus!</p>
              <p>⚠️ Collect <strong>5 buzzwords</strong> = GAME OVER</p>
              <p style={{ marginTop: '1rem' }}>🎮 Use <strong>← → or A D</strong> to move</p>
            </div>
            <button className="btn btn-primary" onClick={startGame}>
              🚀 Start Game
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <>
            <div 
              className="player bubble-head"
              style={{ left: `${playerPos}%` }}
            >
              <img src="/camilla.png" alt="player" />
            </div>
            {fallingItems.map(item => (
              <div
                key={item.id}
                className={`falling-item ${item.isBuzzword ? 'item-buzzword' : 'item-good'}`}
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`
                }}
              >
                {item.isBuzzword ? '📋' : '📝'} {item.text}
              </div>
            ))}
            
            {/* Hit effects */}
            {hitEffects.map(effect => (
              <div key={effect.id}>
                <div
                  className={`hit-effect ${effect.isBuzzword ? 'hit-bad' : 'hit-good'}`}
                  style={{
                    left: `${effect.x}%`,
                    top: `${effect.y}%`
                  }}
                >
                  {effect.isBuzzword ? '💥' : '✨'}
                </div>
                <div
                  className="hit-particles"
                  style={{
                    left: `${effect.x}%`,
                    top: `${effect.y}%`
                  }}
                >
                  <span className="particle particle-1" style={{ color: effect.isBuzzword ? '#E74C3C' : '#2ECC71' }}>•</span>
                  <span className="particle particle-2" style={{ color: effect.isBuzzword ? '#E74C3C' : '#2ECC71' }}>•</span>
                  <span className="particle particle-3" style={{ color: effect.isBuzzword ? '#E74C3C' : '#2ECC71' }}>•</span>
                  <span className="particle particle-4" style={{ color: effect.isBuzzword ? '#E74C3C' : '#2ECC71' }}>•</span>
                  <span className="particle particle-5" style={{ color: effect.isBuzzword ? '#E74C3C' : '#2ECC71' }}>•</span>
                  <span className="particle particle-6" style={{ color: effect.isBuzzword ? '#E74C3C' : '#2ECC71' }}>•</span>
                </div>
              </div>
            ))}
            
            {/* Streak celebration popup */}
            {streakPopup && (
              <div className="streak-popup">
                {streakPopup}
                <div className="bonus-text">+50 BONUS!</div>
              </div>
            )}
            
            {/* Motivation popup */}
            {motivationPopup && !streakPopup && (
              <div className="motivation-popup">
                {motivationPopup}
              </div>
            )}
            
            {/* Collection effects */}
            {collectEffects.map(effect => (
              <div
                key={effect.id}
                className={`collect-effect ${effect.isBuzzword ? 'effect-bad' : 'effect-good'}`}
                style={{
                  left: `${effect.x}%`,
                  bottom: `${effect.y}%`
                }}
              >
                {effect.isBuzzword ? (
                  <>
                    <div className="effect-text">-10</div>
                    <div className="effect-particles">
                      <span>💀</span>
                      <span>❌</span>
                      <span>⚠️</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="effect-text">+20</div>
                    <div className="effect-particles">
                      <span>✨</span>
                      <span>⭐</span>
                      <span>💫</span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </>
        )}

        {gameState === 'gameOver' && (
          <div className="game-over-modal">
            <h2>{buzzwordHits >= 5 ? '💥 Too Much BS!' : '🎯 Game Over!'}</h2>
            <div className="final-score">Final Score: {score}</div>
            {buzzwordHits >= 5 && (
              <p className="game-over-reason" style={{color: 'var(--warning)', marginTop: '0.5rem'}}>
                You collected too many buzzwords! 🚫
              </p>
            )}
            <div className="stats-summary">
              <div className="stat-item">
                <span className="stat-label">Best Streak:</span>
                <span className="stat-value">{goodStreak} 🔥</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Buzzwords Hit:</span>
                <span className="stat-value">{buzzwordHits} 💀</span>
              </div>
            </div>
            {!multiplayerMode && (
              <input
                type="text"
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && saveScore()}
                autoFocus
              />
            )}
            <div>
              {multiplayerMode ? (
                <>
                  <button className="btn btn-primary" onClick={startGame}>
                    Play Again
                  </button>
                  <button className="btn btn-secondary" onClick={onBack}>
                    Back to Lobby
                  </button>
                </>
              ) : (
                <>
                  <button className="btn btn-primary" onClick={saveScore}>
                    Save Score
                  </button>
                  <button className="btn btn-secondary" onClick={startGame}>
                    Play Again
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default JordnaerGame;

