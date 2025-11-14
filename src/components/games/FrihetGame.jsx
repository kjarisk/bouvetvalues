import { useState, useEffect, useRef } from 'react';
import { addScore } from '../../utils/leaderboard';
import '../../styles/frihet.css';

function FrihetGame({ onBack, onScoreChange, multiplayerMode = false, currentPlayer }) {
  const [gameState, setGameState] = useState('ready');
  const [score, setScore] = useState(0);
  const [playerName, setPlayerName] = useState('');
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [placedBlocks, setPlacedBlocks] = useState([]);
  const [timeLeft, setTimeLeft] = useState(90);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (multiplayerMode && onScoreChange) {
      onScoreChange(score);
    }
  }, [score, multiplayerMode, onScoreChange]);

  const blockTypes = [
    { type: 'red', color: '#E74C3C', icon: '🟥', label: 'Red Block' },
    { type: 'blue', color: '#3498DB', icon: '🟦', label: 'Blue Block' },
    { type: 'green', color: '#2ECC71', icon: '🟩', label: 'Green Block' },
    { type: 'yellow', color: '#F1C40F', icon: '🟨', label: 'Yellow Block' },
    { type: 'purple', color: '#9B59B6', icon: '🟪', label: 'Purple Block' },
    { type: 'orange', color: '#E67E22', icon: '🟧', label: 'Orange Block' }
  ];

  const creationLabels = [
    'A Masterpiece!', 'Innovative!', 'Creative Genius!', 'Outside the Box!',
    'Revolutionary!', 'Bold Vision!', 'Inspiring!', 'Brilliant!'
  ];

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            finishBuilding();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState, timeLeft]);

  const handleCanvasClick = (e) => {
    if (!selectedBlock || gameState !== 'playing') return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newBlock = {
      id: Date.now(),
      ...selectedBlock,
      x,
      y,
      rotation: Math.floor(Math.random() * 4) * 90
    };

    setPlacedBlocks(prev => [...prev, newBlock]);
    setScore(s => s + 10);
  };

  const removeBlock = (blockId) => {
    setPlacedBlocks(prev => prev.filter(b => b.id !== blockId));
    setScore(s => Math.max(0, s - 5));
  };

  const finishBuilding = () => {
    // Calculate bonus based on creativity
    const uniqueColors = new Set(placedBlocks.map(b => b.type)).size;
    const creativityBonus = uniqueColors * 50 + placedBlocks.length * 5;
    setScore(s => s + creativityBonus);
    setGameState('finished');
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setPlacedBlocks([]);
    setSelectedBlock(blockTypes[0]);
    setTimeLeft(90);
  };

  const saveScore = () => {
    if (multiplayerMode) {
      onBack();
    } else if (playerName.trim()) {
      addScore(playerName.trim(), score, 'frihet');
      onBack();
    }
  };

  return (
    <div className="game-container frihet-game">
      <div className="game-header">
        <div className="game-score">
          Score: {score} | Blocks: {placedBlocks.length} | Time: {timeLeft}s
        </div>
        <div className="game-controls">
          {gameState === 'playing' && (
            <button className="btn btn-primary" onClick={finishBuilding}>
              Finish Building
            </button>
          )}
          <button className="btn btn-secondary" onClick={onBack}>
            Back to Home
          </button>
        </div>
      </div>

      <div className="game-area">
        {gameState === 'ready' && (
          <div className="game-over-modal">
            <h2>Frihet 🎨</h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
              Build freely without limits!
            </p>
            <p>Select blocks and click to place them</p>
            <p>Create whatever you imagine!</p>
            <p>More blocks = Higher score!</p>
            <button className="btn btn-primary" onClick={startGame}>
              Start Building
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <>
            <div className="block-palette">
              <h3>Block Palette</h3>
              <div className="palette-grid">
                {blockTypes.map(block => (
                  <div
                    key={block.type}
                    className={`palette-block ${selectedBlock?.type === block.type ? 'selected' : ''}`}
                    style={{ background: block.color }}
                    onClick={() => setSelectedBlock(block)}
                  >
                    <span className="palette-icon">{block.icon}</span>
                    <span className="palette-label">{block.label}</span>
                  </div>
                ))}
              </div>
              <div className="palette-hint">
                Selected: {selectedBlock?.label || 'None'}
              </div>
            </div>

            <div className="canvas-container">
              <div
                ref={canvasRef}
                className="build-canvas"
                onClick={handleCanvasClick}
              >
                {placedBlocks.map(block => (
                  <div
                    key={block.id}
                    className="placed-block"
                    style={{
                      left: `${block.x}%`,
                      top: `${block.y}%`,
                      background: block.color,
                      transform: `translate(-50%, -50%) rotate(${block.rotation}deg)`
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeBlock(block.id);
                    }}
                  >
                    {block.icon}
                  </div>
                ))}
                {placedBlocks.length === 0 && (
                  <div className="canvas-hint">
                    Click anywhere to place blocks!
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {gameState === 'finished' && (
          <div className="game-over-modal">
            <h2>{creationLabels[Math.floor(Math.random() * creationLabels.length)]}</h2>
            <div className="final-score">Score: {score}</div>
            <div className="final-score" style={{ fontSize: '1.2rem', color: 'var(--accent)' }}>
              Blocks Placed: {placedBlocks.length}
            </div>
            <p>You've created something unique!</p>
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
                    Build Again
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
                    Build Again
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

