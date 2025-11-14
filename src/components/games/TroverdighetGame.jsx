import { useState, useEffect } from 'react';
import { addScore } from '../../utils/leaderboard';
import '../../styles/troverdighet.css';

function TroverdighetGame({ onBack, onScoreChange, multiplayerMode = false, currentPlayer }) {
  const [gameState, setGameState] = useState('ready');
  const [score, setScore] = useState(0);
  const [playerName, setPlayerName] = useState('');
  const [currentRound, setCurrentRound] = useState(0);
  const [lives, setLives] = useState(3);
  const [feedback, setFeedback] = useState('');
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (multiplayerMode && onScoreChange) {
      onScoreChange(score);
    }
  }, [score, multiplayerMode, onScoreChange]);

  const statements = [
    { text: "We'll leverage synergistic blockchain paradigms to disrupt the industry.", credible: false },
    { text: "We focus on delivering working software that solves real customer problems.", credible: true },
    { text: "Our AI-powered quantum machine learning will revolutionize everything.", credible: false },
    { text: "We conduct user research to understand actual needs before building.", credible: true },
    { text: "This project will be done in 2 weeks with zero bugs guaranteed.", credible: false },
    { text: "We iterate based on feedback and continuously improve our solutions.", credible: true },
    { text: "We use agile methodologies to adapt to changing requirements.", credible: true },
    { text: "Our platform is 1000x faster than any competitor without any testing.", credible: false },
    { text: "We prioritize security and follow best practices for data protection.", credible: true },
    { text: "Just add more blockchain and it will solve all scalability issues.", credible: false },
    { text: "We document our code and maintain clear technical specifications.", credible: true },
    { text: "This revolutionary framework eliminates all need for testing or QA.", credible: false },
    { text: "We collaborate with stakeholders to align technical and business goals.", credible: true },
    { text: "Our MVP will launch next week with every possible feature included.", credible: false },
    { text: "We focus on maintainable, readable code that our team can support.", credible: true },
    { text: "By adding 'cloud' to everything, we'll automatically scale infinitely.", credible: false },
    { text: "We conduct code reviews to maintain quality and share knowledge.", credible: true },
    { text: "Our app will never crash because we're using the latest JavaScript framework.", credible: false },
    { text: "We monitor our systems and respond quickly to incidents and issues.", credible: true },
    { text: "Machine learning will fix all our data quality problems automatically.", credible: false }
  ];

  const [shuffledStatements, setShuffledStatements] = useState([]);

  useEffect(() => {
    if (gameState === 'playing' && shuffledStatements.length === 0) {
      const shuffled = [...statements].sort(() => Math.random() - 0.5);
      setShuffledStatements(shuffled);
    }
  }, [gameState]);

  const handleChoice = (choice) => {
    const currentStatement = shuffledStatements[currentRound];
    const correct = currentStatement.credible === choice;

    if (correct) {
      const points = 50 + (streak * 10);
      setScore(s => s + points);
      setStreak(s => s + 1);
      setFeedback('✅ Correct!');
    } else {
      setLives(l => l - 1);
      setStreak(0);
      setFeedback('❌ Wrong!');
      
      if (lives <= 1) {
        setTimeout(() => setGameState('gameOver'), 1000);
        return;
      }
    }

    setTimeout(() => {
      setFeedback('');
      if (currentRound >= shuffledStatements.length - 1) {
        setGameState('gameOver');
      } else {
        setCurrentRound(r => r + 1);
      }
    }, 1000);
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setCurrentRound(0);
    setLives(3);
    setStreak(0);
    setFeedback('');
    setShuffledStatements([]);
  };

  const saveScore = () => {
    if (multiplayerMode) {
      onBack();
    } else if (playerName.trim()) {
      addScore(playerName.trim(), score, 'troverdighet');
      onBack();
    }
  };

  const currentStatement = shuffledStatements[currentRound];

  return (
    <div className="game-container troverdighet-game">
      <div className="game-header">
        <div className="game-score">
          Score: {score} | Streak: {streak}x | Lives: {'❤️'.repeat(lives)}
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
            <h2>Troverdighet 🎯</h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
              Spot the bullshit!
            </p>
            <p>Read each statement carefully</p>
            <p>Decide if it's CREDIBLE or BULLSHIT</p>
            <p>3 strikes and you're out!</p>
            <button className="btn btn-primary" onClick={startGame}>
              Start Game
            </button>
          </div>
        )}

        {gameState === 'playing' && currentStatement && (
          <div className="statement-container">
            <div className="progress-indicator">
              Statement {currentRound + 1} of {shuffledStatements.length}
            </div>

            <div className="statement-card">
              <div className="statement-icon">
                {currentStatement.credible ? '✓' : '💩'}
              </div>
              <p className="statement-text">
                "{currentStatement.text}"
              </p>
            </div>

            {feedback && (
              <div className="feedback-banner">
                {feedback}
              </div>
            )}

            {!feedback && (
              <div className="choice-buttons">
                <button
                  className="choice-btn credible-btn"
                  onClick={() => handleChoice(true)}
                >
                  ✅ CREDIBLE
                </button>
                <button
                  className="choice-btn bullshit-btn"
                  onClick={() => handleChoice(false)}
                >
                  💩 BULLSHIT
                </button>
              </div>
            )}
          </div>
        )}

        {gameState === 'gameOver' && (
          <div className="game-over-modal">
            <h2>Game Over!</h2>
            <div className="final-score">Score: {score}</div>
            <div className="final-score" style={{ fontSize: '1.2rem', color: 'var(--accent)' }}>
              Answered: {currentRound} / {shuffledStatements.length}
            </div>
            <p>
              {lives > 0 ? "You completed all statements!" : "Better luck next time!"}
            </p>
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

export default TroverdighetGame;

