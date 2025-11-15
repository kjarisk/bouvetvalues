import { useState, useEffect, useRef } from 'react';
import { addScore } from '../../utils/leaderboard';
import '../../styles/frihet.css';

function FrihetGame({ onBack, onScoreChange, multiplayerMode = false, currentPlayer }) {
  const [gameState, setGameState] = useState('ready');
  const [score, setScore] = useState(0);
  const [playerName, setPlayerName] = useState('');
  const [currentRound, setCurrentRound] = useState(0);
  const [selectedColor, setSelectedColor] = useState('red');
  const [selectedShape, setSelectedShape] = useState('square');
  const [canvas, setCanvas] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [roundComplete, setRoundComplete] = useState(false);

  useEffect(() => {
    if (multiplayerMode && onScoreChange) {
      onScoreChange(score);
    }
  }, [score, multiplayerMode, onScoreChange]);

  // Creative challenges with goals
  const challenges = [
    {
      title: '🏠 Build a House',
      description: 'Create a house using blocks!',
      hints: ['Start with a base', 'Add walls', 'Don\'t forget the roof!'],
      minBlocks: 8,
      timeLimit: 30,
      basePoints: 100
    },
    {
      title: '🚗 Design a Car',
      description: 'Build a creative vehicle!',
      hints: ['Add wheels', 'Create the body', 'Windows?'],
      minBlocks: 6,
      timeLimit: 25,
      basePoints: 150
    },
    {
      title: '😊 Make a Smiley Face',
      description: 'Express happiness with blocks!',
      hints: ['Eyes first', 'Add a smile', 'Be creative!'],
      minBlocks: 5,
      timeLimit: 20,
      basePoints: 200
    },
    {
      title: '🌳 Grow a Tree',
      description: 'Plant a colorful tree!',
      hints: ['Brown trunk', 'Green leaves', 'Maybe some fruits?'],
      minBlocks: 7,
      timeLimit: 25,
      basePoints: 250
    },
    {
      title: '🎨 Abstract Art',
      description: 'Create something unique and colorful!',
      hints: ['Use all colors', 'Be bold!', 'Freedom!'],
      minBlocks: 12,
      timeLimit: 35,
      basePoints: 300
    }
  ];

  const colors = [
    { name: 'red', color: '#E74C3C', label: 'Red' },
    { name: 'blue', color: '#3498DB', label: 'Blue' },
    { name: 'green', color: '#2ECC71', label: 'Green' },
    { name: 'yellow', color: '#F1C40F', label: 'Yellow' },
    { name: 'purple', color: '#9B59B6', label: 'Purple' },
    { name: 'orange', color: '#E67E22', label: 'Orange' },
    { name: 'brown', color: '#795548', label: 'Brown' },
    { name: 'pink', color: '#E91E63', label: 'Pink' }
  ];

  const shapes = [
    { name: 'square', icon: '■', size: 40 },
    { name: 'circle', icon: '●', size: 40 },
    { name: 'triangle', icon: '▲', size: 40 },
    { name: 'rectangle', icon: '▬', size: 40 }
  ];

  // Timer
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0 && !roundComplete) {
      const timer = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            completeRound();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState, timeLeft, roundComplete]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setCurrentRound(0);
    setCanvas([]);
    setTimeLeft(challenges[0].timeLimit);
    setRoundComplete(false);
    setSelectedColor('red');
    setSelectedShape('square');
  };

  const handleCanvasClick = (e) => {
    if (gameState !== 'playing' || roundComplete) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newBlock = {
      id: Date.now() + Math.random(),
      x: Math.max(2, Math.min(98, x)),
      y: Math.max(2, Math.min(98, y)),
      color: colors.find(c => c.name === selectedColor).color,
      colorName: selectedColor,
      shape: selectedShape,
      size: shapes.find(s => s.name === selectedShape).size
    };

    setCanvas(prev => [...prev, newBlock]);
  };

  const removeLastBlock = () => {
    if (canvas.length > 0) {
      setCanvas(prev => prev.slice(0, -1));
    }
  };

  const clearCanvas = () => {
    setCanvas([]);
  };

  const completeRound = () => {
    setRoundComplete(true);
    
    const challenge = challenges[currentRound];
    const blocksPlaced = canvas.length;
    const uniqueColors = new Set(canvas.map(b => b.colorName)).size;
    const uniqueShapes = new Set(canvas.map(b => b.shape)).size;
    
    // Calculate score
    let roundScore = 0;
    
    // Base points if minimum blocks met
    if (blocksPlaced >= challenge.minBlocks) {
      roundScore += challenge.basePoints;
    } else {
      roundScore += (blocksPlaced / challenge.minBlocks) * challenge.basePoints * 0.5;
    }
    
    // Bonus for creativity
    const creativityBonus = (uniqueColors * 20) + (uniqueShapes * 15) + (blocksPlaced * 5);
    roundScore += creativityBonus;
    
    // Time bonus
    const timeBonus = timeLeft * 3;
    roundScore += timeBonus;
    
    setScore(s => s + Math.floor(roundScore));
    
    // Show round complete screen for 2 seconds
    setTimeout(() => {
      if (currentRound < challenges.length - 1) {
        // Next round
        setCurrentRound(r => r + 1);
        setCanvas([]);
        setTimeLeft(challenges[currentRound + 1].timeLimit);
        setRoundComplete(false);
      } else {
        // Game over
        setGameState('gameOver');
      }
    }, 2500);
  };

  const saveScore = () => {
    if (multiplayerMode) {
      onBack();
    } else if (playerName.trim()) {
      addScore(playerName.trim(), score, 'frihet');
      onBack();
    }
  };

  const challenge = challenges[currentRound];

  return (
    <div className="game-container frihet-game">
      <div className="game-header">
        <div className="game-score">
          🎨 Score: {score} | 🏆 Round: {currentRound + 1}/{challenges.length} | ⏱️ {timeLeft}s
        </div>
        <div className="game-controls">
          <button className="btn btn-secondary" onClick={onBack}>
            {multiplayerMode ? 'Back to Lobby' : 'Back to Games'}
          </button>
        </div>
      </div>

      <div className="game-area">
        {gameState === 'ready' && (
          <div className="game-over-modal">
            <h2>🎨 Frihet - Creative Freedom!</h2>
            <p style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--accent)' }}>
              Express Your Creativity!
            </p>
            <div style={{ textAlign: 'left', margin: '1.5rem 0', maxWidth: '500px' }}>
              <p>🎯 <strong>{challenges.length} Creative Challenges</strong> await!</p>
              <p>🖌️ <strong>Build freely</strong> using colors and shapes</p>
              <p>⭐ <strong>Complete goals</strong> to earn points</p>
              <p>🚀 <strong>Creativity bonus</strong> for unique designs!</p>
              <p>⏱️ <strong>Time pressure</strong> - work fast!</p>
            </div>
            <button className="btn btn-primary btn-large" onClick={startGame}>
              🎨 Start Creating!
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="creative-game-layout">
            {/* Challenge Info */}
            <div className="challenge-panel">
              <div className="challenge-info">
                <h2>{challenge.title}</h2>
                <p className="challenge-description">{challenge.description}</p>
                <div className="challenge-hints">
                  <h4>💡 Hints:</h4>
                  {challenge.hints.map((hint, i) => (
                    <div key={i} className="hint-item">• {hint}</div>
                  ))}
                </div>
                <div className="challenge-goals">
                  <div className="goal-item">
                    📦 Min Blocks: {challenge.minBlocks}
                  </div>
                  <div className="goal-item">
                    📊 Placed: {canvas.length}
                  </div>
                </div>
              </div>

              {/* Color Palette */}
              <div className="color-palette">
                <h3>🎨 Colors</h3>
                <div className="color-grid">
                  {colors.map(color => (
                    <button
                      key={color.name}
                      className={`color-btn ${selectedColor === color.name ? 'selected' : ''}`}
                      style={{ background: color.color }}
                      onClick={() => setSelectedColor(color.name)}
                      title={color.label}
                    >
                      {selectedColor === color.name && '✓'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shape Selector */}
              <div className="shape-selector">
                <h3>📐 Shapes</h3>
                <div className="shape-grid">
                  {shapes.map(shape => (
                    <button
                      key={shape.name}
                      className={`shape-btn ${selectedShape === shape.name ? 'selected' : ''}`}
                      onClick={() => setSelectedShape(shape.name)}
                    >
                      <span style={{ fontSize: '2rem' }}>{shape.icon}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tools */}
              <div className="tools">
                <button className="btn btn-warning" onClick={removeLastBlock} disabled={canvas.length === 0}>
                  ↶ Undo
                </button>
                <button className="btn btn-danger" onClick={clearCanvas} disabled={canvas.length === 0}>
                  🗑️ Clear
                </button>
              </div>

              <button 
                className="btn btn-success btn-large" 
                onClick={completeRound}
                disabled={canvas.length < challenge.minBlocks}
                style={{ marginTop: '1rem' }}
              >
                {canvas.length >= challenge.minBlocks ? '✓ Done!' : `Need ${challenge.minBlocks - canvas.length} more blocks`}
              </button>
            </div>

            {/* Canvas */}
            <div className="canvas-panel">
              <div className="canvas-header">
                <h3>Your Creation</h3>
                <p>Click anywhere to place blocks!</p>
              </div>
              <div 
                className="creative-canvas"
                onClick={handleCanvasClick}
              >
                {canvas.map(block => (
                  <div
                    key={block.id}
                    className={`canvas-block shape-${block.shape}`}
                    style={{
                      left: `${block.x}%`,
                      top: `${block.y}%`,
                      background: block.color,
                      width: `${block.size}px`,
                      height: `${block.size}px`
                    }}
                  />
                ))}
                {canvas.length === 0 && (
                  <div className="canvas-placeholder">
                    Click to start building!
                  </div>
                )}
              </div>

              {roundComplete && (
                <div className="round-complete-overlay">
                  <div className="round-complete-card">
                    <h2>✨ Round Complete!</h2>
                    <p style={{ fontSize: '1.2rem', color: 'var(--accent)' }}>
                      Great creativity! 🎨
                    </p>
                    <p>Blocks: {canvas.length} | Colors: {new Set(canvas.map(b => b.colorName)).size}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {gameState === 'gameOver' && (
          <div className="game-over-modal">
            <h2>🎉 Creative Session Complete!</h2>
            <div className="final-score">Final Score: {score}</div>
            <p style={{ color: 'var(--accent)', fontSize: '1.2rem', margin: '1rem 0' }}>
              You completed all {challenges.length} challenges!
            </p>
            <p style={{ fontSize: '1rem', opacity: 0.9 }}>
              Your creativity knows no bounds! 🚀
            </p>
            {!multiplayerMode && (
              <input
                type="text"
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && saveScore()}
                autoFocus
                className="name-input"
              />
            )}
            <div className="game-over-actions">
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
                  <button className="btn btn-primary" onClick={saveScore} disabled={!playerName.trim()}>
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

export default FrihetGame;
