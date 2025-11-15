import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import PlayerList from './PlayerList';
import {
  getRoom,
  updatePlayerScore,
  updateRoomState,
  finalizeGameScores,
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
  const roomCodeRef = useRef(initialRoom.code);

  useEffect(() => {
    // Subscribe to real-time room updates
    const unsubscribeRoom = subscribeToRoom(roomCodeRef.current, (updatedRoom) => {
      if (!updatedRoom) return;
      
      // If room state changed back to lobby, automatically return all players
      if (updatedRoom.gameState === 'lobby' && updatedRoom.currentGame === null) {
        onBack();
        return;
      }
      
      // Only update room state, don't cause game remount
      setRoom(updatedRoom);
    });
    
    // Subscribe to broadcast updates for local sync
    const unsubscribeBroadcast = subscribeToBroadcast((message) => {
      if (message.data.roomCode === roomCodeRef.current) {
        refreshRoom();
      }
    });

    // Activity heartbeat
    const activityInterval = setInterval(() => {
      updatePlayerActivity(roomCodeRef.current, player.id);
    }, 5000);

    return () => {
      unsubscribeRoom();
      unsubscribeBroadcast();
      clearInterval(activityInterval);
    };
  }, [player.id]); // Only depend on player.id, not room

  // Monitor score changes and update
  useEffect(() => {
    if (gameScore === 0) return; // Don't update initial score of 0
    
    // Debounce score updates to reduce Firebase writes
    if (scoreUpdateTimeout.current) {
      clearTimeout(scoreUpdateTimeout.current);
    }

    scoreUpdateTimeout.current = setTimeout(() => {
      updatePlayerScore(roomCodeRef.current, player.id, gameScore, gameId);
    }, 300); // Update every 300ms max

    return () => {
      if (scoreUpdateTimeout.current) {
        clearTimeout(scoreUpdateTimeout.current);
      }
    };
  }, [gameScore, player.id, gameId]);

  const refreshRoom = async () => {
    const updatedRoom = await getRoom(roomCodeRef.current);
    if (updatedRoom) {
      setRoom(updatedRoom);
    }
  };

  // Memoize callback functions to prevent game remounts
  const handleScoreChange = useCallback((newScore) => {
    setGameScore(newScore);
  }, []);

  const handleBack = useCallback(async () => {
    // Don't leave the room, just go back to lobby to select another game
    try {
      // First finalize scores (add current score to total score)
      await finalizeGameScores(roomCodeRef.current);
      
      // Then update room state to lobby so all players return
      await updateRoomState(roomCodeRef.current, { 
        gameState: 'lobby',
        currentGame: null 
      });
    } catch (error) {
      console.error('Error returning to lobby:', error);
    }
    onBack();
  }, [onBack]);

  // Memoize the game component to prevent unnecessary re-renders
  const gameElement = useMemo(() => (
    <GameComponent
      gameId={gameId}
      onBack={handleBack}
      onScoreChange={handleScoreChange}
      multiplayerMode={true}
      currentPlayer={player}
    />
  ), [gameId, GameComponent, handleBack, handleScoreChange, player]);

  return (
    <div className="multiplayer-game-wrapper">
      {gameElement}
      
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
}

export default MultiplayerGame;

