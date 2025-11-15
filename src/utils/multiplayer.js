// Multiplayer management using localStorage and BroadcastChannel

const STORAGE_KEY = 'bouvetArcadeMultiplayer';
const ROOM_EXPIRY = 3600000; // 1 hour

// BroadcastChannel for real-time updates across tabs
let broadcastChannel = null;
const listeners = new Set();

export const initBroadcastChannel = () => {
  if (!broadcastChannel) {
    broadcastChannel = new BroadcastChannel('bouvet-arcade-channel');
    broadcastChannel.onmessage = (event) => {
      listeners.forEach(listener => listener(event.data));
    };
  }
  return broadcastChannel;
};

export const subscribeToBroadcast = (callback) => {
  initBroadcastChannel();
  listeners.add(callback);
  return () => listeners.delete(callback);
};

export const broadcastMessage = (type, data) => {
  initBroadcastChannel();
  broadcastChannel.postMessage({ type, data, timestamp: Date.now() });
};

// Room management
export const createRoom = (hostPlayer) => {
  const roomCode = generateRoomCode();
  const room = {
    code: roomCode,
    host: hostPlayer.id,
    players: [hostPlayer],
    currentGame: null,
    gameState: 'lobby',
    createdAt: Date.now(),
    lastActivity: Date.now()
  };
  
  console.log('🏠 [LocalStorage] Creating room:', room);
  saveRoom(room);
  broadcastMessage('ROOM_CREATED', room);
  console.log('🏠 [LocalStorage] Room saved, broadcasting...');
  return room;
};

export const joinRoom = (roomCode, player) => {
  const room = getRoom(roomCode);
  if (!room) {
    throw new Error('Room not found');
  }
  
  // Check if player already in room
  const existingPlayer = room.players.find(p => p.id === player.id);
  if (existingPlayer) {
    // Update player info
    room.players = room.players.map(p => p.id === player.id ? player : p);
  } else {
    room.players.push(player);
  }
  
  room.lastActivity = Date.now();
  saveRoom(room);
  broadcastMessage('PLAYER_JOINED', { roomCode, player });
  return room;
};

export const leaveRoom = (roomCode, playerId) => {
  const room = getRoom(roomCode);
  if (!room) return;
  
  room.players = room.players.filter(p => p.id !== playerId);
  room.lastActivity = Date.now();
  
  if (room.players.length === 0) {
    deleteRoom(roomCode);
  } else {
    // If host left, assign new host
    if (room.host === playerId && room.players.length > 0) {
      room.host = room.players[0].id;
    }
    saveRoom(room);
  }
  
  broadcastMessage('PLAYER_LEFT', { roomCode, playerId });
};

export const updatePlayerScore = (roomCode, playerId, score, game) => {
  const room = getRoom(roomCode);
  if (!room) return;
  
  const player = room.players.find(p => p.id === playerId);
  if (player) {
    player.currentScore = score;
    player.currentGame = game;
    player.lastScoreUpdate = Date.now();
    room.lastActivity = Date.now();
    saveRoom(room);
    broadcastMessage('SCORE_UPDATE', { roomCode, playerId, score, game });
  }
};

export const startGame = (roomCode, gameId) => {
  const room = getRoom(roomCode);
  if (!room) return;
  
  room.currentGame = gameId;
  room.gameState = 'playing';
  room.gameStartTime = Date.now();
  
  // Reset all players' current scores
  room.players.forEach(p => {
    p.currentScore = 0;
    p.currentGame = gameId;
  });
  
  room.lastActivity = Date.now();
  saveRoom(room);
  broadcastMessage('GAME_STARTED', { roomCode, gameId });
};

export const endGame = (roomCode) => {
  const room = getRoom(roomCode);
  if (!room) return;
  
  room.gameState = 'lobby';
  room.currentGame = null;
  room.lastActivity = Date.now();
  saveRoom(room);
  broadcastMessage('GAME_ENDED', { roomCode });
};

export const updatePlayerActivity = (roomCode, playerId) => {
  const room = getRoom(roomCode);
  if (!room) return;
  
  const player = room.players.find(p => p.id === playerId);
  if (player) {
    player.lastActivity = Date.now();
    room.lastActivity = Date.now();
    saveRoom(room);
  }
};

// Storage helpers
const saveRoom = (room) => {
  const data = getAllRooms();
  data[room.code] = room;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const getAllRooms = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  const data = stored ? JSON.parse(stored) : {};
  
  // Clean up expired rooms
  const now = Date.now();
  Object.keys(data).forEach(code => {
    if (now - data[code].lastActivity > ROOM_EXPIRY) {
      delete data[code];
    }
  });
  
  return data;
};

export const getRoom = (roomCode) => {
  const data = getAllRooms();
  return data[roomCode] || null;
};

const deleteRoom = (roomCode) => {
  const data = getAllRooms();
  delete data[roomCode];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  broadcastMessage('ROOM_DELETED', { roomCode });
};

export const getActiveRooms = () => {
  const data = getAllRooms();
  const rooms = Object.values(data);
  console.log('🔍 [LocalStorage] getAllRooms data:', data);
  console.log('🔍 [LocalStorage] Returning rooms:', rooms);
  return rooms;
};

// Helper functions
const generateRoomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Check if code already exists
  if (getRoom(code)) {
    return generateRoomCode();
  }
  
  return code;
};

export const generatePlayerId = () => {
  return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const createPlayer = (name, avatar) => {
  return {
    id: generatePlayerId(),
    name,
    avatar,
    currentScore: 0,
    totalScore: 0,
    currentGame: null,
    lastActivity: Date.now(),
    joinedAt: Date.now()
  };
};

// Get shareable room link
export const getRoomLink = (roomCode) => {
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?room=${roomCode}`;
};

// Parse room code from URL
export const getRoomCodeFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('room');
};

