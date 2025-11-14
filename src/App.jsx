import { useState } from 'react';
import HomePage from './components/HomePage';
import MultiplayerLobby from './components/MultiplayerLobby';
import MultiplayerGame from './components/MultiplayerGame';
import JordnaerGame from './components/games/JordnaerGame';
import EntusiastiskGame from './components/games/EntusiastiskGame';
import DelingskultureGame from './components/games/DelingskultureGame';
import FrihetGame from './components/games/FrihetGame';
import TroverdighetGame from './components/games/TroverdighetGame';

function App() {
  const [mode, setMode] = useState('home'); // home, singlePlayer, multiplayer, game
  const [currentGame, setCurrentGame] = useState(null);
  const [multiplayerData, setMultiplayerData] = useState(null); // { room, player }

  const games = [
    {
      id: 'jordnaer',
      title: 'Jordnær',
      subtitle: 'Down to Earth',
      description: 'Fall from the sky and avoid buzzwords while collecting real customer needs!',
      icon: '🌍',
      component: JordnaerGame
    },
    {
      id: 'entusiastisk',
      title: 'Entusiastisk',
      subtitle: 'Enthusiasm',
      description: 'Keep the energy high! Tap to hype phrases and avoid negativity blocks.',
      icon: '⚡',
      component: EntusiastiskGame
    },
    {
      id: 'delingskultur',
      title: 'Delingskultur',
      subtitle: 'Sharing Culture',
      description: 'Share knowledge blocks to solve puzzles together!',
      icon: '🤝',
      component: DelingskultureGame
    },
    {
      id: 'frihet',
      title: 'Frihet',
      subtitle: 'Freedom',
      description: 'Build freely! Create weird solutions and let creativity flow.',
      icon: '🎨',
      component: FrihetGame
    },
    {
      id: 'troverdighet',
      title: 'Troverdighet',
      subtitle: 'Trust',
      description: 'Spot the bullshit! Choose which statements are credible.',
      icon: '🎯',
      component: TroverdighetGame
    }
  ];

  const handleSinglePlayer = () => {
    setMode('singlePlayer');
  };

  const handleMultiplayer = () => {
    setMode('multiplayer');
  };

  const handleGameSelect = (gameId) => {
    setCurrentGame(gameId);
    setMode('game');
  };

  const handleMultiplayerGameStart = (gameId, room, player) => {
    setCurrentGame(gameId);
    setMultiplayerData({ room, player });
    setMode('game');
  };

  const handleBackToHome = () => {
    setCurrentGame(null);
    setMultiplayerData(null);
    setMode('home');
  };

  const handleBackToLobby = () => {
    setCurrentGame(null);
    setMode('multiplayer');
  };

  if (mode === 'multiplayer') {
    return (
      <MultiplayerLobby
        onStartGame={handleMultiplayerGameStart}
        onBackToSingle={handleBackToHome}
      />
    );
  }

  if (mode === 'game' && currentGame) {
    const game = games.find(g => g.id === currentGame);
    const GameComponent = game.component;
    
    if (multiplayerData) {
      return (
        <MultiplayerGame
          gameId={currentGame}
          GameComponent={GameComponent}
          room={multiplayerData.room}
          player={multiplayerData.player}
          onBack={handleBackToLobby}
        />
      );
    }
    
    return <GameComponent gameId={currentGame} onBack={handleBackToHome} />;
  }

  if (mode === 'singlePlayer') {
    return <HomePage games={games} onGameSelect={handleGameSelect} onBack={handleBackToHome} />;
  }

  // Home screen with mode selection
  return (
    <div className="app-container">
      <div className="home-container">
        <header className="header">
          <h1>🎮 Bouvet Values Arcade</h1>
          <p>Play mini-games, learn values, compete for glory!</p>
        </header>
        
        <div className="mode-selection">
          <div className="mode-card" onClick={handleSinglePlayer}>
            <div className="mode-icon">🎯</div>
            <h2>Single Player</h2>
            <p>Play solo and compete on the global leaderboard</p>
          </div>
          
          <div className="mode-card" onClick={handleMultiplayer}>
            <div className="mode-icon">👥</div>
            <h2>Multiplayer</h2>
            <p>Create or join a room and compete with friends in real-time!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

