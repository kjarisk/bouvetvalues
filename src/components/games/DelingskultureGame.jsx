import { useState, useEffect } from 'react';
import { addScore } from '../../utils/leaderboard';
import '../../styles/delingskultur.css';

function DelingskultureGame({ onBack, onScoreChange, multiplayerMode = false, currentPlayer }) {
  const [gameState, setGameState] = useState('ready');
  const [score, setScore] = useState(0);
  const [playerName, setPlayerName] = useState('');
  const [level, setLevel] = useState(1);
  const [blocks, setBlocks] = useState([]);
  const [draggedBlock, setDraggedBlock] = useState(null);
  const [targetSlots, setTargetSlots] = useState([]);
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (multiplayerMode && onScoreChange) {
      onScoreChange(score);
    }
  }, [score, multiplayerMode, onScoreChange]);

  const knowledgeTypes = [
    { type: 'frontend', label: 'Frontend', color: '#3498DB', icon: '🎨' },
    { type: 'backend', label: 'Backend', color: '#E74C3C', icon: '⚙️' },
    { type: 'database', label: 'Database', color: '#2ECC71', icon: '🗄️' },
    { type: 'devops', label: 'DevOps', color: '#F39C12', icon: '🚀' }
  ];

  useEffect(() => {
    if (gameState === 'playing') {
      generateLevel(level);
    }
  }, [level, gameState]);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            setGameState('gameOver');
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState, timeLeft]);

  const generateLevel = (lvl) => {
    const numBlocks = Math.min(3 + lvl, 8);
    const newBlocks = [];
    const newSlots = [];

    for (let i = 0; i < numBlocks; i++) {
      const type = knowledgeTypes[Math.floor(Math.random() * knowledgeTypes.length)];
      newBlocks.push({
        id: `block-${i}`,
        ...type,
        placed: false
      });
      newSlots.push({
        id: `slot-${i}`,
        type: type.type,
        filled: false
      });
    }

    // Shuffle blocks
    newBlocks.sort(() => Math.random() - 0.5);

    setBlocks(newBlocks);
    setTargetSlots(newSlots);
  };

  const handleDragStart = (block) => {
    if (!block.placed) {
      setDraggedBlock(block);
    }
  };

  const handleDrop = (slot) => {
    if (draggedBlock && !slot.filled && draggedBlock.type === slot.type) {
      // Correct match!
      setBlocks(prev => prev.map(b => 
        b.id === draggedBlock.id ? { ...b, placed: true } : b
      ));
      setTargetSlots(prev => prev.map(s => 
        s.id === slot.id ? { ...s, filled: true, block: draggedBlock } : s
      ));
      
      const points = 50 + (level * 10);
      setScore(s => s + points);
      
      // Check if level complete
      const allFilled = targetSlots.filter(s => s.id !== slot.id).every(s => s.filled) && true;
      if (allFilled) {
        setTimeout(() => {
          setLevel(l => l + 1);
          setTimeLeft(t => t + 15); // Bonus time
        }, 500);
      }
    }
    setDraggedBlock(null);
  };

  const handleBlockClick = (block) => {
    if (!block.placed) {
      if (draggedBlock?.id === block.id) {
        setDraggedBlock(null);
      } else {
        setDraggedBlock(block);
      }
    }
  };

  const handleSlotClick = (slot) => {
    if (draggedBlock && !slot.filled) {
      handleDrop(slot);
    }
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setTimeLeft(60);
  };

  const saveScore = () => {
    if (multiplayerMode) {
      onBack();
    } else if (playerName.trim()) {
      addScore(playerName.trim(), score, 'delingskultur');
      onBack();
    }
  };

  return (
    <div className="game-container delingskultur-game">
      <div className="game-header">
        <div className="game-score">
          Score: {score} | Level: {level} | Time: {timeLeft}s
        </div>
        <div className="game-controls">
          <button className="btn btn-secondary" onClick={onBack}>
            Back to Home
          </button>
        </div>
      </div>

      <div className="game-area">
        {gameState === 'ready' && (
          <div className="game-over-modal">
            <h2>Delingskultur 🤝</h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
              Share knowledge to solve puzzles!
            </p>
            <p>Match knowledge blocks to their correct slots</p>
            <p>Click blocks and slots to match them</p>
            <p>Complete levels before time runs out!</p>
            <button className="btn btn-primary" onClick={startGame}>
              Start Game
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="puzzle-container">
            <div className="blocks-area">
              <h3>Knowledge Blocks</h3>
              <div className="blocks-grid">
                {blocks.map(block => (
                  <div
                    key={block.id}
                    className={`knowledge-block ${block.placed ? 'placed' : ''} ${draggedBlock?.id === block.id ? 'selected' : ''}`}
                    style={{ 
                      background: block.color,
                      opacity: block.placed ? 0.3 : 1,
                      cursor: block.placed ? 'default' : 'pointer'
                    }}
                    onClick={() => handleBlockClick(block)}
                    draggable={!block.placed}
                    onDragStart={() => handleDragStart(block)}
                  >
                    <span className="block-icon">{block.icon}</span>
                    <span className="block-label">{block.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="sharing-arrow">
              <div className="arrow">→</div>
              <div className="share-text">SHARE</div>
            </div>

            <div className="slots-area">
              <h3>Project Needs</h3>
              <div className="slots-grid">
                {targetSlots.map(slot => (
                  <div
                    key={slot.id}
                    className={`knowledge-slot ${slot.filled ? 'filled' : ''}`}
                    onClick={() => handleSlotClick(slot)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(slot)}
                  >
                    {slot.filled ? (
                      <>
                        <span className="block-icon">{slot.block.icon}</span>
                        <span className="block-label">{slot.block.label}</span>
                      </>
                    ) : (
                      <span className="slot-placeholder">?</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {gameState === 'gameOver' && (
          <div className="game-over-modal">
            <h2>Time's Up!</h2>
            <div className="final-score">Score: {score}</div>
            <div className="final-score" style={{ fontSize: '1.2rem', color: 'var(--accent)' }}>
              Reached Level: {level}
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

export default DelingskultureGame;

