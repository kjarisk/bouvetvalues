// Firebase-based multiplayer for cross-device play
import { ref, set, get, onValue, off, remove, update } from 'firebase/database';
import { database, isFirebaseConfigured } from '../firebase-config';

// Fallback to localStorage if Firebase not configured
import * as localMultiplayer from './multiplayer';

const ROOM_EXPIRY = 3600000; // 1 hour

// Check if Firebase is available
const useFirebase = isFirebaseConfigured();
console.log(`🚀 Multiplayer mode: ${useFirebase ? 'FIREBASE (Online)' : 'LocalStorage (Local only)'}`);

// BroadcastChannel for local tab sync (still useful for same-device)
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
  
  // If using Firebase, also subscribe to Firebase updates
  if (useFirebase) {
    // Firebase subscriptions handled per-room
  }
  
  return () => listeners.delete(callback);
};

export const broadcastMessage = (type, data) => {
  initBroadcastChannel();
  broadcastChannel.postMessage({ type, data, timestamp: Date.now() });
};

// Room management with Firebase
export const createRoom = async (hostPlayer) => {
  if (!useFirebase) {
    return localMultiplayer.createRoom(hostPlayer);
  }
  
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
  
  try {
    await set(ref(database, `rooms/${roomCode}`), room);
    broadcastMessage('ROOM_CREATED', room);
    return room;
  } catch (error) {
    console.error('Error creating room:', error);
    return null;
  }
};

export const joinRoom = async (roomCode, player) => {
  if (!useFirebase) {
    return localMultiplayer.joinRoom(roomCode, player);
  }
  
  try {
    const roomRef = ref(database, `rooms/${roomCode}`);
    const snapshot = await get(roomRef);
    
    if (!snapshot.exists()) {
      throw new Error('Room not found');
    }
    
    const room = snapshot.val();
    
    // Check if player already in room
    const existingPlayerIndex = room.players.findIndex(p => p.id === player.id);
    
    if (existingPlayerIndex >= 0) {
      room.players[existingPlayerIndex] = player;
    } else {
      room.players.push(player);
    }
    
    room.lastActivity = Date.now();
    
    await set(roomRef, room);
    broadcastMessage('PLAYER_JOINED', { roomCode, player });
    
    return room;
  } catch (error) {
    console.error('Error joining room:', error);
    throw error;
  }
};

export const leaveRoom = async (roomCode, playerId) => {
  if (!useFirebase) {
    return localMultiplayer.leaveRoom(roomCode, playerId);
  }
  
  try {
    const roomRef = ref(database, `rooms/${roomCode}`);
    const snapshot = await get(roomRef);
    
    if (!snapshot.exists()) return;
    
    const room = snapshot.val();
    room.players = room.players.filter(p => p.id !== playerId);
    room.lastActivity = Date.now();
    
    if (room.players.length === 0) {
      await remove(roomRef);
    } else {
      // Reassign host if needed
      if (room.host === playerId && room.players.length > 0) {
        room.host = room.players[0].id;
      }
      await set(roomRef, room);
    }
    
    broadcastMessage('PLAYER_LEFT', { roomCode, playerId });
  } catch (error) {
    console.error('Error leaving room:', error);
  }
};

export const updatePlayerScore = async (roomCode, playerId, score, game) => {
  if (!useFirebase) {
    return localMultiplayer.updatePlayerScore(roomCode, playerId, score, game);
  }
  
  try {
    const roomRef = ref(database, `rooms/${roomCode}`);
    const snapshot = await get(roomRef);
    
    if (!snapshot.exists()) return;
    
    const room = snapshot.val();
    const playerIndex = room.players.findIndex(p => p.id === playerId);
    
    if (playerIndex >= 0) {
      room.players[playerIndex].currentScore = score;
      room.players[playerIndex].currentGame = game;
      room.players[playerIndex].lastScoreUpdate = Date.now();
      room.lastActivity = Date.now();
      
      await set(roomRef, room);
      broadcastMessage('SCORE_UPDATE', { roomCode, playerId, score, game });
    }
  } catch (error) {
    console.error('Error updating score:', error);
  }
};

export const updateRoomState = async (roomCode, updates) => {
  if (!useFirebase) {
    return localMultiplayer.updateRoomState?.(roomCode, updates);
  }
  
  try {
    const roomRef = ref(database, `rooms/${roomCode}`);
    const snapshot = await get(roomRef);
    
    if (!snapshot.exists()) return;
    
    const room = snapshot.val();
    
    // Apply updates
    Object.assign(room, updates);
    room.lastActivity = Date.now();
    
    await set(roomRef, room);
    broadcastMessage('ROOM_UPDATED', { roomCode, updates });
  } catch (error) {
    console.error('Error updating room state:', error);
  }
};

export const startGame = async (roomCode, gameId) => {
  if (!useFirebase) {
    return localMultiplayer.startGame(roomCode, gameId);
  }
  
  try {
    const roomRef = ref(database, `rooms/${roomCode}`);
    const snapshot = await get(roomRef);
    
    if (!snapshot.exists()) return;
    
    const room = snapshot.val();
    room.currentGame = gameId;
    room.gameState = 'playing';
    room.gameStartTime = Date.now();
    
    // Reset current scores for new game
    room.players.forEach(p => {
      p.currentScore = 0;
      p.currentGame = gameId;
    });
    
    room.lastActivity = Date.now();
    
    await set(roomRef, room);
    broadcastMessage('GAME_STARTED', { roomCode, gameId });
  } catch (error) {
    console.error('Error starting game:', error);
  }
};

export const finalizeGameScores = async (roomCode) => {
  if (!useFirebase) {
    return localMultiplayer.finalizeGameScores?.(roomCode);
  }
  
  try {
    const roomRef = ref(database, `rooms/${roomCode}`);
    const snapshot = await get(roomRef);
    
    if (!snapshot.exists()) return;
    
    const room = snapshot.val();
    
    // Add current scores to total scores
    room.players.forEach(p => {
      p.totalScore = (p.totalScore || 0) + (p.currentScore || 0);
      p.currentScore = 0;
      p.currentGame = null;
    });
    
    room.lastActivity = Date.now();
    
    await set(roomRef, room);
    broadcastMessage('GAME_FINALIZED', { roomCode });
  } catch (error) {
    console.error('Error finalizing scores:', error);
  }
};

export const endGame = async (roomCode) => {
  if (!useFirebase) {
    return localMultiplayer.endGame(roomCode);
  }
  
  try {
    const roomRef = ref(database, `rooms/${roomCode}`);
    const snapshot = await get(roomRef);
    
    if (!snapshot.exists()) return;
    
    const room = snapshot.val();
    room.gameState = 'lobby';
    room.currentGame = null;
    room.lastActivity = Date.now();
    
    await set(roomRef, room);
    broadcastMessage('GAME_ENDED', { roomCode });
  } catch (error) {
    console.error('Error ending game:', error);
  }
};

export const updatePlayerActivity = async (roomCode, playerId) => {
  if (!useFirebase) {
    return localMultiplayer.updatePlayerActivity(roomCode, playerId);
  }
  
  try {
    const roomRef = ref(database, `rooms/${roomCode}/players`);
    const snapshot = await get(roomRef);
    
    if (!snapshot.exists()) return;
    
    const players = snapshot.val();
    const playerIndex = players.findIndex(p => p.id === playerId);
    
    if (playerIndex >= 0) {
      players[playerIndex].lastActivity = Date.now();
      await update(ref(database, `rooms/${roomCode}`), {
        players: players,
        lastActivity: Date.now()
      });
    }
  } catch (error) {
    console.error('Error updating activity:', error);
  }
};

export const getRoom = async (roomCode) => {
  if (!useFirebase) {
    return localMultiplayer.getRoom(roomCode);
  }
  
  try {
    const snapshot = await get(ref(database, `rooms/${roomCode}`));
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error('Error getting room:', error);
    return null;
  }
};

// Subscribe to room updates in real-time
export const subscribeToRoom = (roomCode, callback) => {
  if (!useFirebase) {
    // Fallback: use interval polling
    const interval = setInterval(async () => {
      const room = await getRoom(roomCode);
      if (room) callback(room);
    }, 2000);
    return () => clearInterval(interval);
  }
  
  const roomRef = ref(database, `rooms/${roomCode}`);
  onValue(roomRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    }
  });
  
  return () => off(roomRef);
};

export const getActiveRooms = async () => {
  console.log('🔍 getActiveRooms called, useFirebase:', useFirebase);
  
  if (!useFirebase) {
    const rooms = localMultiplayer.getActiveRooms();
    console.log('🔍 [Wrapper] LocalStorage rooms:', rooms);
    return rooms;
  }
  
  try {
    console.log('🔍 [Firebase] Fetching rooms...');
    const snapshot = await get(ref(database, 'rooms'));
    if (!snapshot.exists()) {
      console.log('🔍 [Firebase] No rooms exist');
      return [];
    }
    
    const rooms = snapshot.val();
    const now = Date.now();
    const ONE_HOUR = 60 * 60 * 1000;
    
    console.log('🔍 [Firebase] Raw rooms:', rooms);
    
    // Filter out expired rooms and return active ones
    const activeRooms = Object.values(rooms).filter(room => {
      // Keep rooms that are less than 1 hour old
      const isRecent = (now - room.lastActivity) < ONE_HOUR;
      // Keep rooms with at least one player
      const hasPlayers = room.players && (Array.isArray(room.players) ? room.players.length > 0 : Object.keys(room.players).length > 0);
      const keep = isRecent && hasPlayers;
      console.log(`🔍 [Firebase] Room ${room.code}: isRecent=${isRecent}, hasPlayers=${hasPlayers}, keep=${keep}`);
      return keep;
    });
    
    console.log('🔍 [Firebase] Active rooms after filtering:', activeRooms);
    return activeRooms;
  } catch (error) {
    console.error('❌ [Firebase] Error getting active rooms:', error);
    return [];
  }
};

// Helper functions
const generateRoomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
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

export const getRoomLink = (roomCode) => {
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?room=${roomCode}`;
};

export const getRoomCodeFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('room');
};

