import { useState, useEffect } from 'react';
import AvatarSelector from './AvatarSelector';
import PlayerList from './PlayerList';
import {
  createRoom,
  joinRoom,
  leaveRoom,
  getRoom,
  getRoomLink,
  getRoomCodeFromUrl,
  createPlayer,
  subscribeToBroadcast,
  updatePlayerActivity
} from '../utils/multiplayer';
import '../styles/lobby.css';

function MultiplayerLobby({ onStartGame, onBackToSingle }) {
  const [stage, setStage] = useState('setup'); // setup, lobby
  const [playerName, setPlayerName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('😀');
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [room, setRoom] = useState(null);
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check if joining from URL
    const urlRoomCode = getRoomCodeFromUrl();
    if (urlRoomCode) {
      setRoomCode(urlRoomCode);
    }
  }, []);

  useEffect(() => {
    if (room) {
      // Set up broadcast listener
      const unsubscribe = subscribeToBroadcast((message) => {
        if (message.type === 'PLAYER_JOINED' && message.data.roomCode === room.code) {
          refreshRoom();
        } else if (message.type === 'PLAYER_LEFT' && message.data.roomCode === room.code) {
          refreshRoom();
        } else if (message.type === 'SCORE_UPDATE' && message.data.roomCode === room.code) {
          refreshRoom();
        } else if (message.type === 'GAME_STARTED' && message.data.roomCode === room.code) {
          onStartGame(message.data.gameId, room, currentPlayer);
        }
      });

      // Activity heartbeat
      const activityInterval = setInterval(() => {
        updatePlayerActivity(room.code, currentPlayer.id);
      }, 5000);

      // Refresh room data periodically
      const refreshInterval = setInterval(() => {
        refreshRoom();
      }, 2000);

      return () => {
        unsubscribe();
        clearInterval(activityInterval);
        clearInterval(refreshInterval);
      };
    }
  }, [room, currentPlayer]);

  const refreshRoom = () => {
    if (room) {
      const updatedRoom = getRoom(room.code);
      if (updatedRoom) {
        setRoom(updatedRoom);
      } else {
        setError('Room no longer exists');
        setRoom(null);
        setStage('setup');
      }
    }
  };

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    const player = createPlayer(playerName.trim(), selectedAvatar);
    setCurrentPlayer(player);
    
    const newRoom = createRoom(player);
    setRoom(newRoom);
    setStage('lobby');
  };

  const handleJoinRoom = () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    try {
      const player = createPlayer(playerName.trim(), selectedAvatar);
      setCurrentPlayer(player);
      
      const joinedRoom = joinRoom(roomCode.toUpperCase(), player);
      setRoom(joinedRoom);
      setStage('lobby');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLeaveRoom = () => {
    if (room && currentPlayer) {
      leaveRoom(room.code, currentPlayer.id);
    }
    setRoom(null);
    setStage('setup');
    setCurrentPlayer(null);
  };

  const handleCopyLink = () => {
    const link = getRoomLink(room.code);
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectGame = (gameId) => {
    onStartGame(gameId, room, currentPlayer);
  };

  const isHost = currentPlayer && room && room.host === currentPlayer.id;

  if (stage === 'setup') {
    return (
      <div className="lobby-container">
        <div className="lobby-card">
          <h1>🎮 Multiplayer Mode</h1>
          
          <div className="setup-form">
            <input
              type="text"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="name-input"
              maxLength={20}
            />

            <AvatarSelector
              selectedAvatar={selectedAvatar}
              onSelect={setSelectedAvatar}
            />

            {error && <div className="error-message">{error}</div>}

            <div className="lobby-actions">
              <button
                className="btn btn-primary btn-large"
                onClick={handleCreateRoom}
                disabled={!playerName.trim()}
              >
                Create New Room
              </button>

              <div className="join-section">
                <div className="divider">OR</div>
                <input
                  type="text"
                  placeholder="Enter Room Code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="room-code-input"
                  maxLength={6}
                />
                <button
                  className="btn btn-secondary btn-large"
                  onClick={handleJoinRoom}
                  disabled={!playerName.trim() || !roomCode.trim()}
                >
                  Join Room
                </button>
              </div>
            </div>

            <button className="btn btn-secondary" onClick={onBackToSingle}>
              Back to Single Player
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lobby-container">
      <div className="lobby-card">
        <h1>🎮 Game Lobby</h1>
        
        <div className="room-info">
          <div className="room-code-display">
            <span className="label">Room Code:</span>
            <span className="code">{room.code}</span>
          </div>
          <button
            className="btn btn-secondary btn-small"
            onClick={handleCopyLink}
          >
            {copied ? '✓ Copied!' : '📋 Copy Link'}
          </button>
        </div>

        <PlayerList players={room.players} hostId={room.host} currentPlayerId={currentPlayer.id} />

        <div className="lobby-info">
          <p>Share the room code or link with your friends!</p>
          {isHost && (
            <p className="host-info">
              👑 You are the host. Select a game to start playing!
            </p>
          )}
        </div>

        <div className="game-selection">
          <h3>Select a Game</h3>
          <div className="game-grid-small">
            <button className="game-btn" onClick={() => handleSelectGame('jordnaer')}>
              🌍 Jordnær
            </button>
            <button className="game-btn" onClick={() => handleSelectGame('entusiastisk')}>
              ⚡ Entusiastisk
            </button>
            <button className="game-btn" onClick={() => handleSelectGame('delingskultur')}>
              🤝 Delingskultur
            </button>
            <button className="game-btn" onClick={() => handleSelectGame('frihet')}>
              🎨 Frihet
            </button>
            <button className="game-btn" onClick={() => handleSelectGame('troverdighet')}>
              🎯 Troverdighet
            </button>
          </div>
        </div>

        <button className="btn btn-secondary" onClick={handleLeaveRoom}>
          Leave Room
        </button>
      </div>
    </div>
  );
}

export default MultiplayerLobby;

