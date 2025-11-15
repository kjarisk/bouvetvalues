import { useMemo } from 'react';
import '../styles/avatar.css';

function PlayerList({ players, hostId, currentPlayerId, showScores = false }) {
  // Sort players by TOTAL accumulated score (totalScore + currentScore)
  const sortedPlayers = useMemo(() => {
    if (!showScores) return players;
    
    return [...players].sort((a, b) => {
      // Always use total accumulated score (total + current)
      const scoreA = (a.totalScore || 0) + (a.currentScore || 0);
      const scoreB = (b.totalScore || 0) + (b.currentScore || 0);
      return scoreB - scoreA; // Descending order
    });
  }, [players, showScores]);
  
  // Calculate display score (cumulative across all games)
  const getDisplayScore = (player) => {
    return (player.totalScore || 0) + (player.currentScore || 0);
  };

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
              <div className="score-display">
                <span className="score-value">{getDisplayScore(player)}</span>
                {player.currentGame && player.currentScore > 0 && (
                  <span className="score-breakdown">
                    ({player.totalScore || 0} + {player.currentScore || 0})
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default PlayerList;

