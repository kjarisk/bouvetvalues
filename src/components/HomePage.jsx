import { useState, useEffect } from 'react';
import { getLeaderboard, clearLeaderboard } from '../utils/leaderboard';

function HomePage({ games, onGameSelect, onBack }) {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    setLeaderboard(getLeaderboard());
  }, []);

  const handleClearLeaderboard = () => {
    if (window.confirm('Are you sure you want to clear the leaderboard?')) {
      clearLeaderboard();
      setLeaderboard([]);
    }
  };

  return (
    <div className="app-container">
      <div className="home-container">
        {onBack && (
          <button className="btn btn-secondary back-to-home-btn" onClick={onBack}>
            ← Back to Mode Selection
          </button>
        )}
        <header className="header">
          <h1>🎮 Bouvet Values Arcade</h1>
          <p>Play mini-games, learn values, compete for glory!</p>
        </header>

        <div className="games-grid">
          {games.map(game => (
            <div
              key={game.id}
              className="game-card"
              onClick={() => onGameSelect(game.id)}
              style={{
                borderColor: `var(--${game.id === 'jordnaer' ? 'earth-green' : 
                              game.id === 'entusiastisk' ? 'enthusiasm-pink' :
                              game.id === 'delingskultur' ? 'sharing-blue' :
                              game.id === 'frihet' ? 'freedom-yellow' :
                              'trust-red'})`
              }}
            >
              <span className="game-icon">{game.icon}</span>
              <h2>{game.title}</h2>
              <p className="game-subtitle" style={{ 
                color: 'var(--secondary)', 
                fontStyle: 'italic',
                marginTop: '-0.5rem',
                marginBottom: '0.5rem'
              }}>
                {game.subtitle}
              </p>
              <p>{game.description}</p>
            </div>
          ))}
        </div>

        <section className="leaderboard-section">
          <h2>🏆 Global Leaderboard</h2>
          {leaderboard.length > 0 ? (
            <>
              <ul className="leaderboard-list">
                {leaderboard.map((entry, index) => (
                  <li key={index} className="leaderboard-item">
                    <span className="leaderboard-rank">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </span>
                    <span className="leaderboard-name">{entry.name}</span>
                    <span className="leaderboard-score">{entry.totalScore} pts</span>
                  </li>
                ))}
              </ul>
              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <button className="btn btn-secondary" onClick={handleClearLeaderboard}>
                  Clear Leaderboard
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>No scores yet! Be the first to play and make the leaderboard.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default HomePage;

