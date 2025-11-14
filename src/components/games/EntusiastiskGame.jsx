import { useState, useEffect, useRef } from 'react';
import { addScore } from '../../utils/leaderboard';
import '../../styles/entusiastisk.css';

function EntusiastiskGame({ onBack, onScoreChange, multiplayerMode = false, currentPlayer }) {
  const [gameState, setGameState] = useState('ready');
  const [score, setScore] = useState(0);
  const [playerName, setPlayerName] = useState('');
  const [energy, setEnergy] = useState(100);
  const [fallingNotes, setFallingNotes] = useState([]);
  const [combo, setCombo] = useState(0);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (multiplayerMode && onScoreChange) {
      onScoreChange(score);
    }
  }, [score, multiplayerMode, onScoreChange]);

  const lanes = [
    { key: 'a', color: '#FF6B6B', label: 'A' },
    { key: 's', color: '#4ECDC4', label: 'S' },
    { key: 'd', color: '#FFE66D', label: 'D' },
    { key: 'f', color: '#95E1D3', label: 'F' }
  ];

  const hypeWords = ['AWESOME!', 'GREAT!', 'AMAZING!', 'FANTASTIC!', 'BRILLIANT!', 'EXCELLENT!'];

  useEffect(() => {
    if (gameState === 'playing') {
      // Spawn notes
      const spawnInterval = setInterval(() => {
        const lane = Math.floor(Math.random() * 4);
        const isNegative = Math.random() < 0.2;
        setFallingNotes(prev => [...prev, {
          id: Date.now() + Math.random(),
          lane,
          y: 0,
          isNegative,
          speed: 1.5 + Math.random() * 0.5
        }]);
      }, 800);

      // Move notes and decay energy
      const updateInterval = setInterval(() => {
        setFallingNotes(prev => {
          const updated = prev.map(note => ({ ...note, y: note.y + note.speed }));
          // Remove missed notes and penalize
          const remaining = updated.filter(note => {
            if (note.y > 100) {
              if (!note.isNegative) {
                setEnergy(e => Math.max(0, e - 5));
                setCombo(0);
              }
              return false;
            }
            return true;
          });
          return remaining;
        });

        setEnergy(e => Math.max(0, e - 0.3)); // Energy decay
      }, 50);

      return () => {
        clearInterval(spawnInterval);
        clearInterval(updateInterval);
      };
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'playing' && energy <= 0) {
      setGameState('gameOver');
    }
  }, [energy, gameState]);

  useEffect(() => {
    if (gameState === 'playing') {
      const handleKeyPress = (e) => {
        const laneIndex = lanes.findIndex(l => l.key === e.key.toLowerCase());
        if (laneIndex !== -1) {
          handleTap(laneIndex);
        }
      };

      window.addEventListener('keypress', handleKeyPress);
      return () => window.removeEventListener('keypress', handleKeyPress);
    }
  }, [gameState, fallingNotes]);

  const handleTap = (laneIndex) => {
    // Check if there's a note in the hit zone
    const hitZoneStart = 80;
    const hitZoneEnd = 95;
    
    const hitNote = fallingNotes.find(note => 
      note.lane === laneIndex && 
      note.y >= hitZoneStart && 
      note.y <= hitZoneEnd
    );

    if (hitNote) {
      setFallingNotes(prev => prev.filter(n => n.id !== hitNote.id));
      
      if (hitNote.isNegative) {
        setScore(s => Math.max(0, s - 5));
        setCombo(0);
        setFeedback('OOPS!');
        setEnergy(e => Math.max(0, e - 10));
      } else {
        const points = 10 + combo;
        setScore(s => s + points);
        setCombo(c => c + 1);
        setEnergy(e => Math.min(100, e + 5));
        setFeedback(hypeWords[Math.floor(Math.random() * hypeWords.length)]);
      }
      
      setTimeout(() => setFeedback(''), 500);
    }
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setEnergy(100);
    setFallingNotes([]);
    setCombo(0);
  };

  const saveScore = () => {
    if (multiplayerMode) {
      onBack();
    } else if (playerName.trim()) {
      addScore(playerName.trim(), score, 'entusiastisk');
      onBack();
    }
  };

  return (
    <div className="game-container entusiastisk-game">
      <div className="game-header">
        <div className="game-score">
          Score: {score} | Combo: {combo}x
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
            <h2>Entusiastisk ⚡</h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
              Keep the energy high!
            </p>
            <p>Press A, S, D, F when notes hit the line</p>
            <p>⚡ Positive notes = Energy UP</p>
            <p>💀 Negative blocks = Energy DOWN</p>
            <button className="btn btn-primary" onClick={startGame}>
              Start Game
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <>
            <div className="energy-bar-container">
              <div className="energy-label">ENERGY</div>
              <div className="energy-bar">
                <div 
                  className="energy-fill"
                  style={{ 
                    width: `${energy}%`,
                    background: energy > 50 ? 'linear-gradient(90deg, #2ECC71, #27AE60)' :
                               energy > 25 ? 'linear-gradient(90deg, #F39C12, #E67E22)' :
                               'linear-gradient(90deg, #E74C3C, #C0392B)'
                  }}
                />
              </div>
            </div>

            {feedback && (
              <div className="feedback-text">{feedback}</div>
            )}

            <div className="lanes-container">
              {lanes.map((lane, index) => (
                <div key={lane.key} className="lane" style={{ borderColor: lane.color }}>
                  <div className="lane-key" style={{ background: lane.color }}>
                    {lane.label}
                  </div>
                  <div className="hit-zone" />
                  {fallingNotes
                    .filter(note => note.lane === index)
                    .map(note => (
                      <div
                        key={note.id}
                        className={`note ${note.isNegative ? 'negative' : 'positive'}`}
                        style={{ 
                          top: `${note.y}%`,
                          background: note.isNegative ? '#E74C3C' : lane.color
                        }}
                      >
                        {note.isNegative ? '💀' : '⚡'}
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </>
        )}

        {gameState === 'gameOver' && (
          <div className="game-over-modal">
            <h2>Energy Depleted!</h2>
            <div className="final-score">Score: {score}</div>
            <div className="final-score" style={{ fontSize: '1.2rem', color: 'var(--accent)' }}>
              Max Combo: {combo}x
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

export default EntusiastiskGame;

