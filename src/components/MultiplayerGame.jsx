import { useState, useEffect, useRef } from 'react';
import PlayerList from './PlayerList';
import {
  getRoom,
  updatePlayerScore,
  leaveRoom,
  subscribeToBroadcast,
  updatePlayerActivity,
  subscribeToRoom
} from '../utils/multiplayer-firebase';
import '../styles/multiplayer-game.css';

function MultiplayerGame({ gameId, GameComponent, room: initialRoom, player, onBack }) {
  const [room, setRoom] = useState(initialRoom);
  const [showPlayers, setShowPlayers] = useState(true);
  const [gameScore, setGameScore] = useState(0);
  const scoreUpdateTimeout = useRef(null);

  useEffect(() => {
    // Subscribe to real-time room updates
    const unsubscribeRoom = subscribeToRoom(room.code, (updatedRoom) => {
      setRoom(updatedRoom);
    });
    
    // Subscribe to broadcast updates for local sync
    const unsubscribeBroadcast = subscribeToBroadcast((message) => {
      if (message.data.roomCode === room.code) {
        refreshRoom();
      }
    });

    // Activity heartbeat
    const activityInterval = setInterval(() => {
      updatePlayerActivity(room.code, player.id);
    }, 5000);

    return () => {
      unsubscribeRoom();
      unsubscribeBroadcast();
      clearInterval(activityInterval);
    };
  }, [room.code, player.id]);

  // Monitor score changes and update
  useEffect(() => {
    if (gameScore === 0) return; // Don't update initial score of 0
    
    // Debounce score updates to reduce Firebase writes
    if (scoreUpdateTimeout.current) {
      clearTimeout(scoreUpdateTimeout.current);
    }

    scoreUpdateTimeout.current = setTimeout(() => {
      updatePlayerScore(room.code, player.id, gameScore, gameId);
    }, 300); // Update every 300ms max

    return () => {
      if (scoreUpdateTimeout.current) {
        clearTimeout(scoreUpdateTimeout.current);
      }
    };
  }, [gameScore, room.code, player.id, gameId]);

  const refreshRoom = async () => {
    const updatedRoom = await getRoom(room.code);
    if (updatedRoom) {
      setRoom(updatedRoom);
    }
  };

  const handleBack = () => {
    leaveRoom(room.code, player.id);
    onBack();
  };

  // Create a wrapped version of the game component that intercepts score updates
  const GameWrapper = () => {
    return (
      <div className="multiplayer-game-wrapper">
        <GameComponent
          gameId={gameId}
          onBack={handleBack}
          onScoreChange={setGameScore}
          multiplayerMode={true}
          currentPlayer={player}
        />
        
        {/* Floating player list */}
        <div className={`floating-players ${showPlayers ? 'visible' : 'hidden'}`}>
          <button
            className="toggle-players-btn"
            onClick={() => setShowPlayers(!showPlayers)}
          >
            {showPlayers ? '▶' : '◀'} Players
          </button>
          {showPlayers && (
            <div className="players-content">
              <PlayerList
                players={room.players}
                hostId={room.host}
                currentPlayerId={player.id}
                showScores={true}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return <GameWrapper />;
}

export default MultiplayerGame;

