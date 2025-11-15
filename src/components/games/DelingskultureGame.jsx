import { useState, useEffect } from 'react';
import { addScore } from '../../utils/leaderboard';
import '../../styles/delingskultur.css';

function DelingskultureGame({ onBack, onScoreChange, multiplayerMode = false, currentPlayer }) {
  const [gameState, setGameState] = useState('ready');
  const [score, setScore] = useState(0);
  const [playerName, setPlayerName] = useState('');
  const [currentLevel, setCurrentLevel] = useState(0);
  const [placedBlocks, setPlacedBlocks] = useState({});
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [timeLeft, setTimeLeft] = useState(90);
  const [showHint, setShowHint] = useState(false);

  // Update multiplayer score
  useEffect(() => {
    if (multiplayerMode && onScoreChange) {
      onScoreChange(score);
    }
  }, [score, multiplayerMode, onScoreChange]);

  // Component types that can be used
  const components = {
    html: { label: 'HTML', icon: '📄', color: '#E34F26' },
    css: { label: 'CSS', icon: '🎨', color: '#1572B6' },
    javascript: { label: 'JavaScript', icon: '⚡', color: '#F7DF1E' },
    cloud: { label: 'Cloud', icon: '☁️', color: '#4285F4' },
    frontend: { label: 'Frontend', icon: '🖥️', color: '#61DAFB' },
    backend: { label: 'Backend', icon: '⚙️', color: '#E74C3C' },
    database: { label: 'Database', icon: '🗄️', color: '#2ECC71' },
    api: { label: 'API', icon: '🔌', color: '#FF6C37' },
    payment: { label: 'Payment', icon: '💳', color: '#00C853' },
    cart: { label: 'Cart', icon: '🛒', color: '#FF9800' },
    chatbot: { label: 'Chatbot', icon: '🤖', color: '#9C27B0' },
    nlp: { label: 'NLP', icon: '🧠', color: '#673AB7' },
    cdn: { label: 'CDN', icon: '🌐', color: '#00BCD4' },
    video: { label: 'Video', icon: '🎬', color: '#FF5722' },
    streaming: { label: 'Streaming', icon: '📺', color: '#F44336' },
    ai: { label: 'AI', icon: '🤖', color: '#9C27B0' },
    ml: { label: 'ML Model', icon: '🎯', color: '#673AB7' },
    analytics: { label: 'Analytics', icon: '📊', color: '#FFC107' },
    userProfile: { label: 'User Profile', icon: '👤', color: '#795548' }
  };

  // Level definitions with architecture requirements
  const levels = [
    {
      title: 'Level 1: Simple Website',
      description: 'Build a basic HTML page with styling and interactivity',
      slots: [
        { id: 'html', label: 'HTML Page', accepts: ['html'], hint: 'The foundation - what structure?' },
        { id: 'css', label: 'Styling', accepts: ['css'], hint: 'Make it pretty!' },
        { id: 'js', label: 'Interactivity', accepts: ['javascript'], hint: 'Add behavior' },
        { id: 'host', label: 'Hosting', accepts: ['cloud'], hint: 'Where to host it?' }
      ],
      availableBlocks: ['html', 'css', 'javascript', 'cloud', 'backend'], // Extra block as distraction
      pointsPerSlot: 50
    },
    {
      title: 'Level 2: E-Commerce Shop',
      description: 'Build a complete webshop with all necessary components',
      slots: [
        { id: 'ui', label: 'User Interface', accepts: ['frontend'], hint: 'Customer-facing app' },
        { id: 'api', label: 'API Layer', accepts: ['api'], hint: 'Connect front and back' },
        { id: 'server', label: 'Server', accepts: ['backend'], hint: 'Business logic' },
        { id: 'db', label: 'Product DB', accepts: ['database'], hint: 'Store products' },
        { id: 'cart', label: 'Shopping Cart', accepts: ['cart'], hint: 'Hold items' },
        { id: 'payment', label: 'Payment Gateway', accepts: ['payment'], hint: 'Process payments' }
      ],
      availableBlocks: ['frontend', 'backend', 'database', 'api', 'cart', 'payment', 'chatbot', 'cdn'],
      pointsPerSlot: 75
    },
    {
      title: 'Level 3: AI Chatbot Service',
      description: 'Deploy an intelligent chatbot in the cloud',
      slots: [
        { id: 'ui2', label: 'Chat Interface', accepts: ['frontend'], hint: 'Chat UI' },
        { id: 'bot', label: 'Chatbot Engine', accepts: ['chatbot'], hint: 'The bot itself' },
        { id: 'nlp', label: 'Language Processing', accepts: ['nlp'], hint: 'Understand language' },
        { id: 'api2', label: 'API Gateway', accepts: ['api'], hint: 'Connect services' },
        { id: 'server2', label: 'Backend', accepts: ['backend'], hint: 'Process requests' },
        { id: 'db2', label: 'Knowledge Base', accepts: ['database'], hint: 'Store responses' },
        { id: 'cloud2', label: 'Cloud Platform', accepts: ['cloud'], hint: 'Deploy it!' }
      ],
      availableBlocks: ['frontend', 'chatbot', 'nlp', 'api', 'backend', 'database', 'cloud', 'video', 'payment'],
      pointsPerSlot: 100
    },
    {
      title: 'Level 4: Netflix-Style Streaming',
      description: 'Build a video streaming platform like Netflix',
      slots: [
        { id: 'ui3', label: 'Web/App UI', accepts: ['frontend'], hint: 'Browse videos' },
        { id: 'cdn', label: 'Content Delivery', accepts: ['cdn'], hint: 'Fast delivery worldwide' },
        { id: 'video', label: 'Video Storage', accepts: ['video'], hint: 'Store video files' },
        { id: 'stream', label: 'Streaming Engine', accepts: ['streaming'], hint: 'Stream video' },
        { id: 'api3', label: 'API', accepts: ['api'], hint: 'Connect everything' },
        { id: 'server3', label: 'Backend', accepts: ['backend'], hint: 'Handle requests' },
        { id: 'db3', label: 'Content DB', accepts: ['database'], hint: 'Metadata storage' },
        { id: 'user', label: 'User Management', accepts: ['userProfile'], hint: 'Track users' }
      ],
      availableBlocks: ['frontend', 'cdn', 'video', 'streaming', 'api', 'backend', 'database', 'userProfile', 'chatbot', 'ai'],
      pointsPerSlot: 125
    },
    {
      title: 'Level 5: AI Personalization Service',
      description: 'Build an AI service that customizes content based on user behavior',
      slots: [
        { id: 'ui4', label: 'UI', accepts: ['frontend'], hint: 'User interface' },
        { id: 'ai', label: 'AI Engine', accepts: ['ai'], hint: 'AI brain' },
        { id: 'ml', label: 'ML Model', accepts: ['ml'], hint: 'Learn patterns' },
        { id: 'analytics', label: 'Analytics', accepts: ['analytics'], hint: 'Track behavior' },
        { id: 'api4', label: 'API Gateway', accepts: ['api'], hint: 'Service layer' },
        { id: 'server4', label: 'Backend', accepts: ['backend'], hint: 'Process data' },
        { id: 'db4', label: 'User Data', accepts: ['database'], hint: 'Store user data' },
        { id: 'user2', label: 'User Profiles', accepts: ['userProfile'], hint: 'Individual profiles' },
        { id: 'cloud3', label: 'Cloud Infrastructure', accepts: ['cloud'], hint: 'Scale it!' }
      ],
      availableBlocks: ['frontend', 'ai', 'ml', 'analytics', 'api', 'backend', 'database', 'userProfile', 'cloud', 'cdn', 'streaming'],
      pointsPerSlot: 150
    }
  ];

  // Randomize block order for current level
  const [shuffledBlocks, setShuffledBlocks] = useState([]);

  useEffect(() => {
    if (gameState === 'playing' && currentLevel < levels.length) {
      const blocks = [...levels[currentLevel].availableBlocks];
      // Shuffle array
      for (let i = blocks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
      }
      setShuffledBlocks(blocks);
      setPlacedBlocks({});
      setSelectedBlock(null);
      setShowHint(false);
    }
  }, [currentLevel, gameState]);

  // Timer
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

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setCurrentLevel(0);
    setTimeLeft(90);
    setPlacedBlocks({});
    setSelectedBlock(null);
  };

  const handleBlockClick = (blockType) => {
    // Check if block is already placed
    const isPlaced = Object.values(placedBlocks).includes(blockType);
    if (!isPlaced) {
      setSelectedBlock(blockType);
    }
  };

  const handleSlotClick = (slot) => {
    if (!selectedBlock || placedBlocks[slot.id]) return;

    // Check if selected block can go in this slot
    if (slot.accepts.includes(selectedBlock)) {
      // Correct placement!
      setPlacedBlocks(prev => ({ ...prev, [slot.id]: selectedBlock }));
      const points = levels[currentLevel].pointsPerSlot;
      setScore(s => s + points);
      setSelectedBlock(null);

      // Check if level complete
      const newPlaced = { ...placedBlocks, [slot.id]: selectedBlock };
      const allSlotsFilled = levels[currentLevel].slots.every(s => newPlaced[s.id]);
      
      if (allSlotsFilled) {
        setTimeout(() => {
          if (currentLevel < levels.length - 1) {
            setCurrentLevel(l => l + 1);
            setTimeLeft(t => Math.min(t + 30, 120)); // Bonus time
            setShowHint(false);
          } else {
            // All levels complete!
            setGameState('gameOver');
          }
        }, 800);
      }
    } else {
      // Wrong placement - no penalty, just feedback
      const slotElement = document.getElementById(`slot-${slot.id}`);
      if (slotElement) {
        slotElement.classList.add('shake');
        setTimeout(() => slotElement.classList.remove('shake'), 500);
      }
    }
  };

  const saveScore = () => {
    if (multiplayerMode) {
      onBack();
    } else if (playerName.trim()) {
      addScore(playerName.trim(), score, 'delingskultur');
      onBack();
    }
  };

  if (currentLevel >= levels.length) {
    return null; // Safety check
  }

  const level = levels[currentLevel];

  return (
    <div className="game-container delingskultur-game">
      <div className="game-header">
        <div className="game-score">
          💎 Score: {score} | 🏆 Level: {currentLevel + 1}/5 | ⏱️ {timeLeft}s
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
            <h2>🤝 Delingskultur</h2>
            <p style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--accent)' }}>
              Build Architecture Diagrams!
            </p>
            <div style={{ textAlign: 'left', margin: '1rem 0', maxWidth: '500px' }}>
              <p>📐 <strong>Drag & Drop</strong> components to build systems</p>
              <p>🏗️ <strong>5 Levels:</strong> From simple websites to AI platforms</p>
              <p>💡 <strong>Hints available</strong> if you get stuck</p>
              <p>⏱️ <strong>Complete all levels</strong> before time runs out!</p>
              <p style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>
                📚 Share your knowledge to build amazing tech!
              </p>
            </div>
            <button className="btn btn-primary btn-large" onClick={startGame}>
              🚀 Start Building
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="architecture-puzzle">
            <div className="level-header">
              <h2>{level.title}</h2>
              <p className="level-description">{level.description}</p>
              <button 
                className="btn btn-hint"
                onClick={() => setShowHint(!showHint)}
              >
                {showHint ? '🔒 Hide Hints' : '💡 Show Hints'}
              </button>
            </div>

            <div className="puzzle-layout">
              {/* Available Components */}
              <div className="components-panel">
                <h3>📦 Available Components</h3>
                <div className="components-grid">
                  {shuffledBlocks.map(blockType => {
                    const component = components[blockType];
                    const isPlaced = Object.values(placedBlocks).includes(blockType);
                    const isSelected = selectedBlock === blockType;
                    
                    return (
                      <div
                        key={blockType}
                        className={`component-block ${isPlaced ? 'placed' : ''} ${isSelected ? 'selected' : ''}`}
                        style={{
                          background: component.color,
                          opacity: isPlaced ? 0.3 : 1,
                          cursor: isPlaced ? 'not-allowed' : 'pointer'
                        }}
                        onClick={() => handleBlockClick(blockType)}
                      >
                        <div className="component-icon">{component.icon}</div>
                        <div className="component-label">{component.label}</div>
                      </div>
                    );
                  })}
                </div>
                {selectedBlock && (
                  <div className="selection-hint">
                    ✨ Selected: {components[selectedBlock].label} - Click a slot to place it!
                  </div>
                )}
              </div>

              {/* Architecture Diagram */}
              <div className="diagram-panel">
                <h3>🏗️ System Architecture</h3>
                <div className="diagram-grid">
                  {level.slots.map(slot => {
                    const placedBlock = placedBlocks[slot.id];
                    const component = placedBlock ? components[placedBlock] : null;
                    
                    return (
                      <div
                        key={slot.id}
                        id={`slot-${slot.id}`}
                        className={`diagram-slot ${placedBlock ? 'filled' : 'empty'} ${selectedBlock ? 'clickable' : ''}`}
                        onClick={() => handleSlotClick(slot)}
                      >
                        <div className="slot-label">{slot.label}</div>
                        {component ? (
                          <div className="placed-component" style={{ background: component.color }}>
                            <div className="component-icon">{component.icon}</div>
                            <div className="component-label">{component.label}</div>
                          </div>
                        ) : (
                          <div className="empty-slot-content">
                            <div className="question-mark">?</div>
                            {showHint && (
                              <div className="slot-hint">{slot.hint}</div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {gameState === 'gameOver' && (
          <div className="game-over-modal">
            <h2>{currentLevel === levels.length ? '🎉 All Levels Complete!' : '⏰ Time\'s Up!'}</h2>
            <div className="final-score">Final Score: {score}</div>
            <div className="final-score" style={{ fontSize: '1.2rem', color: 'var(--accent)' }}>
              🏆 Completed: {currentLevel}/{levels.length} levels
            </div>
            {currentLevel === levels.length && (
              <p style={{ color: 'var(--secondary)', fontSize: '1.1rem', margin: '1rem 0' }}>
                You're an architecture master! 🎓
              </p>
            )}
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

export default DelingskultureGame;

