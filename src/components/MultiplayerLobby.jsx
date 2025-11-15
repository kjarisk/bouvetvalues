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
  updatePlayerActivity,
  subscribeToRoom,
  startGame,
  getActiveRooms
} from '../utils/multiplayer-firebase';
import '../styles/lobby.css';

function MultiplayerLobby({ onStartGame, onBackToSingle, existingRoom = null, existingPlayer = null }) {
  const [stage, setStage] = useState(existingRoom && existingPlayer ? 'lobby' : 'setup'); // setup, lobby
  const [playerName, setPlayerName] = useState(existingPlayer?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(existingPlayer?.avatar || '😀');
  const [currentPlayer, setCurrentPlayer] = useState(existingPlayer);
  const [room, setRoom] = useState(existingRoom);
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [hasStartedGame, setHasStartedGame] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  useEffect(() => {
    // Skip if we already have an existing room/player (returning from game)
    if (existingRoom && existingPlayer) {
      return;
    }
    
    // Check if joining from URL
    const urlRoomCode = getRoomCodeFromUrl();
    if (urlRoomCode) {
      setRoomCode(urlRoomCode);
    }
    
    // Load available rooms
    loadAvailableRooms();
    
    // Refresh room list every 5 seconds
    const roomRefreshInterval = setInterval(() => {
      loadAvailableRooms();
    }, 5000);
    
    return () => clearInterval(roomRefreshInterval);
  }, [existingRoom, existingPlayer]);
  
  const loadAvailableRooms = async () => {
    try {
      setLoadingRooms(true);
      const rooms = await getActiveRooms();
      console.log('Loaded active rooms:', rooms);
      setAvailableRooms(rooms);
    } catch (error) {
      console.error('Error loading rooms:', error);
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    if (room) {
      // Subscribe to real-time room updates (Firebase or polling)
      const unsubscribeRoom = subscribeToRoom(room.code, (updatedRoom) => {
        setRoom(updatedRoom);
        
        // Only start game if we haven't started yet and game state changed to playing
        if (updatedRoom.gameState === 'playing' && updatedRoom.currentGame && !hasStartedGame) {
          setHasStartedGame(true);
          onStartGame(updatedRoom.currentGame, updatedRoom, currentPlayer);
        }
        
        // Reset flag when returning to lobby
        if (updatedRoom.gameState === 'lobby') {
          setHasStartedGame(false);
        }
      });

      // Set up broadcast listener for local tab sync
      const unsubscribeBroadcast = subscribeToBroadcast((message) => {
        if (message.data.roomCode === room.code) {
          refreshRoom();
        }
      });

      // Activity heartbeat
      const activityInterval = setInterval(() => {
        updatePlayerActivity(room.code, currentPlayer.id);
      }, 5000);

      return () => {
        unsubscribeRoom();
        unsubscribeBroadcast();
        clearInterval(activityInterval);
      };
    }
  }, [room, currentPlayer, hasStartedGame]);

  const refreshRoom = async () => {
    if (room) {
      const updatedRoom = await getRoom(room.code);
      if (updatedRoom) {
        setRoom(updatedRoom);
      } else {
        setError('Room no longer exists');
        setRoom(null);
        setStage('setup');
      }
    }
  };

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    const player = createPlayer(playerName.trim(), selectedAvatar);
    setCurrentPlayer(player);
    
    const newRoom = await createRoom(player);
    if (newRoom) {
      setRoom(newRoom);
      setStage('lobby');
    } else {
      setError('Failed to create room. Please try again.');
    }
  };

  const handleJoinRoom = async () => {
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
      
      const joinedRoom = await joinRoom(roomCode.toUpperCase(), player);
      setRoom(joinedRoom);
      setStage('lobby');
    } catch (err) {
      setError(err.message);
    }
  };
  
  const handleJoinRoomFromList = async (roomToJoin) => {
    if (!playerName.trim()) {
      setError('Please enter your name first');
      return;
    }

    try {
      setError('');
      const player = createPlayer(playerName.trim(), selectedAvatar);
      setCurrentPlayer(player);
      
      const joinedRoom = await joinRoom(roomToJoin.code, player);
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

  const handleSelectGame = async (gameId) => {
    setHasStartedGame(true);
    // Notify Firebase that game is starting
    await startGame(room.code, gameId);
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

            {/* Available Rooms List */}
            {availableRooms.length > 0 && (
              <div className="available-rooms-section">
                <h3>🏠 Available Rooms</h3>
                <div className="available-rooms-list">
                  {availableRooms.map(availRoom => (
                    <div 
                      key={availRoom.code}
                      className={`room-item ${!playerName.trim() ? 'disabled' : ''}`}
                      onClick={() => playerName.trim() && handleJoinRoomFromList(availRoom)}
                    >
                      <div className="room-item-header">
                        <span className="room-code-badge">{availRoom.code}</span>
                        <span className="room-players-count">
                          👥 {availRoom.players?.length || 0}/6
                        </span>
                      </div>
                      <div className="room-item-players">
                        {availRoom.players?.slice(0, 3).map((p, i) => (
                          <span key={i} className="room-player-avatar">{p.avatar}</span>
                        ))}
                        {availRoom.players?.length > 3 && (
                          <span className="room-more-players">+{availRoom.players.length - 3}</span>
                        )}
                      </div>
                      <div className="room-item-status">
                        {availRoom.gameState === 'playing' ? '🎮 Playing' : '⏳ Waiting'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {loadingRooms && availableRooms.length === 0 && (
              <div className="loading-rooms">Loading rooms...</div>
            )}

            {!loadingRooms && availableRooms.length === 0 && (
              <div className="no-rooms-message">
                No active rooms. Create one below! 👇
              </div>
            )}

            <div className="lobby-actions">
              <button
                className="btn btn-primary btn-large"
                onClick={handleCreateRoom}
                disabled={!playerName.trim()}
              >
                Create New Room
              </button>

              <div className="join-section">
                <div className="divider">OR JOIN WITH CODE</div>
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

