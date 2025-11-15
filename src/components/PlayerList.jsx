import '../styles/avatar.css';

function PlayerList({ players, hostId, currentPlayerId, showScores = false }) {
  return (
    <div className="player-list">
      <h3>
        👥 Players ({players.length})
      </h3>
      {players.map(player => (
        <div
          key={player.id}
          className={`player-item ${player.id === hostId ? 'host' : ''} ${player.id === currentPlayerId ? 'current' : ''}`}
        >
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
                <span>{player.currentScore || 0} pts</span>
              ) : (
                <span className="total-score">🏆 {player.totalScore || 0} total</span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default PlayerList;

