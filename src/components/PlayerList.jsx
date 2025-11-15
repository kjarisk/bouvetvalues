import { useMemo } from 'react';
import '../styles/avatar.css';

function PlayerList({ players, hostId, currentPlayerId, showScores = false }) {
  // Sort players by score (highest first) when showing scores
  const sortedPlayers = useMemo(() => {
    if (!showScores) return players;
    
    return [...players].sort((a, b) => {
      // Use currentScore when playing, totalScore in lobby
      const scoreA = a.currentGame ? (a.currentScore || 0) : (a.totalScore || 0);
      const scoreB = b.currentGame ? (b.currentScore || 0) : (b.totalScore || 0);
      return scoreB - scoreA; // Descending order
    });
  }, [players, showScores]);

  const getRankEmoji = (index) => {
    if (!showScores) return null;
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  return (
    <div className="player-list">
      <h3>
        {showScores ? '🏆 Leaderboard' : '👥 Players'} ({players.length})
      </h3>
      {sortedPlayers.map((player, index) => (
        <div
          key={player.id}
          className={`player-item ${player.id === hostId ? 'host' : ''} ${player.id === currentPlayerId ? 'current' : ''} ${showScores ? 'ranked' : ''}`}
          style={{ 
            '--rank': index,
            animationDelay: `${index * 0.05}s`
          }}
        >
          {showScores && (
            <div className="player-rank">
              {getRankEmoji(index)}
            </div>
          )}
          <div className="player-info">
            <span className="player-avatar-icon">{player.avatar}</span>
            <div>
              <div className="player-name">
                {player.name}
                {player.id === hostId && <span className="host-badge">HOST</span>}
                {player.id === currentPlayerId && <span className="host-badge" style={{background: 'var(--secondary)'}}>YOU</span>}
              </div>
              {player.currentGame && (
                <div className="player-status">
                  Playing {player.currentGame}
                </div>
              )}
            </div>
          </div>
          {showScores && (
            <div className="player-score">
              {player.currentGame ? (
                <span className="score-value">{player.currentScore || 0} pts</span>
              ) : (
                <span className="total-score">🏆 {player.totalScore || 0}</span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default PlayerList;

